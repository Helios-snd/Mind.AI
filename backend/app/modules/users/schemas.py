"""Wire shapes for the student's own profile, summary, data inventory, and
export.

Plain-language only for safety/screening data, on purpose: never a tier
number, never "3a"/"3b", never a screening severity band. See the Slice F
plan -- this mirrors the existing rule for PHQ-9/GAD-7/DASS scores
(screening/models.py's own docstring: "the student never sees a subscale
name or a severity band"), and F2 extends the same rule to GET /me/export:
once a value like that is in a downloaded file the app no longer controls,
keeping it out of the UI stops meaning anything.
"""

from datetime import datetime

from app.modules.checkins.schemas import CheckInOut
from app.modules.escalations.schemas import EscalationHistoryItemOut
from app.modules.onboarding.schemas import OnboardingProgressSchema, WireModel
from app.modules.talk.schemas import MessageOut


# WireModel, not a plain BaseModel: every other response in this API is
# camelCase on the wire (05-api-contract.md: "camelCase is part of the
# contract"). This endpoint predates that convention solidifying and had
# never actually been called by the frontend -- fixed in F1 rather than
# carried forward, since F1 was the first thing to consume it.
class MeOut(WireModel):
    user_id: str
    language: str
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    claimed: bool
    onboarded: bool


class SafetySummaryOut(WireModel):
    # Count of this user's own tier->=2 safety_assessments rows in a recent
    # window. Never the tier value itself, never a reason code.
    recent_flag_count: int
    # True if any of this user's rows still have review_status == "pending".
    pending_review: bool


class ScreeningHistoryItemOut(WireModel):
    instrument: str
    completed_at: str


class MeSummaryOut(WireModel):
    safety: SafetySummaryOut
    screenings: list[ScreeningHistoryItemOut]


class ConsentEventOut(WireModel):
    kind: str
    policy_version: str
    at: datetime


class DataInventoryOut(WireModel):
    """The pieces of /data F1's GET /me/summary doesn't already cover."""

    signals_count: int
    consent_events: list[ConsentEventOut]


class SignalExportOut(WireModel):
    kind: str
    value: dict
    source: str
    observed_at: datetime


class ConversationExportOut(WireModel):
    message_count: int
    messages: list[MessageOut]


class MeExportOut(WireModel):
    """GET /me/export -- the one place allowed to reach across every module,
    same as get_summary() already does for two of them. Composed entirely
    from existing service functions (list_check_ins, get_summary,
    get_history, ...), never a second calculation of anything already
    computed elsewhere."""

    exported_at: datetime
    profile: MeOut
    onboarding: OnboardingProgressSchema
    consent_events: list[ConsentEventOut]
    check_ins: list[CheckInOut]
    signals: list[SignalExportOut]
    safety: SafetySummaryOut
    screenings: list[ScreeningHistoryItemOut]
    conversation: ConversationExportOut
    escalation_history: list[EscalationHistoryItemOut]
