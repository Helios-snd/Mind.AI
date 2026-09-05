from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import current_user, onboarded_user
from app.db.session import get_session
from app.modules.users import service
from app.modules.users.models import User
from app.modules.users.schemas import DataInventoryOut, MeExportOut, MeOut, MeSummaryOut

router = APIRouter(tags=["users"])


@router.get("/me", response_model=MeOut)
async def read_me(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> MeOut:
    return await service.get_profile(session, user.id)


@router.get("/me/summary", response_model=MeSummaryOut)
async def read_me_summary(
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> MeSummaryOut:
    return await service.get_summary(session, user.id)


@router.get("/me/inventory", response_model=DataInventoryOut)
async def read_me_inventory(
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> DataInventoryOut:
    return await service.get_data_inventory(session, user.id)


@router.get("/me/export", response_model=MeExportOut)
async def read_me_export(
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> MeExportOut:
    return await service.get_export(session, user.id)
