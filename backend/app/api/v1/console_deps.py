"""The counsellor console's authorization boundary.

Mirrors app/api/v1/deps.py::current_user exactly in shape, but reads a
completely different cookie, decodes a completely different token, and loads
a completely different table. See app/modules/counsellors/models.py and the
G plan's Context for why the two are never allowed to share a code path --
this file existing separately from deps.py is itself part of that guarantee.
"""

from uuid import UUID

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotAuthenticated
from app.core.security import CONSOLE_ACCESS_COOKIE, decode_console_access_token
from app.db.session import get_session
from app.modules.counsellors.models import Counsellor


async def current_counsellor(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> Counsellor:
    token = request.cookies.get(CONSOLE_ACCESS_COOKIE)
    if not token:
        raise NotAuthenticated("No console session cookie")

    claims = decode_console_access_token(token)
    try:
        counsellor_id = UUID(claims["sub"])
    except (KeyError, ValueError) as exc:
        raise NotAuthenticated("Malformed session token") from exc

    counsellor = await session.get(Counsellor, counsellor_id)
    if counsellor is None or counsellor.deactivated_at is not None:
        raise NotAuthenticated("Account no longer exists")
    return counsellor
