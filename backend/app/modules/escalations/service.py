"""Escalation lifecycle: creating a pending brief, and the student's decision.

E1's trigger lives here too (`evaluate_trend_escalation`), called from
checkins/service.py right after a check-in is saved. It deliberately reuses
trends/compute.py's own mood-series computation rather than adding a second,
competing threshold rule -- the same "below your own baseline" read that
already drives the "your mood has been lower than your usual range" copy on
the Trends page becomes, here, a proactive offer of human support instead of
something the student has to notice themselves.

This is independent of Safety's per-message tiers. A Safety tier of 2 on a
single message creates nothing here -- that is a different, per-message risk
read, not the longitudinal condition this module is for.
"""

from datetime import timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound
from app.db.base import utcnow
from app.modules.checkins.models import CheckIn
from app.modules.escalations.models import EscalationEvent, StudentBrief
from app.modules.trends import compute

# "Declining is not a dead end" -- but also not an immediate re-ask.
RE_OFFER_AFTER_DAYS = 3

# What a release would cover, today: the check-in pattern that triggered it,
# the surrounding Talk conversation, and the reason itself. Fixed vocabulary,
# not a per-occasion description -- see StudentBrief.share_scope.
TREND_SHARE_SCOPE = ["checkins", "talk_messages", "reason"]
TREND_REASON_KEY = "escalation.reason.trend_decline_mood"

# How much history counts as "the window" a release would cover.
SHARE_WINDOW_DAYS = 1


async def evaluate_trend_escalation(session: AsyncSession, user_id: UUID) -> None:
    """Call after a check-in save. Fires nothing itself -- delegates to
    create_if_needed, which is where dedup and the re-offer cooldown live."""

    rows = (
        await session.scalars(
            select(CheckIn)
            .where(CheckIn.user_id == user_id)
            .order_by(CheckIn.local_date)
        )
    ).all()

    if not rows:
        return

    today = max(utcnow().date(), max(row.local_date for row in rows))
    history = [compute.Point(at=row.local_date, value=float(row.mood)) for row in rows]
    result = compute.compute_series("mood", history, "4w", today)

    if result.relation != "below":
        return

    await create_if_needed(
        session,
        user_id,
        fired_by="trend",
        tier=2,
        reason_key=TREND_REASON_KEY,
        share_scope=TREND_SHARE_SCOPE,
    )


async def create_if_needed(
    session: AsyncSession,
    user_id: UUID,
    *,
    fired_by: str,
    tier: int,
    reason_key: str,
    share_scope: list[str],
) -> EscalationEvent | None:
    """Reuses an existing pending escalation rather than stacking a new one
    on every qualifying check-in, and honours a declined escalation's
    re_offer_after cooldown. Returns None when neither a new one is created
    nor one already exists -- i.e. nothing changed."""

    existing_pending = await session.scalar(
        select(EscalationEvent).where(
            EscalationEvent.user_id == user_id,
            EscalationEvent.status == "pending",
        )
    )
    if existing_pending is not None:
        return existing_pending

    most_recent_declined = await session.scalar(
        select(EscalationEvent)
        .where(
            EscalationEvent.user_id == user_id,
            EscalationEvent.status == "declined",
        )
        .order_by(EscalationEvent.resolved_at.desc())
        .limit(1)
    )
    if (
        most_recent_declined is not None
        and most_recent_declined.re_offer_after is not None
        and most_recent_declined.re_offer_after > utcnow()
    ):
        return None

    event = EscalationEvent(user_id=user_id, fired_by=fired_by, tier=tier)
    session.add(event)
    await session.flush()

    now = utcnow()
    session.add(
        StudentBrief(
            escalation_event_id=event.id,
            reason_summary_key=reason_key,
            share_scope=share_scope,
            window_start=now - timedelta(days=SHARE_WINDOW_DAYS),
            window_end=now,
        )
    )
    await session.flush()

    return event


async def get_pending(
    session: AsyncSession, user_id: UUID
) -> tuple[EscalationEvent, StudentBrief] | None:
    event = await session.scalar(
        select(EscalationEvent).where(
            EscalationEvent.user_id == user_id,
            EscalationEvent.status == "pending",
        )
    )
    if event is None:
        return None

    brief = await session.scalar(
        select(StudentBrief).where(StudentBrief.escalation_event_id == event.id)
    )
    if brief is None:
        return None

    return event, brief


async def _get_owned_pending(
    session: AsyncSession, user_id: UUID, escalation_id: UUID
) -> tuple[EscalationEvent, StudentBrief]:
    event = await session.scalar(
        select(EscalationEvent).where(
            EscalationEvent.id == escalation_id,
            EscalationEvent.user_id == user_id,
            EscalationEvent.status == "pending",
        )
    )
    if event is None:
        raise NotFound("Escalation not found")

    brief = await session.scalar(
        select(StudentBrief).where(StudentBrief.escalation_event_id == event.id)
    )
    if brief is None:
        raise NotFound("Escalation not found")

    return event, brief


async def approve(session: AsyncSession, user_id: UUID, escalation_id: UUID) -> None:
    event, brief = await _get_owned_pending(session, user_id, escalation_id)

    now = utcnow()
    brief.approved_by_student_at = now
    brief.released_to_counsellor_at = now
    event.status = "approved"
    event.resolved_at = now

    await session.flush()


async def decline(session: AsyncSession, user_id: UUID, escalation_id: UUID) -> None:
    event, brief = await _get_owned_pending(session, user_id, escalation_id)

    now = utcnow()
    brief.declined_at = now
    event.status = "declined"
    event.resolved_at = now
    event.re_offer_after = now + timedelta(days=RE_OFFER_AFTER_DAYS)

    await session.flush()
