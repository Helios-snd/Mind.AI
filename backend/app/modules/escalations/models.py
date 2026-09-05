"""Escalation events and the student-facing brief that precedes a referral.

Two tables, deliberately not the blueprint's full referral/appointment/
counsellor-note sketch: there is no counsellor console yet to read a released
brief, so that plumbing would be an unused abstraction. `fired_by` exists so
this table can be shared later by Safety-triggered tier-3 escalations (E2/E3)
without a second, competing table -- but only 'trend' is written today.
"""

from datetime import datetime
from uuid import UUID

from sqlalchemy import ARRAY, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, Timestamped, UUIDPrimaryKey


class EscalationEvent(UUIDPrimaryKey, Timestamped, Base):
    __tablename__ = "escalation_events"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # 'trend' | 'safety' | 'manual'. Only 'trend' is produced today (E1).
    fired_by: Mapped[str] = mapped_column(String(20), nullable=False)

    # Set only for a future Safety-fired row (E2/E3); null for a trend-fired
    # one like every row this slice creates.
    safety_assessment_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("safety_assessments.id", ondelete="SET NULL"),
        nullable=True,
    )

    tier: Mapped[int] = mapped_column(Integer, nullable=False)

    # 'pending' | 'approved' | 'declined' | 'expired'
    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False,
        index=True,
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # "Declining is not a dead end" (08-safety-and-privacy.md) -- a declined
    # escalation may be re-offered after this, never before.
    re_offer_after: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


class StudentBrief(UUIDPrimaryKey, Base):
    """What the student is shown before anything is releasable, and the
    record of what they decided.

    `reason_summary_key` and `share_scope` are both server-picked, fixed
    vocabulary -- the same pattern checkins/reflection.py already uses for
    Reflection.ackKey -- never freehand text generated for the occasion.
    """

    __tablename__ = "student_briefs"

    escalation_event_id: Mapped[UUID] = mapped_column(
        ForeignKey("escalation_events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    reason_summary_key: Mapped[str] = mapped_column(String(100), nullable=False)

    # Fixed vocabulary describing what a release would include, e.g.
    # ["checkins", "talk_messages", "reason"] -- drives the "what we'd share"
    # bullet list directly, so the copy is never vaguer than what's true.
    share_scope: Mapped[list[str]] = mapped_column(ARRAY(String(40)), nullable=False)

    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    window_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    approved_by_student_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    declined_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Stays null until approved_by_student_at is set. Nothing reads this yet
    # (no counsellor console), but the gate is correct from day one.
    released_to_counsellor_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
