"""Self-serve screening completion endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import current_user
from app.core.errors import ValidationFailed
from app.db.session import get_session
from app.modules.screening import public_service
from app.modules.screening.schemas import ScreeningCompleteIn, ScreeningResultOut
from app.modules.users.models import User

router = APIRouter(prefix="/screenings", tags=["screenings"])


@router.post("/complete", response_model=ScreeningResultOut)
async def complete_screening(
    payload: ScreeningCompleteIn,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> ScreeningResultOut:
    try:
        return await public_service.complete_public_screening(session, user.id, payload)
    except ValueError as exc:
        raise ValidationFailed(str(exc)) from exc
