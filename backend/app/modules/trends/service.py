"""Assembling Trends from the student's own check-ins."""

from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import utcnow
from app.modules.checkins.models import CheckIn
from app.modules.trends import compute
from app.modules.trends.schemas import (
    BaselineOut,
    PointOut,
    RhythmOut,
    SecondaryOut,
    SeriesOut,
    StartingPointOut,
    SummaryOut,
    TrendsOut,
)
from app.modules.onboarding.models import OnboardingProgress
from app.modules.screening.models import ScreeningSession
from sqlalchemy import func


# How many of the earliest days form the "starting point" reference.
FIRST_WINDOW_DAYS = 7


def _history_for(rows: list[CheckIn], series_id: str) -> list[compute.Point]:
    """Daily observations for one series.

    A skipped scale contributes nothing. It is not zero-filled and not carried
    forward from the previous day -- absent and "none of it" are different
    facts, and only one of them is something the student said.
    """
    points: list[compute.Point] = []
    for row in rows:
        raw = {
            "mood": row.mood,
            "sleep": row.sleep_hours,
            "energy": row.energy,
            "social": row.social,
            "appetite": row.appetite,
            "activity": row.activity,
        }[series_id]
        if raw is None:
            continue
        points.append(compute.Point(at=row.local_date, value=float(raw)))
    return sorted(points, key=lambda p: p.at)


async def build_trends(
    session: AsyncSession,
    user_id: UUID,
    range_key: str = "4w",
    today: date | None = None,
) -> TrendsOut:
    rows = (
        await session.scalars(
            select(CheckIn)
            .where(CheckIn.user_id == user_id)
            .order_by(CheckIn.local_date)
        )
    ).all()

    # Anchor the window on the student's own calendar, not the server's.
    #
    # local_date is the day the student says it was; utcnow() is the day it is
    # in UTC. For a student in Kolkata (UTC+5:30) checking in at 1am, those
    # differ -- their check-in is dated "tomorrow" from the server's point of
    # view, falls outside every window, and vanishes from Trends entirely.
    # Taking the later of the two keeps their own most recent day in range
    # without inventing anything.
    onboarding = await session.get(OnboardingProgress, user_id)
    baseline_taken = bool(
        await session.scalar(
            select(func.count())
            .select_from(ScreeningSession)
            .where(
                ScreeningSession.user_id == user_id,
                ScreeningSession.trigger == "onboarding",
            )
        )
    )

    today = today or utcnow().date()
    if rows:
        today = max(today, max(row.local_date for row in rows))

    results = {
        series_id: compute.compute_series(
            series_id, _history_for(rows, series_id), range_key, today
        )
        for series_id in compute.SERIES_IDS
    }

    secondary = {
        series_id: compute.compute_secondary(
            series_id, _history_for(rows, series_id), range_key, today
        )
        for series_id in compute.SECONDARY_IDS
    }

    starting_point = _starting_point(rows, onboarding, baseline_taken)
    rhythm = _rhythm(rows, range_key, today)

    insight_keys, tip_key = compute.summarise(results)

    # True only when something is actually plottable in *this* range. Counting
    # all history instead produced a contradiction the student could see: the
    # page announcing it had enough data, above four cards each saying it did
    # not.
    # Range-aware, and now distinct from "points exist": a 1-2 check-in
    # student has points but has_enough stays false, which is exactly the
    # partial-dashboard signal the frontend keys off.
    has_enough = any(result.has_enough for result in results.values())

    return TrendsOut(
        range=range_key,
        check_in_count=len(rows),
        has_enough_data=has_enough,
        series=[
            SeriesOut(
                id=result.id,
                points=[PointOut(at=p.at, value=p.value) for p in result.points],
                average=result.average,
                current=result.current,
                high=result.high,
                low=result.low,
                change=result.change,
                baseline=(
                    BaselineOut(low=result.baseline.low, high=result.baseline.high)
                    if result.baseline
                    else None
                ),
                direction=result.direction,
                relation=result.relation,
                observation_key=result.observation_key,
                tip_key=result.tip_key,
            )
            for result in results.values()
        ],
        secondary=[
            SecondaryOut(
                id=result.id,
                days_counted=result.days_counted,
                average=result.average,
                direction=result.direction,
                positive_days=result.positive_days,
                observation_key=result.observation_key,
            )
            for result in secondary.values()
        ],
        starting_point=starting_point,
        rhythm=rhythm,
        summary=SummaryOut(insight_keys=insight_keys, tip_key=tip_key),
    )


def _rhythm(rows: list[CheckIn], range_key: str, today: date) -> RhythmOut:
    """Distinct check-in days in the selected window against the window's own
    length. Every check-in is its own calendar day (the table enforces one per
    day), so counting rows in range is exactly counting days logged -- no
    separate distinct-date pass needed."""
    window_days = compute.RANGE_DAYS[range_key]
    window_start = today - timedelta(days=window_days - 1)
    days_logged = sum(1 for row in rows if window_start <= row.local_date <= today)
    return RhythmOut(days_logged=days_logged, window_days=window_days)


def _starting_point(
    rows: list[CheckIn],
    onboarding: OnboardingProgress | None,
    baseline_taken: bool,
) -> StartingPointOut | None:
    """Where they began: the date, and their own earliest averages.

    Not a DASS-21 reading. The instrument's subscale scores and severity bands
    stay server-side for the counsellor brief -- surfacing them here would put
    a clinical label in front of the student, which hard constraint 1 forbids.
    """
    if onboarding is None or onboarding.completed_at is None:
        return None

    since = onboarding.completed_at.date()

    first_values: dict[str, float] = {}
    if rows:
        earliest = min(row.local_date for row in rows)
        latest = max(row.local_date for row in rows)
        cutoff = earliest + timedelta(days=FIRST_WINDOW_DAYS)
        # "Then" has to actually precede "now". Until the history is longer
        # than the starting window, the two overlap and the comparison reads
        # Then 3.7 / Now 3.7 on a day the student dropped to 2 -- which is
        # worse than showing nothing.
        spans_enough = (latest - earliest).days >= FIRST_WINDOW_DAYS

        if spans_enough:
            for series_id in compute.SERIES_IDS:
                early = [
                    p.value
                    for p in _history_for(rows, series_id)
                    if p.at < cutoff
                ]
                # A single day is a reading, not a starting point.
                if len(early) >= 2:
                    first_values[series_id] = round(sum(early) / len(early), 1)

    return StartingPointOut(
        since=since, baseline_taken=baseline_taken, first_values=first_values
    )
