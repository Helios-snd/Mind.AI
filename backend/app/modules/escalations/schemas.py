"""Wire shapes for the escalation interstitial."""

from datetime import datetime
from uuid import UUID

from app.modules.onboarding.schemas import WireModel


class EscalationBriefOut(WireModel):
    """What the student sees before approving or declining. `id` addresses
    the escalation_event for the approve/decline calls -- the student_brief
    row itself is never exposed as its own resource."""

    id: UUID
    reason_summary_key: str
    share_scope: list[str]
    created_at: datetime
