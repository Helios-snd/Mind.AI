"""TREND computation.

Every number here comes from the student's own check-ins. There is no
population norm anywhere in this module, and there is nothing to compare
against but their own history -- that is the product's central claim, and the
absence of a norms table is what enforces it.

Three deliberate refusals:

  * A series with too few observations is not plotted. It is not filled,
    smoothed, or extended.
  * A baseline is not drawn until there is enough older history to justify the
    phrase "your usual range".
  * Nothing is inferred from the note. Structured answers are the only input.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from statistics import mean

# The existing product rule: below this, Trends shows its empty state.
MIN_POINTS_FOR_CHART = 3

# A baseline needs more than a chart does. Calling three days "your usual
# range" would put a confident band around noise, so the phrase is withheld
# until roughly a week of history exists.
MIN_POINTS_FOR_BASELINE = 7

# How much recent history is held out of the baseline. Without this a sustained
# decline drags the baseline down with it and the student never reads as below
# their own normal -- the comparison would quietly mask the thing it exists to
# surface.
BASELINE_HOLDOUT_DAYS = 7

SERIES_IDS = ("mood", "sleep", "energy", "social")

# Below this, a change is noise rather than direction. Sleep is in hours and
# moves on a wider scale than the 1-5 answers.
STEADY_THRESHOLD = {"mood": 0.3, "energy": 0.3, "social": 0.3, "sleep": 0.5}

RANGE_DAYS = {"7d": 7, "4w": 28, "6w": 42}
WEEKLY_RANGES = {"4w", "6w"}


@dataclass(frozen=True)
class Point:
    at: date
    value: float


@dataclass(frozen=True)
class Baseline:
    low: float
    high: float


@dataclass(frozen=True)
class SeriesResult:
    id: str
    points: list[Point]
    average: float | None
    current: float | None
    high: float | None
    low: float | None
    change: float | None
    baseline: Baseline | None
    direction: str | None          # "declining" | "rising" | "steady"
    relation: str | None           # "below" | "within" | "above"
    observation_key: str | None
    tip_key: str | None
    # True once the window holds enough daily observations for a full trend
    # read (baseline, direction, observation). False data below that is still
    # returned above -- points/average/high/low -- so a 1-2 check-in student
    # sees their own numbers instead of a blank card.
    has_enough: bool = False


def _round1(value: float) -> float:
    return round(value + 0.0, 1)


def _quantile(sorted_values: list[float], q: float) -> float:
    """Linear-interpolation quantile.

    Written out rather than pulled from statistics.quantiles because that
    helper needs at least two points and raises on one, and this runs against
    whatever history the student happens to have.
    """
    if not sorted_values:
        raise ValueError("no values")
    if len(sorted_values) == 1:
        return sorted_values[0]
    position = (len(sorted_values) - 1) * q
    lower = int(position)
    upper = min(lower + 1, len(sorted_values) - 1)
    weight = position - lower
    return sorted_values[lower] * (1 - weight) + sorted_values[upper] * weight


def monday_of(day: date) -> date:
    return day - timedelta(days=day.weekday())


def _bucket_weekly(daily: list[Point]) -> list[Point]:
    buckets: dict[date, list[float]] = {}
    for point in daily:
        buckets.setdefault(monday_of(point.at), []).append(point.value)
    return [
        Point(week, _round1(mean(values)))
        for week, values in sorted(buckets.items())
    ]


def _direction(series_id: str, points: list[Point]) -> str | None:
    """Slope, not state: the first half of the window against the second.

    Needs four points so each half has two -- comparing one reading to one
    other reading is not a trend.
    """
    if len(points) < 4:
        return None
    midpoint = len(points) // 2
    earlier = mean(p.value for p in points[:midpoint])
    later = mean(p.value for p in points[midpoint:])
    delta = later - earlier

    if abs(delta) < STEADY_THRESHOLD[series_id]:
        return "steady"
    return "rising" if delta > 0 else "declining"


def _relation(value: float | None, baseline: Baseline | None) -> str | None:
    if value is None or baseline is None:
        return None
    if value < baseline.low:
        return "below"
    if value > baseline.high:
        return "above"
    return "within"


def compute_baseline(history: list[Point], today: date) -> Baseline | None:
    """The student's own usual range, from history older than the holdout.

    The interquartile range rather than min-max, so one very bad night does not
    widen "usual" to include everything.
    """
    cutoff = today - timedelta(days=BASELINE_HOLDOUT_DAYS)
    older = sorted(p.value for p in history if p.at < cutoff)
    if len(older) < MIN_POINTS_FOR_BASELINE:
        return None
    return Baseline(low=_round1(_quantile(older, 0.25)), high=_round1(_quantile(older, 0.75)))


def _observation_and_tip(
    series_id: str, direction: str | None, relation: str | None
) -> tuple[str | None, str | None]:
    """Map measurements to reviewed copy.

    Observation keys describe what the numbers did. They never name a
    condition, and they never generalise from a pattern to the person -- "your
    sleep has been lower than your usual range", not "you are not sleeping
    well". The tip is offered only when there is something specific to respond
    to; a steady week gets an observation and no advice.
    """
    if relation == "below":
        return "trends.obs.belowBaseline", f"trends.tip.{series_id}"
    if relation == "above":
        return "trends.obs.aboveBaseline", None
    if direction == "declining":
        return "trends.obs.declining", f"trends.tip.{series_id}"
    if direction == "rising":
        return "trends.obs.rising", None
    if direction == "steady":
        return "trends.obs.steady", None
    if relation == "within":
        return "trends.obs.withinBaseline", None
    return None, None


def compute_series(
    series_id: str,
    history: list[Point],
    range_key: str,
    today: date,
) -> SeriesResult:
    """`history` is every daily observation the student has for this series.

    Below MIN_POINTS_FOR_CHART the student still sees their own numbers --
    points, average, high, low -- just nothing that implies a trend. A 1-2
    check-in student reported real data; showing nothing for it would be less
    honest than showing it plainly and saying it is early, which is what the
    withheld baseline/direction/observation fields communicate upstream.
    """
    window_days = RANGE_DAYS[range_key]
    window_start = today - timedelta(days=window_days - 1)
    previous_start = window_start - timedelta(days=window_days)

    in_window = [p for p in history if window_start <= p.at <= today]
    in_previous = [p for p in history if previous_start <= p.at < window_start]

    if not in_window:
        return SeriesResult(
            id=series_id,
            points=[],
            average=None,
            current=None,
            high=None,
            low=None,
            change=None,
            baseline=None,
            direction=None,
            relation=None,
            observation_key=None,
            tip_key=None,
            has_enough=False,
        )

    values = [p.value for p in in_window]
    points = (
        _bucket_weekly(in_window) if range_key in WEEKLY_RANGES else sorted(in_window, key=lambda p: p.at)
    )
    average = _round1(mean(values))
    current = points[-1].value if points else None
    high = _round1(max(values))
    low = _round1(min(values))

    has_enough = len(in_window) >= MIN_POINTS_FOR_CHART
    if not has_enough:
        # Real numbers, no trend claim: no baseline, no direction, no change
        # against a previous window -- all of those imply more history than
        # this actually is.
        return SeriesResult(
            id=series_id,
            points=points,
            average=average,
            current=current,
            high=high,
            low=low,
            change=None,
            baseline=None,
            direction=None,
            relation=None,
            observation_key=None,
            tip_key=None,
            has_enough=False,
        )

    change = (
        _round1(average - mean(p.value for p in in_previous)) if in_previous else None
    )
    baseline = compute_baseline(history, today)
    direction = _direction(series_id, points)
    relation = _relation(average, baseline)
    observation_key, tip_key = _observation_and_tip(series_id, direction, relation)

    return SeriesResult(
        id=series_id,
        points=points,
        average=average,
        current=current,
        high=high,
        low=low,
        change=change,
        baseline=baseline,
        direction=direction,
        relation=relation,
        observation_key=observation_key,
        tip_key=tip_key,
        has_enough=True,
    )


def summarise(results: dict[str, SeriesResult]) -> tuple[list[str], str | None]:
    """One or two sentences across the four series, plus at most one place to start.

    Deliberately narrow. A summary that fires on every combination stops being
    an observation and becomes noise, so this only speaks when two things moved
    together or when nothing did.
    """
    def is_down(series_id: str) -> bool:
        result = results.get(series_id)
        return bool(
            result
            and (result.relation == "below" or result.direction == "declining")
        )

    insights: list[str] = []
    tip: str | None = None

    if is_down("sleep") and is_down("mood"):
        insights.append("trends.summary.sleepAndMood")
        tip = "trends.tip.sleepConsistency"
    elif is_down("social") and is_down("mood"):
        insights.append("trends.summary.socialAndMood")
        tip = "trends.tip.social"
    elif is_down("sleep"):
        insights.append("trends.summary.sleep")
        tip = "trends.tip.sleepConsistency"
    elif is_down("mood"):
        insights.append("trends.summary.mood")
        tip = "trends.tip.mood"

    plotted = [r for r in results.values() if r.points]
    if not insights and plotted and all(r.direction == "steady" for r in plotted):
        insights.append("trends.summary.steady")

    return insights, tip


# --- secondary indicators ---------------------------------------------------
#
# Appetite and activity are collected but do not earn a full time-series panel:
# four charts is already a lot to read, and these two answer simpler questions
# ("has eating been steady?", "did you get out?") than "what is the shape of
# this over six weeks?".

SECONDARY_IDS = ("appetite", "activity")

# At or above this, the day counts as having got out at all.
GOT_OUT_AT_LEAST = 3


@dataclass(frozen=True)
class SecondaryResult:
    id: str
    days_counted: int
    average: float | None
    direction: str | None
    # activity only: how many of the counted days they got out.
    positive_days: int | None
    observation_key: str | None


def compute_secondary(
    series_id: str, history: list[Point], range_key: str, today: date
) -> SecondaryResult:
    window_days = RANGE_DAYS[range_key]
    window_start = today - timedelta(days=window_days - 1)
    in_window = sorted(
        (p for p in history if window_start <= p.at <= today), key=lambda p: p.at
    )

    if not in_window:
        return SecondaryResult(series_id, 0, None, None, None, None)

    average = _round1(mean(p.value for p in in_window))
    direction = _direction("mood", in_window) if len(in_window) >= 4 else None

    positive_days = (
        sum(1 for p in in_window if p.value >= GOT_OUT_AT_LEAST)
        if series_id == "activity"
        else None
    )

    # Only speaks once there is enough to say something honest.
    observation_key = None
    if series_id == "activity" and positive_days is not None:
        observation_key = "trends.secondary.activity.count"
    elif len(in_window) >= MIN_POINTS_FOR_CHART and direction:
        observation_key = f"trends.secondary.direction.{direction}"

    return SecondaryResult(
        id=series_id,
        days_counted=len(in_window),
        average=average,
        direction=direction,
        positive_days=positive_days,
        observation_key=observation_key,
    )
