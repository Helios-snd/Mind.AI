"""escalation events and student briefs

Revision ID: 0009
Revises: 0008
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "escalation_events",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("fired_by", sa.String(length=20), nullable=False),
        sa.Column("safety_assessment_id", sa.UUID(), nullable=True),
        sa.Column("tier", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("re_offer_after", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["safety_assessment_id"],
            ["safety_assessments.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_escalation_events_user_id",
        "escalation_events",
        ["user_id"],
    )

    op.create_index(
        "ix_escalation_events_status",
        "escalation_events",
        ["status"],
    )

    op.create_table(
        "student_briefs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("escalation_event_id", sa.UUID(), nullable=False),
        sa.Column("reason_summary_key", sa.String(length=100), nullable=False),
        sa.Column("share_scope", postgresql.ARRAY(sa.String(length=40)), nullable=False),
        sa.Column("window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("window_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("approved_by_student_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("declined_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("released_to_counsellor_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["escalation_event_id"],
            ["escalation_events.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_student_briefs_escalation_event_id",
        "student_briefs",
        ["escalation_event_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_student_briefs_escalation_event_id",
        table_name="student_briefs",
    )
    op.drop_table("student_briefs")

    op.drop_index(
        "ix_escalation_events_status",
        table_name="escalation_events",
    )
    op.drop_index(
        "ix_escalation_events_user_id",
        table_name="escalation_events",
    )
    op.drop_table("escalation_events")
