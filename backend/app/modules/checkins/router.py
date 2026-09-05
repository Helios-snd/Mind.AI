"""Today endpoints.

Every route requires a finished account: check-ins are health data, and the
consent that covers storing them is recorded at onboarding completion.
"""

from datetime import date

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import onboarded_user
from app.db.session import get_session
from app.modules.checkins import service
from app.modules.checkins.schemas import CheckInIn, CheckInOut
from app.modules.users.models import User

router = APIRouter(prefix="/checkins", tags=["checkins"])


@router.get("", response_model=list[CheckInOut])
async def list_check_ins(
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> list[CheckInOut]:
    return await service.list_check_ins(session, user.id)


@router.get("/{day}", response_model=CheckInOut | None)
async def get_check_in(
    day: date,
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> CheckInOut | None:
    return await service.get_for_day(session, user.id, day)


@router.post("", response_model=CheckInOut)
async def create_check_in(
    payload: CheckInIn,
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> CheckInOut:
    return await service.save_check_in(session, user.id, payload)


@router.delete("/{day}", status_code=204)
async def delete_check_in(
    day: date,
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    await service.delete_check_in(session, user.id, day)
    return Response(status_code=204)
