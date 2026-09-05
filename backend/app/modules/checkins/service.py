"""Check-in persistence and SIGNAL extraction."""

import logging
from datetime import date
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound
from app.core.logging import log_event
from app.db.base import utcnow
from app.modules.checkins import signals as signal_extractor
from app.modules.checkins.models import CheckIn, Signal
from app.modules.checkins.reflection import reflect
from app.modules.checkins.schemas import CheckInIn, CheckInOut, ReflectionOut, SuggestionOut
from app.modules.escalations import service as escalation_service

logger = logging.getLogger(__name__)


def to_out(row: CheckIn) -> CheckInOut:
    suggestion = None
    if row.suggestion_title_key and row.suggestion_body_key:
        suggestion = SuggestionOut(
            title_key=row.suggestion_title_key, body_key=row.suggestion_body_key
        )
    return CheckInOut(
        date=row.local_date,
        at=row.at,
        mood=row.mood,
        sleep_hours=row.sleep_hours,
        energy=row.energy,
        social=row.social,
        appetite=row.appetite,
        activity=row.activity,
        note=row.note,
        reflection=ReflectionOut(ack_key=row.ack_key, suggestion=suggestion),
    )


async def save_check_in(
    session: AsyncSession, user_id: UUID, payload: CheckInIn
) -> CheckInOut:
    """Create or replace the student's check-in for that local day.

    Re-submitting the same day updates the existing row rather than adding a
    second. The unique constraint on (user_id, local_date) makes a duplicate
    impossible even if two requests race; this path makes the intended
    behaviour explicit rather than relying on an integrity error.
    """
    existing = (
        await session.scalars(
            select(CheckIn).where(
                CheckIn.user_id == user_id, CheckIn.local_date == payload.date
            )
        )
    ).first()

    reflection = reflect(payload.mood, payload.sleep_hours, payload.note)
    now = utcnow()

    if existing is None:
        row = CheckIn(user_id=user_id, local_date=payload.date, at=now)
        session.add(row)
    else:
        row = existing
        row.at = now

    row.mood = payload.mood
    row.sleep_hours = payload.sleep_hours
    row.energy = payload.energy
    row.social = payload.social
    row.appetite = payload.appetite
    row.activity = payload.activity
    row.note = payload.note
    row.ack_key = reflection.ack_key
    row.suggestion_title_key = reflection.suggestion_title_key
    row.suggestion_body_key = reflection.suggestion_body_key

    await session.flush()
    await _rebuild_signals(session, user_id, row)
    await escalation_service.evaluate_trend_escalation(session, user_id)

    # The note itself is never logged -- only that one was left.
    log_event(
        logger,
        "checkin.saved",
        user_id=str(user_id),
        local_date=str(payload.date),
        replaced=existing is not None,
        has_note=bool(payload.note),
    )
    return to_out(row)


async def _rebuild_signals(
    session: AsyncSession, user_id: UUID, row: CheckIn
) -> None:
    """Signals are derived, so an edited check-in replaces them wholesale."""
    await session.execute(
        delete(Signal).where(
            Signal.source_type == "checkin", Signal.source_id == row.id
        )
    )
    for extracted in signal_extractor.extract(
        mood=row.mood,
        sleep_hours=row.sleep_hours,
        energy=row.energy,
        social=row.social,
        appetite=row.appetite,
        activity=row.activity,
        note=row.note,
    ):
        session.add(
            Signal(
                user_id=user_id,
                source_type="checkin",
                source_id=row.id,
                source=extracted.source,
                kind=extracted.kind,
                value=extracted.value,
                observed_at=row.at,
            )
        )
    await session.flush()


async def list_check_ins(
    session: AsyncSession, user_id: UUID, limit: int = 400
) -> list[CheckInOut]:
    rows = (
        await session.scalars(
            select(CheckIn)
            .where(CheckIn.user_id == user_id)
            .order_by(CheckIn.local_date.desc())
            .limit(limit)
        )
    ).all()
    return [to_out(row) for row in rows]


async def get_for_day(
    session: AsyncSession, user_id: UUID, day: date
) -> CheckInOut | None:
    row = (
        await session.scalars(
            select(CheckIn).where(
                CheckIn.user_id == user_id, CheckIn.local_date == day
            )
        )
    ).first()
    return to_out(row) if row else None


async def delete_check_in(session: AsyncSession, user_id: UUID, day: date) -> None:
    """Delete really deletes -- the row and everything derived from it.

    /data promises the student can remove any of it and it is gone for good,
    so the signals go with the check-in rather than outliving it.
    """
    row = (
        await session.scalars(
            select(CheckIn).where(
                CheckIn.user_id == user_id, CheckIn.local_date == day
            )
        )
    ).first()
    if row is None:
        raise NotFound("No check-in on that day")

    await session.execute(
        delete(Signal).where(
            Signal.source_type == "checkin", Signal.source_id == row.id
        )
    )
    await session.delete(row)
    await session.flush()

    log_event(logger, "checkin.deleted", user_id=str(user_id), local_date=str(day))
