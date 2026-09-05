"""Wire shapes for Today.

camelCase matches src/app/(app)/today/storage.ts, which the frontend already
speaks: `sleepHours`, `at`, `date`.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import Field, field_validator

from app.modules.onboarding.schemas import WireModel

Scale5 = Annotated[int, Field(ge=1, le=5)]

MAX_NOTE_CHARS = 4000


class CheckInIn(WireModel):
    """What Today submits. `date` is the student's own local day."""

    date: date
    mood: Scale5
    sleep_hours: Annotated[Decimal, Field(ge=0, le=12)]
    energy: Scale5 | None = None
    social: Scale5 | None = None
    appetite: Scale5 | None = None
    activity: Scale5 | None = None
    note: str = ""

    @field_validator("sleep_hours")
    @classmethod
    def _half_hour_steps(cls, value: Decimal) -> Decimal:
        # The slider moves in 0.5 steps; anything else did not come from the UI.
        if (value * 2) % 1 != 0:
            raise ValueError("sleep_hours must be in 0.5 steps")
        return value

    @field_validator("note")
    @classmethod
    def _trim(cls, value: str) -> str:
        trimmed = (value or "").strip()
        if len(trimmed) > MAX_NOTE_CHARS:
            raise ValueError("note is too long")
        return trimmed


class ReflectionOut(WireModel):
    ack_key: str
    suggestion: "SuggestionOut | None" = None


class SuggestionOut(WireModel):
    title_key: str
    body_key: str


class CheckInOut(WireModel):
    """Mirrors the CheckIn type in src/api/types.ts."""

    date: date
    at: datetime
    mood: int
    # float, not Decimal: Pydantic serialises Decimal as a JSON *string*, and
    # the frontend types this as a number and does arithmetic on it -- trend
    # averaging would concatenate instead of adding. Half-hour steps are
    # exactly representable in binary floating point, so nothing is lost.
    sleep_hours: float
    energy: int | None = None
    social: int | None = None
    appetite: int | None = None
    activity: int | None = None
    note: str
    reflection: ReflectionOut


ReflectionOut.model_rebuild()
