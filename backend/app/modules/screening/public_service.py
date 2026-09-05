"""Persistence and scoring for public screening instruments.

This module is intentionally not a Safety implementation. It identifies the
PHQ-9 safety-sensitive answer and fails closed; only a future independent
Safety provider may replace `needs_review` with an evaluated outcome.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import utcnow
from app.modules.screening.models import ScreeningAnswer, ScreeningScore, ScreeningSession
from app.modules.screening.schemas import ScreeningCompleteIn, ScreeningResultOut

PHQ9_BANDS = ((4, "minimal"), (9, "mild"), (14, "moderate"), (19, "moderately severe"))
GAD7_BANDS = ((4, "minimal"), (9, "mild"), (14, "moderate"))
ASRS_THRESHOLDS = (2, 2, 2, 3, 3, 3)  # 0-based answer positions that qualify.


def _band(score: int, bands: tuple[tuple[int, str], ...]) -> str:
    for upper, label in bands:
        if score <= upper:
            return label
    return "severe"


def _validate(payload: ScreeningCompleteIn) -> dict[str, int]:
    expected = {"phq9": 9, "gad7": 7, "asrs_v1_1": 6}[payload.instrument]
    answers = {answer.item_id: answer.value for answer in payload.answers}
    expected_ids = {f"{payload.instrument}-{number}" for number in range(1, expected + 1)}
    if set(answers) != expected_ids:
        raise ValueError("Every question must be answered exactly once")
    maximum = 4 if payload.instrument == "asrs_v1_1" else 3
    if any(value < 0 or value > maximum for value in answers.values()):
        raise ValueError("An answer is outside this instrument's response scale")
    return answers


async def complete_public_screening(
    session: AsyncSession, user_id: UUID, payload: ScreeningCompleteIn
) -> ScreeningResultOut:
    answers = _validate(payload)
    safety_review = payload.instrument == "phq9" and answers["phq9-9"] > 0
    now = utcnow()
    record = ScreeningSession(
        user_id=user_id,
        instrument=payload.instrument,
        trigger="self_serve",
        language=payload.language,
        instrument_validated=True,
        completed_at=now,
        safety_state="needs_review" if safety_review else "not_applicable",
    )
    session.add(record)
    await session.flush()
    for item_id, value in answers.items():
        session.add(ScreeningAnswer(session_id=record.id, item_id=item_id, value=value))

    # A sensitive PHQ-9 response never receives an ordinary aggregate result
    # from this component. The caller must surface human/urgent support.
    if safety_review:
        await session.flush()
        return ScreeningResultOut(
            instrument=payload.instrument,
            requires_safety_review=True,
            completed_at=now.isoformat(),
        )

    if payload.instrument == "asrs_v1_1":
        positive = sum(
            answers[f"asrs_v1_1-{index + 1}"] >= threshold
            for index, threshold in enumerate(ASRS_THRESHOLDS)
        )
        score, maximum, band = positive, 6, "further evaluation may be worthwhile" if positive >= 4 else "screen did not reach the referral threshold"
        result = ScreeningResultOut(instrument=payload.instrument, score=score, maximum=maximum, positive_count=positive, band=band, completed_at=now.isoformat())
    else:
        score = sum(answers.values())
        maximum = 27 if payload.instrument == "phq9" else 21
        band = _band(score, PHQ9_BANDS if payload.instrument == "phq9" else GAD7_BANDS)
        result = ScreeningResultOut(instrument=payload.instrument, score=score, maximum=maximum, band=band, completed_at=now.isoformat())

    session.add(ScreeningScore(session_id=record.id, subscale="total", raw=score, severity_band=band, items_answered=len(answers)))
    await session.flush()
    return result
