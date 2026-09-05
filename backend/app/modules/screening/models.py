"""Screening sessions and their scores.

Scores live server-side only. The student never sees a subscale name or a
severity band -- hard constraint 1, "never diagnoses". These rows exist for the
counsellor brief and for TREND, not for the app UI.
"""

from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKey


class ScreeningSession(UUIDPrimaryKey, Base):
    __tablename__ = "screening_sessions"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    instrument: Mapped[str] = mapped_column(String(20), nullable=False)
    # 'onboarding' now; 'drift' and 'scheduled' arrive with the Screening slice.
    trigger: Mapped[str] = mapped_column(String(20), nullable=False)
    language: Mapped[str] = mapped_column(String(5), nullable=False)
    # False when the instrument was answered in a language whose translation has
    # not been psychometrically validated. Carried on the row rather than
    # inferred later, so a score can never be read as clinical by accident.
    instrument_validated: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    # A positive response to an instrument's explicitly safety-sensitive item
    # is never interpreted by this module.  `needs_review` is fail-closed until
    # the authoritative Safety slice can make a decision.
    safety_state: Mapped[str] = mapped_column(
        String(20), nullable=False, default="not_applicable"
    )


class ScreeningScore(UUIDPrimaryKey, Base):
    __tablename__ = "screening_scores"

    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("screening_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    subscale: Mapped[str] = mapped_column(String(20), nullable=False)
    # DASS-21 raw score: sum of the subscale's items, doubled for DASS-42
    # comparability.
    raw: Mapped[int] = mapped_column(Integer, nullable=False)
    # 60, not 20: ASRS writes "further evaluation may be worthwhile", which is
    # 36 characters and silently blew up the insert at the old width.
    severity_band: Mapped[str] = mapped_column(String(60), nullable=False)
    # How many of the subscale's items were actually answered. A partial
    # instrument still scores, but the brief must be able to say so.
    items_answered: Mapped[int] = mapped_column(Integer, nullable=False)


class ScreeningAnswer(UUIDPrimaryKey, Base):
    """Verbatim instrument answer, retained with its completed session.

    The row deliberately has no free text: validated instruments are structured
    response scales, and storing the item id plus its answer makes later
    scoring auditable without duplicating the questionnaire wording in the DB.
    """

    __tablename__ = "screening_answers"

    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("screening_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_id: Mapped[str] = mapped_column(String(32), nullable=False)
    value: Mapped[int] = mapped_column(Integer, nullable=False)
