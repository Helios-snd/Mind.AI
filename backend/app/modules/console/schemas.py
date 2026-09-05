"""Wire shapes for the counsellor console.

Unlike every student-facing schema in this app, these are allowed to carry
real tier numbers, tier3_kind, and message text -- see the G plan's Context
for why the plain-language rule is specifically about what a *student* sees
about themselves, and doesn't apply to the one surface built for the
trained professional that review pathway exists for.

Two case shapes, never one that branches internally on every field -- see
SafetyCaseOut vs EscalationCaseOut below. That split is what makes it
structurally impossible for a future edit to one to leak a field into the
other by accident.
"""

from datetime import datetime
from uuid import UUID

from app.modules.checkins.schemas import CheckInOut
from app.modules.onboarding.schemas import CrisisPlanSchema, TrustedContactSchema, WireModel
from app.modules.talk.schemas import MessageOut


class QueueItemOut(WireModel):
    case_type: str  # "safety" | "escalation"
    case_id: UUID
    student_id: UUID
    created_at: datetime
    # Only meaningful for case_type == "safety".
    tier3_kind: str | None = None
    # Only meaningful for case_type == "escalation" -- this window's mood
    # average minus the previous window's (trends/compute.py's own figure).
    # Negative means a decline. Null when there isn't enough check-in
    # history to compute one.
    change: float | None = None
    # Only meaningful for case_type == "escalation".
    reason_summary_key: str | None = None


class SafetyCaseOut(WireModel):
    case_id: UUID
    student_id: UUID
    created_at: datetime
    tier: int
    tier3_kind: str | None
    reason_code: str
    confidence: float | None
    countdown_status: str | None
    message_text: str
    context_messages: list[MessageOut]
    crisis_plan: CrisisPlanSchema | None
    trusted_contact: TrustedContactSchema | None
    review_status: str
    reviewed_at: datetime | None


class EscalationCaseOut(WireModel):
    case_id: UUID
    student_id: UUID
    created_at: datetime
    fired_by: str
    reason_summary_key: str
    share_scope: list[str]
    change: float | None
    # Each is None -- not an empty list -- when its category isn't in
    # share_scope at all, so the frontend can tell "not shared" apart from
    # "shared, but there happened to be none in the window".
    check_ins: list[CheckInOut] | None
    messages: list[MessageOut] | None
    counsellor_reviewed_at: datetime | None
