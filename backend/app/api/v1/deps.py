"""Request dependencies.

This is the actual authorization boundary. middleware.ts redirects for UX, but
every protected request is verified here against a signed token and live
database state.
"""

from uuid import UUID

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotAuthenticated, OnboardingIncomplete
from app.core.security import ACCESS_COOKIE, REFRESH_COOKIE, decode_access_token
from app.db.session import get_session
from app.modules.onboarding.models import OnboardingProgress
from app.modules.users.models import User


def get_refresh_token(request: Request) -> str | None:
    return request.cookies.get(REFRESH_COOKIE)


async def current_user(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> User:
    token = request.cookies.get(ACCESS_COOKIE)
    if not token:
        raise NotAuthenticated("No session cookie")

    claims = decode_access_token(token)
    try:
        user_id = UUID(claims["sub"])
    except (KeyError, ValueError) as exc:
        raise NotAuthenticated("Malformed session token") from exc

    user = await session.get(User, user_id)
    # A token can outlive the account it names -- deletion is the obvious case.
    if user is None or user.deleted_at is not None:
        raise NotAuthenticated("Account no longer exists")
    return user


async def onboarded_user(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> User:
    """For routes that need a finished account. The `onb` claim in the token is
    never trusted for this -- the database is."""
    progress = await session.get(OnboardingProgress, user.id)
    if progress is None or progress.completed_at is None:
        raise OnboardingIncomplete("Onboarding is not finished")
    return user
