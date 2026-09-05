"""Trends endpoint."""

from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import onboarded_user
from app.db.session import get_session
from app.modules.trends import service
from app.modules.trends.schemas import TrendsOut
from app.modules.users.models import User

router = APIRouter(prefix="/trends", tags=["trends"])


@router.get("", response_model=TrendsOut)
async def get_trends(
    range: Literal["7d", "4w", "6w"] = Query("4w"),
    user: User = Depends(onboarded_user),
    session: AsyncSession = Depends(get_session),
) -> TrendsOut:
    # Scoped to the caller. There is no endpoint that returns anyone else's
    # trends, and no aggregate to compare against.
    return await service.build_trends(session, user.id, range)
