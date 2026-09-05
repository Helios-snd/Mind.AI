"""Wire shapes.

These mirror src/api/types.ts exactly. camelCase is part of the contract --
the frontend reads `whoIdCall`, `whatMakesItWorse`, `consentAt`, `completedAt`
and `itemId` directly, so the alias generator is not cosmetic.

Optional fields are omitted rather than sent as null, matching mockClient,
which simply does not set absent keys.
"""

from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.validators import normalise_phone, phone_looks_valid

Language = Literal["en", "bn"]
OnboardingStep = Annotated[int, Field(ge=1, le=5)]


def _camel(name: str) -> str:
    head, *rest = name.split("_")
    return head + "".join(word.capitalize() for word in rest)


class WireModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=_camel,
        populate_by_name=True,
        from_attributes=True,
        serialize_by_alias=True,
    )


class CrisisPlanSchema(WireModel):
    who_id_call: str = ""
    what_helps: str = ""
    what_makes_it_worse: str = ""


class TrustedContactSchema(WireModel):
    name: str = ""
    relationship: str = ""
    phone: str = ""

    @field_validator("phone")
    @classmethod
    def _check_phone(cls, value: str) -> str:
        # Mirrors phoneLooksValid in src/components/formFields.tsx. An empty
        # value is allowed here because the crisis-plan step validates
        # completeness itself; this only rejects a malformed non-empty number.
        if value and not phone_looks_valid(value):
            raise ValueError("phone does not look like an Indian mobile number")
        return normalise_phone(value)


class BaselineAnswerSchema(WireModel):
    item_id: str
    value: Annotated[int, Field(ge=0, le=3)]


class OnboardingProgressSchema(WireModel):
    step: OnboardingStep
    language: Language | None = None
    baseline: list[BaselineAnswerSchema] | None = None
    consent_at: datetime | None = None
    crisis_plan: CrisisPlanSchema | None = None
    contact: TrustedContactSchema | None = None
    completed_at: datetime | None = None


class OnboardingPatch(WireModel):
    """Every field optional -- this is Partial<OnboardingProgress>."""

    step: OnboardingStep | None = None
    language: Language | None = None
    baseline: list[BaselineAnswerSchema] | None = None
    consent_at: datetime | None = None
    crisis_plan: CrisisPlanSchema | None = None
    contact: TrustedContactSchema | None = None
