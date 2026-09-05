"""Counsellor account creation and authentication.

create_counsellor is called only by app/scripts/create_counsellor.py -- there
is no signup endpoint, on purpose (see the G plan's provisioning decision).
"""

import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotAuthenticated
from app.core.logging import log_event
from app.core.security import (
    generate_refresh_token,
    hash_password,
    hash_token,
    refresh_expiry,
    tokens_match,
    verify_password,
)
from app.core.validators import normalise_email
from app.db.base import utcnow
from app.modules.counsellors.models import Counsellor, CounsellorSession

logger = logging.getLogger(__name__)


class IssuedConsoleSession:
    __slots__ = ("counsellor_id", "refresh_token")

    def __init__(self, counsellor_id: UUID, refresh_token: str):
        self.counsellor_id = counsellor_id
        self.refresh_token = refresh_token


async def create_counsellor(
    session: AsyncSession, email: str, name: str, password: str
) -> Counsellor:
    counsellor = Counsellor(
        email=normalise_email(email),
        name=name,
        password_hash=hash_password(password),
    )
    session.add(counsellor)
    await session.flush()
    log_event(logger, "counsellor.created", counsellor_id=str(counsellor.id))
    return counsellor


async def authenticate(
    session: AsyncSession, email: str, password: str
) -> Counsellor | None:
    """Wrong email and wrong password fail identically to the caller -- same
    "the response must not reveal who has an account" shape auth/service.py's
    start_login already follows for students."""
    counsellor = (
        await session.scalars(
            select(Counsellor).where(Counsellor.email == normalise_email(email))
        )
    ).first()
    if counsellor is None or counsellor.deactivated_at is not None:
        return None
    if not verify_password(password, counsellor.password_hash):
        return None
    return counsellor


async def issue_console_session(
    session: AsyncSession, counsellor_id: UUID
) -> IssuedConsoleSession:
    refresh_token = generate_refresh_token()
    session.add(
        CounsellorSession(
            counsellor_id=counsellor_id,
            refresh_token_hash=hash_token(refresh_token),
            expires_at=refresh_expiry(),
        )
    )
    await session.flush()
    return IssuedConsoleSession(counsellor_id, refresh_token)


async def rotate_console_session(
    session: AsyncSession, refresh_token: str
) -> IssuedConsoleSession:
    row = (
        await session.scalars(
            select(CounsellorSession).where(
                CounsellorSession.refresh_token_hash == hash_token(refresh_token)
            )
        )
    ).first()

    now = utcnow()
    if row is None or row.revoked_at is not None or row.expires_at <= now:
        raise NotAuthenticated("Refresh token is not usable")
    if not tokens_match(refresh_token, row.refresh_token_hash):
        raise NotAuthenticated("Refresh token is not usable")

    counsellor = await session.get(Counsellor, row.counsellor_id)
    if counsellor is None or counsellor.deactivated_at is not None:
        raise NotAuthenticated("Account no longer exists")

    row.revoked_at = now
    return await issue_console_session(session, row.counsellor_id)


async def revoke_console_session(
    session: AsyncSession, refresh_token: str | None
) -> None:
    if not refresh_token:
        return
    row = (
        await session.scalars(
            select(CounsellorSession).where(
                CounsellorSession.refresh_token_hash == hash_token(refresh_token)
            )
        )
    ).first()
    if row and row.revoked_at is None:
        row.revoked_at = utcnow()
