from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import current_user
from app.db.session import get_session
from app.modules.onboarding.models import OnboardingProgress
from app.modules.users.models import User, UserProfile

router = APIRouter(tags=["users"])


class MeOut(BaseModel):
    user_id: str
    language: str
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    claimed: bool
    onboarded: bool


@router.get("/me", response_model=MeOut)
async def read_me(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> MeOut:
    profile = await session.get(UserProfile, user.id)
    progress = await session.get(OnboardingProgress, user.id)
    return MeOut(
        user_id=str(user.id),
        language=profile.language if profile else "en",
        name=profile.name if profile else None,
        email=profile.email if profile else None,
        phone=profile.phone if profile else None,
        claimed=bool(profile and profile.claimed_at),
        onboarded=bool(progress and progress.completed_at),
    )
