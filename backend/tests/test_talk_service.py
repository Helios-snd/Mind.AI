"""send_message_stream: the actual orchestration -- Safety and Companion
dispatched together, the verdict gating what the student sees, every
verdict persisted regardless of what happened to the reply.
"""

import uuid
from datetime import timedelta

from sqlalchemy import select

from app.db.base import utcnow
from app.modules.checkins.models import Signal
from app.modules.talk.models import Conversation, Message
from app.modules.talk.safety_models import SafetyAssessment
from app.modules.talk.service import (
    COUNTDOWN_SECONDS,
    expire_stale_countdowns,
    load_active_conversation,
    resolve_countdown,
    send_message_stream,
)
from app.modules.users.models import User
from tests.fakes import FakeProvider, collect_sse


async def _make_user(session) -> User:
    user = User()
    session.add(user)
    await session.flush()
    await session.commit()
    return user


async def _make_message(session, user) -> Message:
    """A real conversation + message row, since safety_assessments'
    conversation_id/message_id are enforced foreign keys -- a stray random
    UUID fails on flush against real Postgres, not silently."""
    conversation = Conversation(user_id=user.id)
    session.add(conversation)
    await session.flush()

    message = Message(
        conversation_id=conversation.id,
        user_id=user.id,
        role="user",
        content="test",
        sequence=1,
    )
    session.add(message)
    await session.flush()
    return message


async def test_an_ordinary_message_streams_the_companion_reply(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider(companion_tokens=["Let's ", "break ", "this ", "down."])

    events = await collect_sse(
        send_message_stream(session, user.id, "I'm stressed about my exam", None, provider=provider)
    )

    kinds = [e["event"] for e in events]
    assert kinds[0] == "meta"
    assert kinds[-1] == "done"
    assert kinds.count("token") == 4
    assert "".join(e["data"]["text"] for e in events if e["event"] == "token") == (
        "Let's break this down."
    )
    assert events[0]["data"]["safety_tier"] == 0
    assert events[-1]["data"]["safety_tier"] == 0
    assert events[-1]["data"]["message_id"] != "persisted"  # a real UUID now
    uuid.UUID(events[-1]["data"]["message_id"])  # does not raise


async def test_the_reply_is_actually_persisted_and_readable_back(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider(companion_tokens=["Hi there."])

    events = await collect_sse(
        send_message_stream(session, user.id, "hello", None, provider=provider)
    )
    conversation_id = uuid.UUID(events[0]["data"]["conversation_id"])

    rows = (
        await session.scalars(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.sequence)
        )
    ).all()
    assert [(r.role, r.content) for r in rows] == [
        ("user", "hello"),
        ("assistant", "Hi there."),
    ]


async def test_safety_is_persisted_even_though_the_reply_is_shown(
    session, patch_talk_session_factory
):
    """Both dispatched, both land -- not just whichever one the student sees."""
    user = await _make_user(session)
    provider = FakeProvider(
        companion_tokens=["Okay."],
        classifier_response={"tier": 0, "reason_code": "none", "confidence": 0.8},
    )

    events = await collect_sse(
        send_message_stream(session, user.id, "just an ordinary day", None, provider=provider)
    )
    message_id = uuid.UUID(events[0]["data"]["message_id"])

    assessment = (
        await session.scalars(
            select(SafetyAssessment).where(SafetyAssessment.message_id == message_id)
        )
    ).one()
    assert assessment.tier == 0
    assert assessment.review_status == "not_required"


async def test_signal_is_extracted_from_the_users_own_message(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider(companion_tokens=["I hear you."])

    await collect_sse(
        send_message_stream(
            session, user.id, "I only slept 4 hours and feel so lonely", None, provider=provider
        )
    )

    rows = (await session.scalars(select(Signal).where(Signal.user_id == user.id))).all()
    kinds = {r.kind for r in rows}
    assert "sleep" in kinds
    assert "social_withdrawal" in kinds
    assert all(r.source_type == "message" for r in rows)


async def test_tier_3_suppresses_companion_and_shows_the_crisis_response(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider(
        companion_tokens=["This should never reach the student."],
        classifier_response={"tier": 0, "reason_code": "none", "confidence": 0.5},
    )

    events = await collect_sse(
        send_message_stream(session, user.id, "I want to kill myself", None, provider=provider)
    )

    tokens = "".join(e["data"]["text"] for e in events if e["event"] == "token")
    assert "This should never reach the student." not in tokens
    assert "Help Now" in tokens or "emergency" in tokens.lower()
    assert events[-1]["data"]["safety_tier"] == 3

    # The lexicon alone was enough -- the classifier's "0" does not matter.
    message_id = uuid.UUID(events[0]["data"]["message_id"])
    assessment = (
        await session.scalars(
            select(SafetyAssessment).where(SafetyAssessment.message_id == message_id)
        )
    ).one()
    assert assessment.tier == 3
    assert assessment.lexicon_tier == 3
    assert assessment.review_status == "pending"


async def test_tier_3_persists_the_crisis_response_as_the_assistant_message(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider(companion_tokens=["irrelevant"])

    events = await collect_sse(
        send_message_stream(session, user.id, "I want to end my life", None, provider=provider)
    )
    conversation_id = uuid.UUID(events[0]["data"]["conversation_id"])

    assistant_rows = (
        await session.scalars(
            select(Message).where(
                Message.conversation_id == conversation_id, Message.role == "assistant"
            )
        )
    ).all()
    assert len(assistant_rows) == 1
    assert "kill myself" not in assistant_rows[0].content.lower()


async def test_medication_advice_is_blocked_before_the_model_is_asked_to_answer(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider(companion_tokens=["you should take 10mg"])

    events = await collect_sse(
        send_message_stream(
            session, user.id, "should I stop taking my medication?", None, provider=provider
        )
    )

    tokens = "".join(e["data"]["text"] for e in events if e["event"] == "token")
    assert "you should take 10mg" not in tokens
    assert "qualified doctor" in tokens or "pharmacist" in tokens


async def test_medication_advice_is_also_caught_if_the_model_says_it_anyway(
    session, patch_talk_session_factory
):
    """The hard output filter: even a message that doesn't trip the input
    heuristic gets its reply checked before it reaches the student."""
    user = await _make_user(session)
    provider = FakeProvider(
        companion_tokens=["You should ", "start taking ", "a higher dose."]
    )

    events = await collect_sse(
        send_message_stream(session, user.id, "I feel awful today", None, provider=provider)
    )

    # Tokens ARE streamed live as they arrive (before the filter can run on
    # the complete reply), but what gets PERSISTED is filtered.
    conversation_id = uuid.UUID(events[0]["data"]["conversation_id"])
    assistant = (
        await session.scalars(
            select(Message).where(
                Message.conversation_id == conversation_id, Message.role == "assistant"
            )
        )
    ).one()
    assert "higher dose" not in assistant.content
    assert "qualified doctor" in assistant.content


async def test_a_companion_failure_still_persists_a_safety_verdict(
    session, patch_talk_session_factory
):
    """Companion crashing must not take Safety down with it."""
    user = await _make_user(session)
    provider = FakeProvider(raise_on_stream=RuntimeError("model crashed"))

    events = await collect_sse(
        send_message_stream(session, user.id, "a normal message", None, provider=provider)
    )

    assert events[-1]["event"] == "done"
    message_id = uuid.UUID(events[0]["data"]["message_id"])
    assessment = (
        await session.scalars(
            select(SafetyAssessment).where(SafetyAssessment.message_id == message_id)
        )
    ).one()
    assert assessment.tier == 0  # an ordinary message, correctly assessed


async def test_a_companion_failure_falls_back_to_the_generic_message(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider(raise_on_stream=RuntimeError("model crashed"))

    events = await collect_sse(
        send_message_stream(session, user.id, "hello", None, provider=provider)
    )

    conversation_id = uuid.UUID(events[0]["data"]["conversation_id"])
    assistant = (
        await session.scalars(
            select(Message).where(
                Message.conversation_id == conversation_id, Message.role == "assistant"
            )
        )
    ).one()
    assert "couldn" in assistant.content.lower() or "try again" in assistant.content.lower()


async def test_a_second_message_continues_the_same_conversation(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider(companion_tokens=["ok"])

    first = await collect_sse(
        send_message_stream(session, user.id, "first message", None, provider=provider)
    )
    conversation_id = first[0]["data"]["conversation_id"]

    second = await collect_sse(
        send_message_stream(session, user.id, "second message", None, provider=provider)
    )
    assert second[0]["data"]["conversation_id"] == conversation_id

    rows = (
        await session.scalars(
            select(Message)
            .where(Message.conversation_id == uuid.UUID(conversation_id))
            .order_by(Message.sequence)
        )
    ).all()
    assert [r.content for r in rows] == ["first message", "ok", "second message", "ok"]


async def test_companion_receives_the_full_conversation_history(
    session, patch_talk_session_factory
):
    """The point of persistence: turn two must not look like turn one to the
    model -- Companion is explicitly required to use prior context."""
    user = await _make_user(session)
    provider = FakeProvider(companion_tokens=["ok"])

    await collect_sse(send_message_stream(session, user.id, "I have an exam tomorrow", None, provider=provider))
    await collect_sse(send_message_stream(session, user.id, "I can't concentrate", None, provider=provider))

    second_call_messages = provider.stream_calls[-1]
    contents = [m.content for m in second_call_messages]
    assert "I have an exam tomorrow" in contents
    assert "I can't concentrate" in contents


async def test_an_empty_message_produces_no_events_and_nothing_persisted(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider()

    events = await collect_sse(
        send_message_stream(session, user.id, "   ", None, provider=provider)
    )
    assert events == []
    assert (await session.scalars(select(Conversation).where(Conversation.user_id == user.id))).first() is None


# --- the tier-3b countdown (E3) ----------------------------------------------


async def test_a_3b_message_starts_a_pending_countdown(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider()

    events = await collect_sse(
        send_message_stream(
            session,
            user.id,
            "I want to kill myself, I have the pills",
            None,
            provider=provider,
        )
    )

    assert events[0]["data"]["tier3_kind"] == "3b"
    assessment_id = uuid.UUID(events[0]["data"]["safety_assessment_id"])

    assessment = await session.get(SafetyAssessment, assessment_id)
    assert assessment.countdown_status == "pending"
    assert assessment.countdown_resolved_at is None


async def test_a_3a_message_has_no_countdown(session, patch_talk_session_factory):
    user = await _make_user(session)
    provider = FakeProvider()

    events = await collect_sse(
        send_message_stream(session, user.id, "I want to kill myself", None, provider=provider)
    )

    assert events[0]["data"]["tier3_kind"] == "3a"
    assessment_id = uuid.UUID(events[0]["data"]["safety_assessment_id"])

    assessment = await session.get(SafetyAssessment, assessment_id)
    assert assessment.countdown_status is None


async def test_an_ordinary_message_has_no_assessment_countdown_state(
    session, patch_talk_session_factory
):
    user = await _make_user(session)
    provider = FakeProvider()

    events = await collect_sse(
        send_message_stream(session, user.id, "hi there", None, provider=provider)
    )

    assessment_id = uuid.UUID(events[0]["data"]["safety_assessment_id"])
    assessment = await session.get(SafetyAssessment, assessment_id)
    assert assessment.tier3_kind is None
    assert assessment.countdown_status is None


async def test_resolve_countdown_cancels_a_pending_one(session):
    user = await _make_user(session)
    message = await _make_message(session, user)
    assessment = SafetyAssessment(
        user_id=user.id,
        conversation_id=message.conversation_id,
        message_id=message.id,
        lexicon_tier=3,
        classifier_tier=0,
        tier=3,
        tier3_kind="3b",
        reason_code="imminent_means_named",
        review_status="pending",
        countdown_status="pending",
    )
    session.add(assessment)
    await session.flush()

    await resolve_countdown(session, user.id, assessment.id, "cancelled")

    assert assessment.countdown_status == "cancelled"
    assert assessment.countdown_resolved_at is not None


async def test_resolve_countdown_is_idempotent(session):
    user = await _make_user(session)
    message = await _make_message(session, user)
    assessment = SafetyAssessment(
        user_id=user.id,
        conversation_id=message.conversation_id,
        message_id=message.id,
        lexicon_tier=3,
        classifier_tier=0,
        tier=3,
        tier3_kind="3b",
        reason_code="imminent_means_named",
        review_status="pending",
        countdown_status="pending",
    )
    session.add(assessment)
    await session.flush()

    await resolve_countdown(session, user.id, assessment.id, "cancelled")
    first_resolved_at = assessment.countdown_resolved_at

    # Expiry arriving after an already-cancelled countdown must not
    # overwrite it -- the student's own cancel wins.
    await resolve_countdown(session, user.id, assessment.id, "expired")

    assert assessment.countdown_status == "cancelled"
    assert assessment.countdown_resolved_at == first_resolved_at


async def test_resolve_countdown_is_scoped_to_the_owning_user(session):
    owner = await _make_user(session)
    someone_else = await _make_user(session)
    message = await _make_message(session, owner)
    assessment = SafetyAssessment(
        user_id=owner.id,
        conversation_id=message.conversation_id,
        message_id=message.id,
        lexicon_tier=3,
        classifier_tier=0,
        tier=3,
        tier3_kind="3b",
        reason_code="imminent_means_named",
        review_status="pending",
        countdown_status="pending",
    )
    session.add(assessment)
    await session.flush()

    await resolve_countdown(session, someone_else.id, assessment.id, "cancelled")

    assert assessment.countdown_status == "pending"


async def _make_stale_pending_countdown(session, user, *, age_seconds: int) -> SafetyAssessment:
    message = await _make_message(session, user)
    assessment = SafetyAssessment(
        user_id=user.id,
        conversation_id=message.conversation_id,
        message_id=message.id,
        lexicon_tier=3,
        classifier_tier=0,
        tier=3,
        tier3_kind="3b",
        reason_code="imminent_means_named",
        review_status="pending",
        countdown_status="pending",
    )
    session.add(assessment)
    await session.flush()
    # created_at is a Python-side default set at flush -- overwrite it
    # directly to simulate a countdown that started long ago.
    assessment.created_at = utcnow() - timedelta(seconds=age_seconds)
    await session.flush()
    return assessment


async def test_expire_stale_countdowns_expires_only_what_is_actually_stale(session):
    user = await _make_user(session)
    stale = await _make_stale_pending_countdown(
        session, user, age_seconds=COUNTDOWN_SECONDS + 30
    )
    fresh = await _make_stale_pending_countdown(session, user, age_seconds=10)

    await expire_stale_countdowns(session, user.id)

    assert stale.countdown_status == "expired"
    assert stale.countdown_resolved_at is not None
    assert fresh.countdown_status == "pending"


async def test_loading_the_conversation_sweeps_a_stale_countdown(
    session, patch_talk_session_factory
):
    """The lazy half of the design: a client that vanished mid-countdown
    never calls .../expire itself -- the next GET /talk/conversation is
    what actually resolves it."""
    user = await _make_user(session)
    stale = await _make_stale_pending_countdown(
        session, user, age_seconds=COUNTDOWN_SECONDS + 5
    )

    await load_active_conversation(session, user.id)

    assert stale.countdown_status == "expired"
