"""Account creation, session issue/rotation, and one-time-code flows."""

import logging
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import NotAuthenticated, TooManyAttempts, ValidationFailed
from app.core.logging import log_event
from app.core.security import (
    codes_match,
    generate_login_code,
    generate_refresh_token,
    hash_login_code,
    hash_token,
    login_code_expiry,
    refresh_expiry,
    tokens_match,
)
from app.core.validators import (
    is_email,
    normalise_email,
    normalise_phone,
    phone_looks_valid,
)
from app.db.base import utcnow
from app.modules.auth.models import AuthSession, LoginCode
from app.modules.checkins.models import CheckIn, Signal
from app.modules.onboarding.models import (
    BaselineAnswer,
    ConsentEvent,
    CrisisPlan,
    OnboardingProgress,
    TrustedContact,
)
from app.modules.users.models import User, UserProfile

logger = logging.getLogger(__name__)


class IssuedSession:
    __slots__ = ("user_id", "refresh_token", "onboarded")

    def __init__(self, user_id: UUID, refresh_token: str, onboarded: bool):
        self.user_id = user_id
        self.refresh_token = refresh_token
        self.onboarded = onboarded


async def create_anonymous_user(session: AsyncSession) -> User:
    """An account with no identity attached. Onboarding runs on this, so there
    is no signup wall before the student has seen anything useful."""
    user = User()
    session.add(user)
    await session.flush()

    session.add(UserProfile(user_id=user.id, language="en"))
    session.add(OnboardingProgress(user_id=user.id, step=1))
    await session.flush()

    log_event(logger, "auth.anonymous_created", user_id=str(user.id))
    return user


async def issue_session(
    session: AsyncSession, user_id: UUID, onboarded: bool
) -> IssuedSession:
    refresh_token = generate_refresh_token()
    session.add(
        AuthSession(
            user_id=user_id,
            refresh_token_hash=hash_token(refresh_token),
            expires_at=refresh_expiry(),
        )
    )
    await session.flush()
    return IssuedSession(user_id, refresh_token, onboarded)


async def rotate_session(session: AsyncSession, refresh_token: str) -> IssuedSession:
    """Single-use refresh tokens: the presented one is revoked and a fresh one
    issued, so a leaked token stops working the moment the real client rotates."""
    row = (
        await session.scalars(
            select(AuthSession).where(
                AuthSession.refresh_token_hash == hash_token(refresh_token)
            )
        )
    ).first()

    now = utcnow()
    if row is None or row.revoked_at is not None or row.expires_at <= now:
        raise NotAuthenticated("Refresh token is not usable")
    if not tokens_match(refresh_token, row.refresh_token_hash):
        raise NotAuthenticated("Refresh token is not usable")

    row.revoked_at = now
    progress = await session.get(OnboardingProgress, row.user_id)
    onboarded = bool(progress and progress.completed_at)
    return await issue_session(session, row.user_id, onboarded)


async def revoke_session(session: AsyncSession, refresh_token: str | None) -> None:
    if not refresh_token:
        return
    row = (
        await session.scalars(
            select(AuthSession).where(
                AuthSession.refresh_token_hash == hash_token(refresh_token)
            )
        )
    ).first()
    if row and row.revoked_at is None:
        row.revoked_at = utcnow()


def _normalise_destination(destination: str) -> str:
    destination = (destination or "").strip()
    if not destination:
        raise ValidationFailed("An email or phone number is needed")
    if is_email(destination):
        return normalise_email(destination)
    if not phone_looks_valid(destination):
        raise ValidationFailed(
            "A phone number with the digits, please. Spaces and a +91 are fine."
        )
    return normalise_phone(destination)


async def _find_user_by_destination(
    session: AsyncSession, destination: str
) -> UserProfile | None:
    column = UserProfile.email if is_email(destination) else UserProfile.phone
    return (
        await session.scalars(select(UserProfile).where(column == destination))
    ).first()


async def _issue_code(
    session: AsyncSession, destination: str, user_id: UUID | None
) -> str:
    # Any earlier unconsumed code for this destination is dropped, so a resend
    # invalidates the previous message rather than leaving two codes live.
    await session.execute(
        delete(LoginCode).where(
            LoginCode.destination == destination, LoginCode.consumed_at.is_(None)
        )
    )
    code = generate_login_code()
    session.add(
        LoginCode(
            destination=destination,
            user_id=user_id,
            code_hash=hash_login_code(code),
            expires_at=login_code_expiry(),
        )
    )
    await session.flush()
    return code


async def start_claim(
    session: AsyncSession, user_id: UUID, destination: str
) -> str | None:
    """Attach an identity to the anonymous account the student is already using."""
    destination = _normalise_destination(destination)

    existing = await _find_user_by_destination(session, destination)
    if existing is not None and existing.user_id != user_id:
        raise ValidationFailed("That contact is already linked to another account")

    code = await _issue_code(session, destination, user_id)
    log_event(logger, "auth.claim_started", user_id=str(user_id))
    return code if settings.login_code_echo else None


async def start_login(session: AsyncSession, destination: str) -> str | None:
    """Return flow. Deliberately succeeds whether or not the account exists --
    the response must not reveal who has an account here."""
    destination = _normalise_destination(destination)
    profile = await _find_user_by_destination(session, destination)

    if profile is None:
        log_event(logger, "auth.login_started_unknown_destination")
        return None

    code = await _issue_code(session, destination, profile.user_id)
    log_event(logger, "auth.login_started", user_id=str(profile.user_id))
    return code if settings.login_code_echo else None


async def verify_code(
    session: AsyncSession, destination: str, code: str
) -> IssuedSession:
    destination = _normalise_destination(destination)
    row = (
        await session.scalars(
            select(LoginCode)
            .where(
                LoginCode.destination == destination,
                LoginCode.consumed_at.is_(None),
            )
            .order_by(LoginCode.created_at.desc())
        )
    ).first()

    now = utcnow()
    if row is None or row.expires_at <= now:
        raise NotAuthenticated("That code has expired. Ask for a new one.")

    if row.attempts >= settings.login_code_max_attempts:
        raise TooManyAttempts("Too many tries. Ask for a new code.")

    if not codes_match(code, row.code_hash):
        row.attempts += 1
        # Commit before raising. get_session rolls back the request transaction
        # on any exception, so a flush here would be discarded along with the
        # failure -- leaving attempts permanently at 0 and the lockout below
        # unreachable. Nothing else is pending on this path, so committing the
        # counter on its own is safe.
        await session.commit()
        raise NotAuthenticated("That code is not right")

    row.consumed_at = now
    if row.user_id is None:
        raise NotAuthenticated("That code is no longer usable")

    profile = await session.get(UserProfile, row.user_id)
    if profile is None:
        raise NotAuthenticated("That account no longer exists")

    # First successful verification is what actually attaches the identity.
    if is_email(destination):
        profile.email = destination
    else:
        profile.phone = destination
    if profile.claimed_at is None:
        profile.claimed_at = now
    profile.updated_at = now

    progress = await session.get(OnboardingProgress, row.user_id)
    onboarded = bool(progress and progress.completed_at)

    log_event(logger, "auth.code_verified", user_id=str(row.user_id))
    return await issue_session(session, row.user_id, onboarded)


async def delete_all_data(session: AsyncSession, user_id: UUID) -> None:
    """Erase everything for this account.

    consent_events is purged explicitly rather than by cascade -- it is
    deliberately excluded from the FK cascade so an ordinary deletion elsewhere
    can never destroy the audit trail. A genuine account deletion does remove
    it, and the deletion itself is what gets logged.
    """
    for model in (
        Signal,
        CheckIn,
        BaselineAnswer,
        CrisisPlan,
        TrustedContact,
        OnboardingProgress,
        LoginCode,
        AuthSession,
        ConsentEvent,
    ):
        await session.execute(delete(model).where(model.user_id == user_id))

    await session.execute(delete(UserProfile).where(UserProfile.user_id == user_id))
    await session.execute(delete(User).where(User.id == user_id))
    await session.flush()

    log_event(logger, "account.deleted", user_id=str(user_id))
