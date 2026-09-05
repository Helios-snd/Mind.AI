"""Counsellor identity and sessions.

Deliberately not a User row with a flag: a Counsellor is a wholly separate
principal type, with its own table, its own JWT cookies (core/security.py's
CONSOLE_ACCESS_COOKIE/CONSOLE_REFRESH_COOKIE), and its own dependency
(app/api/v1/console_deps.py::current_counsellor). Two disjoint identity
systems can't be confused with each other by construction -- see the G plan's
Context for why that matters more here than anywhere else in this app.

No self-serve signup: accounts are created only by
app/scripts/create_counsellor.py, run directly against the database.
"""

from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, Timestamped, UUIDPrimaryKey


class Counsellor(UUIDPrimaryKey, Timestamped, Base):
    __tablename__ = "counsellors"

    # Stored lowercased by the service, same convention as
    # UserProfile.email, so uniqueness doesn't depend on the citext
    # extension.
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(200), nullable=False)

    # Soft-disable, mirrors User.deleted_at. A deactivated counsellor's
    # token still decodes -- current_counsellor is what actually rejects it,
    # same "the API is the authorization boundary" rule as the student side.
    deactivated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class CounsellorSession(UUIDPrimaryKey, Timestamped, Base):
    __tablename__ = "counsellor_sessions"

    counsellor_id: Mapped[UUID] = mapped_column(
        ForeignKey("counsellors.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # The hash, never the token -- identical pattern to AuthSession.
    refresh_token_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
