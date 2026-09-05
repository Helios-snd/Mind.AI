from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    JSON,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import (
    Base,
    Timestamped,
    UUIDPrimaryKey,
)


class SafetyAssessment(
    UUIDPrimaryKey,
    Timestamped,
    Base,
):
    __tablename__ = "safety_assessments"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    conversation_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "conversations.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    message_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "messages.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    lexicon_tier: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    classifier_tier: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    tier: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    # "3a" | "3b" | null. Null below tier 3 -- see app/agents/safety/
    # imminence.py, the deterministic gate that decides this once tier is
    # already 3. Not a new review mechanism: review_status/reviewed_at below
    # already flag every tier-3 row for human review regardless of kind.
    tier3_kind: Mapped[str | None] = mapped_column(
        String(4),
        nullable=True,
    )

    reason_code: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    model: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Who, not just when -- G's counsellor console. ON DELETE SET NULL:
    # losing the attribution of who reviewed a case must never cascade into
    # losing the review itself (reviewed_at/review_status are untouched by a
    # counsellor account going away).
    reviewed_by_counsellor_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("counsellors.id", ondelete="SET NULL"),
        nullable=True,
    )

    review_status: Mapped[str] = mapped_column(
        String(30),
        default="not_required",
        nullable=False,
    )

    # JSON, matching the deployed column -- structured audit detail (which
    # lexicon pattern matched, the classifier's raw fields) belongs here, not
    # as a pre-serialised string.
    details: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    # State for the tier-3B countdown (E3). Null for tier < 3 and for 3a rows
    # -- only a 3b verdict ever gets a countdown. "pending" is set at the
    # same moment the row is created; "cancelled"/"expired" are set either by
    # the student's own client (interaction, or the timer reaching zero) or
    # by the lazy sweep in talk/service.py::expire_stale_countdowns for a
    # client that disappeared mid-countdown. created_at above doubles as
    # "when the countdown started" -- no separate column needed for that.
    countdown_status: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        index=True,
    )

    countdown_resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )