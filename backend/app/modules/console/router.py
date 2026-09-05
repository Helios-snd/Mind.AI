"""The counsellor console's queue and case endpoints. Every route requires
Depends(current_counsellor) -- there is no other way into any of this."""

from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.console_deps import current_counsellor
from app.db.session import get_session
from app.modules.console import service
from app.modules.console.schemas import EscalationCaseOut, QueueItemOut, SafetyCaseOut
from app.modules.counsellors.models import Counsellor

router = APIRouter(prefix="/console", tags=["console"])


@router.get("/queue", response_model=list[QueueItemOut])
async def get_queue(
    counsellor: Counsellor = Depends(current_counsellor),
    session: AsyncSession = Depends(get_session),
) -> list[QueueItemOut]:
    return await service.get_queue(session)


@router.get("/cases/safety/{safety_assessment_id}", response_model=SafetyCaseOut)
async def get_safety_case(
    safety_assessment_id: UUID,
    counsellor: Counsellor = Depends(current_counsellor),
    session: AsyncSession = Depends(get_session),
) -> SafetyCaseOut:
    return await service.get_safety_case(session, safety_assessment_id)


@router.get("/cases/escalation/{escalation_event_id}", response_model=EscalationCaseOut)
async def get_escalation_case(
    escalation_event_id: UUID,
    counsellor: Counsellor = Depends(current_counsellor),
    session: AsyncSession = Depends(get_session),
) -> EscalationCaseOut:
    return await service.get_escalation_case(session, escalation_event_id)


@router.post("/cases/safety/{safety_assessment_id}/review", status_code=204)
async def review_safety_case(
    safety_assessment_id: UUID,
    counsellor: Counsellor = Depends(current_counsellor),
    session: AsyncSession = Depends(get_session),
) -> Response:
    await service.mark_safety_reviewed(session, counsellor.id, safety_assessment_id)
    return Response(status_code=204)


@router.post("/cases/escalation/{escalation_event_id}/review", status_code=204)
async def review_escalation_case(
    escalation_event_id: UUID,
    counsellor: Counsellor = Depends(current_counsellor),
    session: AsyncSession = Depends(get_session),
) -> Response:
    await service.mark_escalation_reviewed(session, counsellor.id, escalation_event_id)
    return Response(status_code=204)
