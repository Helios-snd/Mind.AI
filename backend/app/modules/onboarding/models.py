"""Onboarding, crisis plan and consent tables."""

from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    DateTime,
    ForeignKey,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, Timestamped, UUIDPrimaryKey


class OnboardingProgress(Base):
    __tablename__ = "onboarding_progress"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    # 1 language, 2 baseline, 3 consent, 4 crisis plan, 5 claim.
    step: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
    consent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    # Presence of this is the app-wide onboarding gate.
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class BaselineAnswer(UUIDPrimaryKey, Base):
    __tablename__ = "baseline_answers"
    __table_args__ = (UniqueConstraint("user_id", "item_id"),)

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # 'dass-3', 'dass-5', 'dass-10', ... -- matches Dass21Item.id.
    item_id: Mapped[str] = mapped_column(String(32), nullable=False)
    value: Mapped[int] = mapped_column(SmallInteger, nullable=False)  # 0..3
    answered_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class ConsentEvent(UUIDPrimaryKey, Base):
    """Append-only. Never updated, and deliberately excluded from the ordinary
    delete cascade so a routine deletion cannot destroy the audit trail --
    "did this student consent, and to which version" must stay answerable."""

    __tablename__ = "consent_events"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    kind: Mapped[str] = mapped_column(String(40), nullable=False)
    policy_version: Mapped[str] = mapped_column(String(40), nullable=False)
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class CrisisPlan(Base):
    __tablename__ = "crisis_plans"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    who_id_call: Mapped[str] = mapped_column(Text, default="", nullable=False)
    what_helps: Mapped[str] = mapped_column(Text, default="", nullable=False)
    what_makes_it_worse: Mapped[str] = mapped_column(Text, default="", nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class TrustedContact(Base):
    """The contact is never defaulted to a parent (hard constraint 9), which is
    why `relationship` is free text with no enum."""

    __tablename__ = "trusted_contacts"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    name: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    relationship: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    phone: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
