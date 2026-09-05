"""Wire shapes for Trends.

The API returns measurements plus *keys*, never prose. Every user-facing
sentence stays in src/i18n where it can be reviewed and translated, and the
backend's job is to decide which reviewed sentence the numbers justify -- not
to write one.
"""

from datetime import date
from typing import Literal

from app.modules.onboarding.schemas import WireModel

RangeKey = Literal["7d", "4w", "6w"]
SeriesId = Literal["mood", "sleep", "energy", "social"]


class PointOut(WireModel):
    at: date
    value: float


class BaselineOut(WireModel):
    low: float
    high: float


class SeriesOut(WireModel):
    id: SeriesId
    # Empty when there is too little in the window to plot honestly.
    points: list[PointOut]
    average: float | None = None
    current: float | None = None
    high: float | None = None
    low: float | None = None
    # Against the previous window of the same length. Null when there is no
    # previous window to compare with.
    change: float | None = None
    # Null until there is enough older history to call anything "usual".
    baseline: BaselineOut | None = None
    direction: Literal["declining", "rising", "steady"] | None = None
    relation: Literal["below", "within", "above"] | None = None
    observation_key: str | None = None
    tip_key: str | None = None


class SecondaryOut(WireModel):
    """Appetite and activity: collected, but answered as a sentence rather than
    a chart."""

    id: Literal["appetite", "activity"]
    days_counted: int
    average: float | None = None
    direction: Literal["declining", "rising", "steady"] | None = None
    # activity only: days they got out at all, out of days_counted.
    positive_days: int | None = None
    observation_key: str | None = None


class StartingPointOut(WireModel):
    """Where the student began, shown apart from the daily measurements.

    Deliberately carries no DASS-21 score or severity band. Those exist for the
    counsellor brief; hard constraint 1 says the student sees plain language and
    never a label, so the starting point is a date and their own earliest
    averages -- not an instrument reading.
    """

    since: date | None = None
    baseline_taken: bool = False
    # Earliest week's averages per series, keyed by series id.
    first_values: dict[str, float] = {}


class RhythmOut(WireModel):
    """How many of the selected window's days have a check-in at all.

    Distinct from every per-series stat above: this counts check-ins
    themselves, not answers to any one scale, so it holds even for a student
    who skips every optional field and only ever sets mood.
    """

    days_logged: int
    window_days: int


class SummaryOut(WireModel):
    insight_keys: list[str]
    tip_key: str | None = None


class TrendsOut(WireModel):
    range: RangeKey
    check_in_count: int
    # False below the product's minimum, which is what the empty state keys off.
    has_enough_data: bool
    series: list[SeriesOut]
    secondary: list[SecondaryOut] = []
    starting_point: StartingPointOut | None = None
    rhythm: RhythmOut
    summary: SummaryOut
