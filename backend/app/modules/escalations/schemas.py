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


class EscalationHistoryItemOut(WireModel):
    """A past, resolved escalation -- for /data's history section. Status
    and the same server-picked reason key the pending brief already uses;
    never freehand text, and never the internal `tier` int or `fired_by`
    source -- those are audit detail, not something /data needs to explain."""

    status: str
    reason_summary_key: str
    created_at: datetime
    resolved_at: datetime | None
