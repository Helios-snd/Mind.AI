"""Escalation endpoints.

Every route requires a finished account, same as checkins and talk -- an
escalation can only exist for a student who has already completed onboarding.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import onboarded_user
from app.db.session import get_session
from app.modules.escalations import service
from app.modules.escalations.schemas import EscalationBriefOut, EscalationHistoryItemOut
from app.modules.users.models import User

router = APIRouter(prefix="/escalations", tags=["escalations"])


@router.get("/pending", response_model=EscalationBriefOut | None)
async def get_pending_escalation(
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> EscalationBriefOut | None:
    result = await service.get_pending(session, user.id)
    if result is None:
        return None

    event, brief = result
    return EscalationBriefOut(
        id=event.id,
        reason_summary_key=brief.reason_summary_key,
        share_scope=brief.share_scope,
        created_at=event.created_at,
    )


@router.get("/history", response_model=list[EscalationHistoryItemOut])
async def get_escalation_history(
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> list[EscalationHistoryItemOut]:
    rows = await service.get_history(session, user.id)
    return [
        EscalationHistoryItemOut(
            status=event.status,
            reason_summary_key=brief.reason_summary_key if brief else "",
            created_at=event.created_at,
            resolved_at=event.resolved_at,
        )
        for event, brief in rows
    ]


@router.post("/request", status_code=204)
async def request_support(
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    """F3's one new action: a student asking directly, from /human. No
    response body -- the frontend re-fetches GET /escalations/pending,
    exactly like approve/decline already do."""
    await service.request_manual(session, user.id)
    return Response(status_code=204)


@router.post("/{escalation_id}/approve", status_code=204)
async def approve_escalation(
    escalation_id: UUID,
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    await service.approve(session, user.id, escalation_id)
    return Response(status_code=204)


@router.post("/{escalation_id}/decline", status_code=204)
async def decline_escalation(
    escalation_id: UUID,
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    await service.decline(session, user.id, escalation_id)
    return Response(status_code=204)
