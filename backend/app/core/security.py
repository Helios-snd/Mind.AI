"""Session tokens, cookies and one-time codes.

Two cookies, both httpOnly so nothing is readable from JavaScript:

  mind_session  short-lived access JWT. Carries `sub` (user id) and `onb`
                (onboarding complete). middleware.ts decodes `onb` for a
                redirect decision only -- it is never the authorization
                boundary. The API verifies the signature on every request.
  mind_refresh  opaque random token. Only its hash is stored.

A separate, parallel pair exists for the counsellor console
(console_session/console_refresh, below) -- a different cookie name, a
different claim shape (`typ: "counsellor"`, checked explicitly rather than
only implied by which cookie it arrived on), and a different principal
entirely (Counsellor, never User). See app/modules/counsellors and the G
plan's Context for why the two are never allowed to share a code path.
"""

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
import jwt
from fastapi import Response

from app.core.config import settings
from app.core.errors import NotAuthenticated

ACCESS_COOKIE = "mind_session"
REFRESH_COOKIE = "mind_refresh"
# Readable by JavaScript on purpose. Carries no secret and grants nothing --
# it only lets the marketing layout decide whether to render the student tab
# bar without making an API call, which would mint an account just from
# browsing the public site.
STAGE_COOKIE = "mind_stage"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(user_id: UUID, onboarded: bool) -> str:
    expires = _now() + timedelta(minutes=settings.access_token_minutes)
    payload = {
        "sub": str(user_id),
        "onb": onboarded,
        "iat": int(_now().timestamp()),
        "exp": int(expires.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
    except jwt.PyJWTError as exc:
        raise NotAuthenticated("Session token is not valid") from exc


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    """Refresh tokens are high-entropy, so a fast hash is appropriate here --
    they are not user-chosen passwords."""
    return hashlib.sha256(token.encode()).hexdigest()


def tokens_match(token: str, stored_hash: str) -> bool:
    return hmac.compare_digest(hash_token(token), stored_hash)


def generate_login_code() -> str:
    """Six digits, uniformly distributed. secrets.randbelow avoids the modulo
    bias a naive randint-on-a-range would introduce."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_login_code(code: str) -> str:
    return hashlib.sha256(f"{code}{settings.jwt_secret}".encode()).hexdigest()


def codes_match(code: str, stored_hash: str) -> bool:
    return hmac.compare_digest(hash_login_code(code), stored_hash)


def _cookie_kwargs() -> dict:
    kwargs = {
        "httponly": True,
        "secure": settings.cookie_secure,
        # Lax is correct because the frontend proxies /api/v1/* through Next,
        # making these first-party cookies. See next.config.mjs.
        "samesite": "lax",
        "path": "/",
    }
    if settings.cookie_domain:
        kwargs["domain"] = settings.cookie_domain
    return kwargs


def set_session_cookies(
    response: Response, access: str, refresh: str | None, onboarded: bool = False
) -> None:
    response.set_cookie(
        ACCESS_COOKIE,
        access,
        max_age=settings.access_token_minutes * 60,
        **_cookie_kwargs(),
    )
    if refresh is not None:
        response.set_cookie(
            REFRESH_COOKIE,
            refresh,
            max_age=settings.refresh_token_days * 86400,
            **_cookie_kwargs(),
        )

    stage_kwargs = _cookie_kwargs() | {"httponly": False}
    response.set_cookie(
        STAGE_COOKIE,
        "onboarded" if onboarded else "anon",
        max_age=settings.refresh_token_days * 86400,
        **stage_kwargs,
    )


def clear_session_cookies(response: Response) -> None:
    for name in (ACCESS_COOKIE, REFRESH_COOKIE, STAGE_COOKIE):
        response.delete_cookie(
            name,
            path="/",
            domain=settings.cookie_domain or None,
        )


def refresh_expiry() -> datetime:
    return _now() + timedelta(days=settings.refresh_token_days)


def login_code_expiry() -> datetime:
    return _now() + timedelta(minutes=settings.login_code_ttl_minutes)


def hash_password(password: str) -> str:
    """bcrypt, unlike hash_token/hash_login_code above -- a counsellor's
    password is user-chosen and comparatively low-entropy, so it needs a
    slow, salted hash rather than a fast one."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, stored_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), stored_hash.encode())


# --- Counsellor console: a fully separate token pair -------------------------

CONSOLE_ACCESS_COOKIE = "console_session"
CONSOLE_REFRESH_COOKIE = "console_refresh"


def create_console_access_token(counsellor_id: UUID) -> str:
    expires = _now() + timedelta(minutes=settings.access_token_minutes)
    payload = {
        "sub": str(counsellor_id),
        # Checked explicitly by current_counsellor, not just implied by
        # which cookie the token arrived on -- defense in depth against the
        # two principal types ever being confused with each other.
        "typ": "counsellor",
        "iat": int(_now().timestamp()),
        "exp": int(expires.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_console_access_token(token: str) -> dict:
    try:
        claims = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
    except jwt.PyJWTError as exc:
        raise NotAuthenticated("Session token is not valid") from exc
    if claims.get("typ") != "counsellor":
        raise NotAuthenticated("Not a counsellor session")
    return claims


def set_console_session_cookies(
    response: Response, access: str, refresh: str | None
) -> None:
    response.set_cookie(
        CONSOLE_ACCESS_COOKIE,
        access,
        max_age=settings.access_token_minutes * 60,
        **_cookie_kwargs(),
    )
    if refresh is not None:
        response.set_cookie(
            CONSOLE_REFRESH_COOKIE,
            refresh,
            max_age=settings.refresh_token_days * 86400,
            **_cookie_kwargs(),
        )


def clear_console_session_cookies(response: Response) -> None:
    for name in (CONSOLE_ACCESS_COOKIE, CONSOLE_REFRESH_COOKIE):
        response.delete_cookie(
            name,
            path="/",
            domain=settings.cookie_domain or None,
        )
