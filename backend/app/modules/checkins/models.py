"""Daily check-ins and the structured signals extracted from them."""

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKey


class CheckIn(UUIDPrimaryKey, Base):
    __tablename__ = "checkins"
    # One primary check-in per student per local day, enforced here rather than
    # in React. The localStorage version only *behaved* one-per-day; a double
    # submit could not be prevented by the client alone.
    __table_args__ = (
        UniqueConstraint("user_id", "local_date", name="uq_checkins_user_id"),
    )

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # The student's own calendar day, sent by the client. Not derived from
    # server time: a 1am check-in in Kolkata must not land on the previous day
    # because the server happens to run in UTC.
    local_date: Mapped[date] = mapped_column(Date, nullable=False)
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    mood: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    sleep_hours: Mapped[Decimal] = mapped_column(Numeric(3, 1), nullable=False)
    # Nullable: rows written before these were collected genuinely lack them,
    # and a skipped scale is not a zero.
    energy: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    social: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    # Appetite and getting out are both named in FEATURES.md's description of
    # what SIGNAL observes. Nullable like the rest: a skipped scale is not a
    # zero, and rows written before these existed genuinely lack them.
    appetite: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    activity: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    note: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # The reflection the student was actually shown, stored because it is a
    # fact about that day. Keys today; COMPANION will add free text in the Talk
    # slice without changing this contract.
    ack_key: Mapped[str] = mapped_column(String(60), nullable=False)
    suggestion_title_key: Mapped[str | None] = mapped_column(String(60), nullable=True)
    suggestion_body_key: Mapped[str | None] = mapped_column(String(60), nullable=True)


class Signal(UUIDPrimaryKey, Base):
    """SIGNAL output: observable facts, never interpretations.

    Two origins, deliberately distinguished by `source`:

      "structured"  the student's own scale answers, stored verbatim. These are
                    authoritative and nothing may overwrite them.
      "note"        contextual observations read out of the free-text note.
                    Additive only -- a note can never change a reported value.
    """

    __tablename__ = "signals"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_type: Mapped[str] = mapped_column(String(20), nullable=False)
    source_id: Mapped[UUID] = mapped_column(nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(20), nullable=False)
    kind: Mapped[str] = mapped_column(String(40), nullable=False)
    value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
