"""Public, non-diagnostic screening wire shapes."""

from typing import Annotated, Literal

from pydantic import Field, model_validator

from app.modules.onboarding.schemas import WireModel

Instrument = Literal["phq9", "gad7", "asrs_v1_1"]


class ScreeningAnswerIn(WireModel):
    item_id: str
    value: int


class ScreeningCompleteIn(WireModel):
    instrument: Instrument
    language: Literal["en"] = "en"
    answers: Annotated[list[ScreeningAnswerIn], Field(min_length=1, max_length=9)]


class ScreeningResultOut(WireModel):
    instrument: Instrument
    score: int | None = None
    maximum: int | None = None
    band: str | None = None
    positive_count: int | None = None
    requires_safety_review: bool = False
    completed_at: str
