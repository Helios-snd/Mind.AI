"""Escalation events and the student-facing brief that precedes a referral.

Two tables, deliberately not the blueprint's full referral/appointment/
counsellor-note sketch -- G's console reads a purpose-built, share_scope-
bounded view composed from these two plus checkins/talk, not a generic
"referral" abstraction. `fired_by` is 'trend' (E1, Trend-driven), 'manual'
(F3, the student asking directly from /human), or 'safety' (reserved --
E2/E3 ended up using safety_assessments.review_status instead, since tier-3
acts without asking permission; nothing writes 'safety' here today).
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

    # 'trend' | 'safety' | 'manual'. 'trend' (E1) and 'manual' (F3) are
    # produced today; 'safety' is reserved but unused -- see the module
    # docstring above.
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

    # G: distinct from resolved_at/status above, which are the *student's*
    # decision (approve/decline). This is whether a counsellor has since
    # looked at an approved one -- the state that actually lets the console
    # queue empty out. Null status columns above already predate this; a
    # declined escalation is never released, so it never reaches this field.
    counsellor_reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    reviewed_by_counsellor_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("counsellors.id", ondelete="SET NULL"),
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
