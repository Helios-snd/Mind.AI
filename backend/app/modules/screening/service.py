"""Turning a completed baseline into stored scores."""

import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import log_event
from app.db.base import utcnow
from app.modules.onboarding.models import BaselineAnswer
from app.modules.screening.models import ScreeningScore, ScreeningSession
from app.modules.screening.scoring import score_dass21
from app.modules.users.models import UserProfile

logger = logging.getLogger(__name__)

# Mirrors BANGLA_DASS21_VALIDATED in src/content/instruments.ts. Bengali items
# are working translations, so a score derived from them is not a clinical
# result. Flip both together, and only when a validated instrument replaces the
# translations.
VALIDATED_LANGUAGES = frozenset({"en"})


async def score_baseline(
    session: AsyncSession, user_id: UUID, trigger: str = "onboarding"
) -> ScreeningSession | None:
    """Score the stored DASS-21 baseline. Returns None if nothing was answered.

    Called at onboarding completion. Idempotent per trigger: re-running does not
    duplicate a session, because completion itself is idempotent.
    """
    answers = (
        await session.scalars(
            select(BaselineAnswer).where(BaselineAnswer.user_id == user_id)
        )
    ).all()
    if not answers:
        return None

    profile = await session.get(UserProfile, user_id)
    language = profile.language if profile else "en"

    record = ScreeningSession(
        user_id=user_id,
        instrument="dass21",
        trigger=trigger,
        language=language,
        instrument_validated=language in VALIDATED_LANGUAGES,
        completed_at=utcnow(),
    )
    session.add(record)
    await session.flush()

    scores = score_dass21({a.item_id: a.value for a in answers})
    for score in scores:
        session.add(
            ScreeningScore(
                session_id=record.id,
                subscale=score.subscale,
                raw=score.raw,
                severity_band=score.severity_band,
                items_answered=score.items_answered,
            )
        )
    await session.flush()

    # Bands and raw scores are deliberately absent from this log line: it
    # records that scoring happened, not what it found.
    log_event(
        logger,
        "screening.baseline_scored",
        user_id=str(user_id),
        instrument="dass21",
        language=language,
        instrument_validated=record.instrument_validated,
        complete=all(s.is_complete for s in scores),
    )
    return record
