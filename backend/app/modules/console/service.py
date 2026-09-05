"""Case queue and detail composition for the counsellor console.

The one module (alongside users/service.py::get_export) allowed to reach
across checkins/talk/escalations/safety/onboarding to compose a view -- it
owns no data of its own beyond the two "who reviewed this" columns G's
migration added directly to safety_assessments and escalation_events.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound
from app.db.base import utcnow
from app.modules.checkins import service as checkins_service
from app.modules.checkins.models import CheckIn
from app.modules.console.schemas import EscalationCaseOut, QueueItemOut, SafetyCaseOut
from app.modules.escalations.models import EscalationEvent, StudentBrief
from app.modules.onboarding import service as onboarding_service
from app.modules.talk.models import Message
from app.modules.talk.repository import list_messages
from app.modules.talk.safety_models import SafetyAssessment
from app.modules.talk.schemas import MessageOut
from app.modules.trends import compute

# Messages of surrounding context shown alongside the one that was flagged --
# enough for a counsellor to read the exchange, not the whole conversation.
CONTEXT_MESSAGES = 6


async def _mood_change(session: AsyncSession, user_id: UUID) -> float | None:
    """The same figure /trends shows the student, reused rather than
    recalculated: this window's mood average minus the previous window's.
    Negative means a decline. None when there isn't enough history."""
    rows = (
        await session.scalars(
            select(CheckIn)
            .where(CheckIn.user_id == user_id)
            .order_by(CheckIn.local_date)
        )
    ).all()
    if not rows:
        return None

    today = max(utcnow().date(), max(row.local_date for row in rows))
    history = [
        compute.Point(at=row.local_date, value=float(row.mood)) for row in rows
    ]
    return compute.compute_series("mood", history, "4w", today).change


async def get_queue(session: AsyncSession) -> list[QueueItemOut]:
    """Tier-3 safety flags always first (oldest-unreviewed first, matching
    the "next working day" review commitment) -- categorically more urgent
    than a longitudinal trend, and never consent-gated the way an
    escalation is. Approved escalations below that, ranked by how far the
    triggering mood reading fell: largest decline first."""

    safety_rows = (
        await session.scalars(
            select(SafetyAssessment)
            .where(
                SafetyAssessment.tier >= 3,
                SafetyAssessment.review_status == "pending",
            )
            .order_by(SafetyAssessment.created_at.asc())
        )
    ).all()

    escalation_rows = (
        await session.scalars(
            select(EscalationEvent).where(
                EscalationEvent.status == "approved",
                EscalationEvent.counsellor_reviewed_at.is_(None),
            )
        )
    ).all()

    items: list[QueueItemOut] = [
        QueueItemOut(
            case_type="safety",
            case_id=row.id,
            student_id=row.user_id,
            created_at=row.created_at,
            tier3_kind=row.tier3_kind,
        )
        for row in safety_rows
    ]

    ranked: list[tuple[float, QueueItemOut]] = []
    for row in escalation_rows:
        change = await _mood_change(session, row.user_id)
        brief = await session.scalar(
            select(StudentBrief).where(StudentBrief.escalation_event_id == row.id)
        )
        # A missing change (too little history) sorts last among
        # escalations, not first -- it isn't evidence of a large decline,
        # just an unknown one.
        sort_key = change if change is not None else float("inf")
        ranked.append(
            (
                sort_key,
                QueueItemOut(
                    case_type="escalation",
                    case_id=row.id,
                    student_id=row.user_id,
                    created_at=row.created_at,
                    change=change,
                    reason_summary_key=brief.reason_summary_key if brief else None,
                ),
            )
        )
    ranked.sort(key=lambda pair: pair[0])  # most negative (largest decline) first
    items.extend(item for _, item in ranked)

    return items


async def get_safety_case(
    session: AsyncSession, safety_assessment_id: UUID
) -> SafetyCaseOut:
    row = await session.get(SafetyAssessment, safety_assessment_id)
    if row is None:
        raise NotFound("Case not found")

    flagged_message = await session.get(Message, row.message_id)
    all_messages = await list_messages(session, row.user_id, row.conversation_id)

    index = next(
        (i for i, m in enumerate(all_messages) if m.id == row.message_id), None
    )
    context = all_messages[max(0, index - CONTEXT_MESSAGES) : index + 1] if index is not None else []

    crisis_plan = await onboarding_service.get_crisis_plan(session, row.user_id)
    contact = await onboarding_service.get_contact(session, row.user_id)

    return SafetyCaseOut(
        case_id=row.id,
        student_id=row.user_id,
        created_at=row.created_at,
        tier=row.tier,
        tier3_kind=row.tier3_kind,
        reason_code=row.reason_code,
        confidence=row.confidence,
        countdown_status=row.countdown_status,
        message_text=flagged_message.content if flagged_message else "",
        context_messages=[MessageOut.model_validate(m) for m in context],
        crisis_plan=crisis_plan,
        trusted_contact=contact,
        review_status=row.review_status,
        reviewed_at=row.reviewed_at,
    )


async def get_escalation_case(
    session: AsyncSession, escalation_event_id: UUID
) -> EscalationCaseOut:
    event = await session.get(EscalationEvent, escalation_event_id)
    if event is None or event.status != "approved":
        raise NotFound("Case not found")

    brief = await session.scalar(
        select(StudentBrief).where(StudentBrief.escalation_event_id == event.id)
    )
    if brief is None:
        raise NotFound("Case not found")

    # None -- not an empty list -- when a category isn't in share_scope at
    # all, so the frontend can tell "not shared" apart from "shared, but
    # nothing happened to fall in the window".
    check_ins = None
    if "checkins" in brief.share_scope:
        all_check_ins = await checkins_service.list_check_ins(session, event.user_id)
        check_ins = [
            c for c in all_check_ins if brief.window_start <= c.at <= brief.window_end
        ]

    messages = None
    if "talk_messages" in brief.share_scope:
        # There's only ever one active conversation per student -- the same
        # read load_active_conversation itself does, but without its
        # countdown-sweep side effect, which belongs to the student's own
        # touch on the backend, not a counsellor's read of a released case.
        conversation_id = (
            await session.scalars(
                select(Message.conversation_id)
                .where(Message.user_id == event.user_id)
                .order_by(Message.sequence.desc())
                .limit(1)
            )
        ).first()
        all_messages = (
            await list_messages(session, event.user_id, conversation_id)
            if conversation_id
            else []
        )
        messages = [
            MessageOut.model_validate(m)
            for m in all_messages
            if brief.window_start <= m.created_at <= brief.window_end
        ]

    return EscalationCaseOut(
        case_id=event.id,
        student_id=event.user_id,
        created_at=event.created_at,
        fired_by=event.fired_by,
        reason_summary_key=brief.reason_summary_key,
        share_scope=list(brief.share_scope),
        change=await _mood_change(session, event.user_id),
        check_ins=check_ins,
        messages=messages,
        counsellor_reviewed_at=event.counsellor_reviewed_at,
    )


async def mark_safety_reviewed(
    session: AsyncSession, counsellor_id: UUID, safety_assessment_id: UUID
) -> None:
    row = await session.get(SafetyAssessment, safety_assessment_id)
    if row is None:
        raise NotFound("Case not found")
    if row.review_status != "reviewed":
        row.review_status = "reviewed"
        row.reviewed_at = utcnow()
        row.reviewed_by_counsellor_id = counsellor_id
    await session.flush()


async def mark_escalation_reviewed(
    session: AsyncSession, counsellor_id: UUID, escalation_event_id: UUID
) -> None:
    row = await session.get(EscalationEvent, escalation_event_id)
    if row is None or row.status != "approved":
        raise NotFound("Case not found")
    if row.counsellor_reviewed_at is None:
        row.counsellor_reviewed_at = utcnow()
        row.reviewed_by_counsellor_id = counsellor_id
    await session.flush()
