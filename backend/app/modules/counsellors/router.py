"""Counsellor auth endpoints. Every one sets or clears the console cookies --
never the student mind_session/mind_refresh pair."""

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.console_deps import current_counsellor
from app.core.errors import NotAuthenticated
from app.core.security import (
    CONSOLE_REFRESH_COOKIE,
    clear_console_session_cookies,
    create_console_access_token,
    set_console_session_cookies,
)
from app.db.session import get_session
from app.modules.counsellors import service
from app.modules.counsellors.models import Counsellor
from app.modules.counsellors.schemas import CounsellorLoginIn, CounsellorOut

router = APIRouter(prefix="/console/auth", tags=["console-auth"])


def _get_console_refresh_token(request: Request) -> str | None:
    return request.cookies.get(CONSOLE_REFRESH_COOKIE)


def _out(counsellor: Counsellor) -> CounsellorOut:
    return CounsellorOut(id=str(counsellor.id), email=counsellor.email, name=counsellor.name)


def _apply(response: Response, issued: service.IssuedConsoleSession) -> None:
    access = create_console_access_token(issued.counsellor_id)
    set_console_session_cookies(response, access, issued.refresh_token)


@router.post("/login", response_model=CounsellorOut)
async def login(
    payload: CounsellorLoginIn,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> CounsellorOut:
    counsellor = await service.authenticate(session, payload.email, payload.password)
    if counsellor is None:
        raise NotAuthenticated("Email or password is not right")

    issued = await service.issue_console_session(session, counsellor.id)
    _apply(response, issued)
    return _out(counsellor)


@router.post("/refresh", response_model=CounsellorOut)
async def refresh(
    response: Response,
    refresh_token: str | None = Depends(_get_console_refresh_token),
    session: AsyncSession = Depends(get_session),
) -> CounsellorOut:
    if not refresh_token:
        raise NotAuthenticated("No refresh cookie")

    issued = await service.rotate_console_session(session, refresh_token)
    _apply(response, issued)

    counsellor = await session.get(Counsellor, issued.counsellor_id)
    return _out(counsellor)


@router.post("/logout", status_code=204)
async def logout(
    refresh_token: str | None = Depends(_get_console_refresh_token),
    session: AsyncSession = Depends(get_session),
) -> Response:
    await service.revoke_console_session(session, refresh_token)
    response = Response(status_code=204)
    clear_console_session_cookies(response)
    return response


@router.get("/me", response_model=CounsellorOut)
async def me(counsellor: Counsellor = Depends(current_counsellor)) -> CounsellorOut:
    return _out(counsellor)
