"""Identity tables. Kept separate from onboarding and health data so access
control and deletion can be reasoned about per family."""

from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, Timestamped, UUIDPrimaryKey


class Institution(UUIDPrimaryKey, Timestamped, Base):
    __tablename__ = "institutions"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)


class User(UUIDPrimaryKey, Timestamped, Base):
    __tablename__ = "users"

    # Soft delete. The hard purge is a scheduled job, so a deletion request is
    # acknowledged instantly while the cascade runs.
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    profile: Mapped["UserProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"
    # Named constraints plus plain indexes, matching migration 0001. Declaring
    # unique=True on the columns instead would ask SQLAlchemy for a unique
    # *index*, which is functionally equivalent but a different object -- and
    # autogenerate would then propose dropping and recreating both on a live
    # table for no behavioural gain.
    __table_args__ = (
        UniqueConstraint("email", name="uq_user_profiles_email"),
        UniqueConstraint("phone", name="uq_user_profiles_phone"),
    )

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    # Language lives here but is serialised into the OnboardingProgress payload,
    # because src/i18n/index.ts:41 reads it from useOnboardingProgress().
    # Moving it would break language switching.
    language: Mapped[str] = mapped_column(String(5), default="en", nullable=False)

    name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    # Stored lowercased by the service so the unique index is case-insensitive
    # without requiring the citext extension.
    email: Mapped[str | None] = mapped_column(String(254), nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    institution_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("institutions.id"), nullable=True
    )
    # Null means the account is still anonymous and has no recovery path.
    claimed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped[User] = relationship(back_populates="profile")
