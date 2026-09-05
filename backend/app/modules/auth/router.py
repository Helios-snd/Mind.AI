"""Auth endpoints. Every one of these sets or clears the session cookies."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import current_user, get_refresh_token
from app.core.errors import NotAuthenticated
from app.core.security import (
    clear_session_cookies,
    create_access_token,
    set_session_cookies,
)
from app.db.session import get_session
from app.modules.auth import service
from app.modules.auth.schemas import AuthAck, DestinationIn, SessionOut, VerifyIn
from app.modules.onboarding.models import OnboardingProgress
from app.modules.users.models import User, UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])


def _apply(response: Response, issued: service.IssuedSession) -> None:
    access = create_access_token(issued.user_id, issued.onboarded)
    set_session_cookies(response, access, issued.refresh_token, issued.onboarded)


@router.post("/anonymous", response_model=SessionOut)
async def create_anonymous(
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> SessionOut:
    user = await service.create_anonymous_user(session)
    issued = await service.issue_session(session, user.id, onboarded=False)
    _apply(response, issued)
    return SessionOut(user_id=str(user.id), onboarded=False, claimed=False)


@router.post("/refresh", response_model=SessionOut)
async def refresh(
    response: Response,
    refresh_token: str | None = Depends(get_refresh_token),
    session: AsyncSession = Depends(get_session),
) -> SessionOut:
    if not refresh_token:
        raise NotAuthenticated("No refresh cookie")

    issued = await service.rotate_session(session, refresh_token)
    _apply(response, issued)

    profile = await session.get(UserProfile, issued.user_id)
    return SessionOut(
        user_id=str(issued.user_id),
        onboarded=issued.onboarded,
        claimed=bool(profile and profile.claimed_at),
    )


@router.post("/claim", response_model=AuthAck)
async def claim(
    payload: DestinationIn,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> AuthAck:
    code = await service.start_claim(session, user.id, payload.destination)
    return AuthAck(dev_code=code)


@router.post("/login", response_model=AuthAck)
async def login(
    payload: DestinationIn,
    session: AsyncSession = Depends(get_session),
) -> AuthAck:
    code = await service.start_login(session, payload.destination)
    return AuthAck(dev_code=code)


@router.post("/verify", response_model=SessionOut)
async def verify(
    payload: VerifyIn,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> SessionOut:
    issued = await service.verify_code(session, payload.destination, payload.code)
    _apply(response, issued)

    progress = await session.get(OnboardingProgress, issued.user_id)
    return SessionOut(
        user_id=str(issued.user_id),
        onboarded=bool(progress and progress.completed_at),
        claimed=True,
    )


@router.post("/logout", status_code=204)
async def logout(
    refresh_token: str | None = Depends(get_refresh_token),
    session: AsyncSession = Depends(get_session),
) -> Response:
    await service.revoke_session(session, refresh_token)
    # Clear on the response that is actually returned -- setting headers on an
    # injected Response and then returning a different one drops them.
    response = Response(status_code=204)
    clear_session_cookies(response)
    return response
