import asyncio
import json
import logging
from collections.abc import AsyncIterator
from datetime import timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.companion import stream_companion
from app.agents.provider.base import ChatMessage, LLMProvider
from app.agents.provider.openai_compat import (
    OpenAICompatibleProvider,
)
from app.agents.safety.service import assess
from app.core.config import settings
from app.core.logging import log_event
from app.db.base import utcnow
from app.db.session import SessionFactory
from app.modules.talk.models import Conversation, Message
from app.modules.talk.repository import (
    add_message,
    get_or_create_conversation,
    list_messages,
    persist_message_signals,
)
from app.modules.talk.safety_models import SafetyAssessment


# 5:00 -- must match the frontend's own countdown constant
# (src/app/(app)/talk/CrisisScreen.tsx).
COUNTDOWN_SECONDS = 300


logger = logging.getLogger(__name__)


CRISIS_RESPONSE = (
    "I’m really glad you told me. "
    "If you might hurt yourself or you’re in immediate danger, "
    "please move somewhere you’re not alone and contact local "
    "emergency or crisis support, or someone you trust, right now. "
    "You can also use the Help Now option in Mind.AI."
)


GENERIC_FAILURE = (
    "I’m sorry — I couldn’t respond just now. "
    "Your message was saved. Please try again."
)


MEDICATION_RESPONSE = (
    "I can’t give medication advice. "
    "A qualified doctor or pharmacist can help you decide "
    "what is appropriate and safe. "
    "If you tell me what you’re experiencing, "
    "I can help you think through what support might help."
)


MEDICATION_TERMS = (
    "medication",
    "medicine",
    "tablet",
    "pill",
    "dose",
    "dosage",
    "antidepressant",
    "ssri",
    "benzodiazepine",
    "prozac",
    "sertraline",
    "escitalopram",
    "alprazolam",
    "clonazepam",
)


MEDICATION_ADVICE_TERMS = (
    "take",
    "start",
    "stop",
    "increase",
    "decrease",
    "change",
    "prescribe",
    "should i",
)


def contains_medication_advice(
    text: str,
) -> bool:

    lowered = text.lower()

    has_medication_term = any(
        term in lowered
        for term in MEDICATION_TERMS
    )

    has_advice_term = any(
        term in lowered
        for term in MEDICATION_ADVICE_TERMS
    )

    return has_medication_term and has_advice_term


def sse(
    event: str,
    data: dict,
) -> str:

    return (
        f"event: {event}\n"
        f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
    )


async def load_active_conversation(
    session: AsyncSession,
    user_id: UUID,
) -> tuple[
    Conversation | None,
    list[Message],
]:

    # Lazy sweep: a countdown whose client disappeared mid-count (tab
    # closed, connection dropped) never calls .../expire itself. This is
    # the fallback -- the next time this student touches the backend at
    # all, anything stale gets resolved on the way through.
    await expire_stale_countdowns(session, user_id)

    conversation = await session.scalar(
        select(Conversation)
        .where(
            Conversation.user_id == user_id,
        )
        .order_by(
            Conversation.last_message_at.desc().nullslast(),
            Conversation.created_at.desc(),
        )
        .limit(1)
    )

    if conversation is None:
        return None, []

    messages = await list_messages(
        session,
        user_id,
        conversation.id,
    )

    return conversation, messages


async def persist_assistant(
    user_id: UUID,
    conversation_id: UUID,
    content: str,
) -> Message:

    async with SessionFactory() as session:

        message = await add_message(
            session,
            user_id=user_id,
            conversation_id=conversation_id,
            role="assistant",
            content=content,
        )

        await session.commit()

        return message


async def persist_safety(
    user_id: UUID,
    conversation_id: UUID,
    message_id: UUID,
    result,
) -> UUID:

    async with SessionFactory() as session:

        assessment = SafetyAssessment(
            user_id=user_id,
            conversation_id=conversation_id,
            message_id=message_id,
            lexicon_tier=result.lexicon_tier,
            classifier_tier=result.classifier_tier,
            tier=result.tier,
            tier3_kind=result.tier3_kind,
            reason_code=result.reason_code,
            confidence=result.confidence,
            model=result.model,
            review_status=(
                "pending"
                if result.tier >= 3
                else "not_required"
            ),
            # The countdown starts the instant the verdict does -- same
            # moment the crisis screen appears client-side. created_at
            # (below, via Timestamped) doubles as "when it started".
            countdown_status=(
                "pending"
                if result.tier3_kind == "3b"
                else None
            ),
        )

        session.add(assessment)

        await session.commit()

        return assessment.id


async def resolve_countdown(
    session: AsyncSession,
    user_id: UUID,
    assessment_id: UUID,
    outcome: str,
) -> None:
    """outcome: "cancelled" | "expired". A no-op, not an error, if the row
    isn't this user's, was never a 3b countdown, or is already resolved --
    idempotent against a retried request and against racing the lazy sweep
    below."""

    assessment = await session.get(SafetyAssessment, assessment_id)

    if assessment is None or assessment.user_id != user_id:
        return

    if assessment.countdown_status != "pending":
        return

    assessment.countdown_status = outcome
    assessment.countdown_resolved_at = utcnow()

    await session.flush()


async def expire_stale_countdowns(
    session: AsyncSession,
    user_id: UUID,
) -> None:
    """The lazy half of the countdown: a client that disappears mid-count
    never calls resolve_countdown itself. Run on every request that means
    "this student is back" (loading Talk, sending a message) so a stale
    pending countdown doesn't sit unresolved forever."""

    cutoff = utcnow() - timedelta(seconds=COUNTDOWN_SECONDS)

    stale = await session.scalars(
        select(SafetyAssessment).where(
            SafetyAssessment.user_id == user_id,
            SafetyAssessment.countdown_status == "pending",
            SafetyAssessment.created_at < cutoff,
        )
    )

    now = utcnow()

    for assessment in stale:
        assessment.countdown_status = "expired"
        assessment.countdown_resolved_at = now

    await session.flush()


async def send_message_stream(
    session: AsyncSession,
    user_id: UUID,
    text: str,
    conversation_id: UUID | None,
    language: str = "en",
    provider: LLMProvider | None = None,
) -> AsyncIterator[str]:
    """`provider` is injectable so tests can substitute a fake LLMProvider
    instead of requiring a live Ollama server. The router never passes one,
    so production behaviour (a real OpenAICompatibleProvider) is unchanged."""

    clean = text.strip()

    if not clean:
        return

    # Sending a message means "this student is back" just as much as
    # loading the conversation does.
    await expire_stale_countdowns(session, user_id)

    conversation = await get_or_create_conversation(
        session,
        user_id,
        conversation_id,
    )

    user_message = await add_message(
        session,
        user_id=user_id,
        conversation_id=conversation.id,
        role="user",
        content=clean,
    )

    # SIGNAL reads the student's own message, same pass that persists it --
    # not gated behind Safety or Companion, so a failure in either agent never
    # prevents the observation from being recorded.
    await persist_message_signals(session, user_id, user_message)

    await session.commit()

    rows = await list_messages(
        session,
        user_id,
        conversation.id,
    )

    history = [
        ChatMessage(
            role=row.role,
            content=row.content,
        )
        for row in rows
    ]

    # History BEFORE the current user message.
    recent_history = history[:-1]

    # None until the task actually exists. The except blocks below check
    # this before cancelling -- a failure during provider construction, which
    # now happens inside this try, means the task was never created.
    companion_task: asyncio.Task[None] | None = None

    try:
        # A misconfigured provider (LLM_BASE_URL/LLM_MODEL unset) raises here,
        # before any task exists to cancel -- caught by the same handler as
        # every other mid-stream failure, so it still reaches the student as
        # a graceful message rather than an unhandled exception killing the
        # SSE connection with no event at all.
        if provider is None:
            provider = OpenAICompatibleProvider()

        # Start both independently.
        safety_task = asyncio.create_task(
            assess(
                provider,
                clean,
                recent_history,
            )
        )

        companion_queue: asyncio.Queue[
            str | None
        ] = asyncio.Queue()

        async def companion_worker() -> None:

            try:
                async for token in stream_companion(
                    provider,
                    history,
                    language,
                ):
                    await companion_queue.put(token)

            except Exception as exc:

                log_event(
                    logger,
                    "talk.companion_failed",
                    user_id=str(user_id),
                    error=type(exc).__name__,
                )

                await companion_queue.put(None)

                return

            await companion_queue.put(None)

        companion_task = asyncio.create_task(
            companion_worker()
        )

        safety = await safety_task

        safety_assessment_id = await persist_safety(
            user_id,
            conversation.id,
            user_message.id,
            safety,
        )

        log_event(
            logger,
            "talk.safety_assessed",
            user_id=str(user_id),
            tier=safety.tier,
            reason_code=safety.reason_code,
        )

        yield sse(
            "meta",
            {
                "conversation_id": str(
                    conversation.id
                ),
                "message_id": str(
                    user_message.id
                ),
                "safety_tier": safety.tier,
                "tier3_kind": safety.tier3_kind,
                "safety_assessment_id": str(
                    safety_assessment_id
                ),
            },
        )

        # Tier 3 completely suppresses Companion.
        if safety.tier >= 3:

            if companion_task is not None:
                companion_task.cancel()
                await asyncio.gather(
                    companion_task,
                    return_exceptions=True,
                )

            crisis_message = await persist_assistant(
                user_id,
                conversation.id,
                CRISIS_RESPONSE,
            )

            yield sse(
                "token",
                {"text": CRISIS_RESPONSE},
            )

            yield sse(
                "done",
                {
                    "message_id": str(crisis_message.id),
                    "safety_tier": 3,
                    "tier3_kind": safety.tier3_kind,
                },
            )

            return

        # Medication advice is blocked before model output.
        if contains_medication_advice(clean):

            if companion_task is not None:
                companion_task.cancel()
                await asyncio.gather(
                    companion_task,
                    return_exceptions=True,
                )

            medication_message = await persist_assistant(
                user_id,
                conversation.id,
                MEDICATION_RESPONSE,
            )

            yield sse(
                "token",
                {"text": MEDICATION_RESPONSE},
            )

            yield sse(
                "done",
                {
                    "message_id": str(medication_message.id),
                    "safety_tier": safety.tier,
                },
            )

            return

        assistant_parts: list[str] = []

        while True:

            token = await companion_queue.get()

            if token is None:
                break

            assistant_parts.append(token)

            yield sse(
                "token",
                {"text": token},
            )

        await companion_task

        reply = "".join(
            assistant_parts
        ).strip()

        if not reply:

            reply = GENERIC_FAILURE

        # HARD output filter.
        if contains_medication_advice(reply):
            reply = MEDICATION_RESPONSE

        assistant_message = await persist_assistant(
            user_id,
            conversation.id,
            reply,
        )

        yield sse(
            "done",
            {
                "message_id": str(assistant_message.id),
                "safety_tier": safety.tier,
            },
        )

    except asyncio.CancelledError:

        if companion_task is not None:
            companion_task.cancel()
            await asyncio.gather(
                companion_task,
                return_exceptions=True,
            )

        raise

    except Exception as exc:

        if companion_task is not None:
            companion_task.cancel()
            await asyncio.gather(
                companion_task,
                return_exceptions=True,
            )

        log_event(
            logger,
            "talk.failed",
            user_id=str(user_id),
            error=type(exc).__name__,
        )

        failure_message = await persist_assistant(
            user_id,
            conversation.id,
            GENERIC_FAILURE,
        )

        yield sse(
            "token",
            {"text": GENERIC_FAILURE},
        )

        yield sse(
            "error",
            {"message": GENERIC_FAILURE},
        )

        yield sse(
            "done",
            {
                "message_id": str(failure_message.id),
                "safety_tier": 0,
            },
        )