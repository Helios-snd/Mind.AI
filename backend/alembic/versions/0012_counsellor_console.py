"""counsellors, counsellor_sessions, and reviewed-by columns

Revision ID: 0012
Revises: 0011
"""

from alembic import op
import sqlalchemy as sa


revision = "0012"
down_revision = "0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "counsellors",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=200), nullable=False),
        sa.Column("deactivated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_counsellors_email"),
    )

    op.create_table(
        "counsellor_sessions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("counsellor_id", sa.UUID(), nullable=False),
        sa.Column("refresh_token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["counsellor_id"],
            ["counsellors.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_counsellor_sessions_counsellor_id",
        "counsellor_sessions",
        ["counsellor_id"],
    )
    op.create_index(
        "ix_counsellor_sessions_refresh_token_hash",
        "counsellor_sessions",
        ["refresh_token_hash"],
    )

    op.add_column(
        "safety_assessments",
        sa.Column("reviewed_by_counsellor_id", sa.UUID(), nullable=True),
    )
    op.create_foreign_key(
        "fk_safety_assessments_reviewed_by_counsellor_id_counsellors",
        "safety_assessments",
        "counsellors",
        ["reviewed_by_counsellor_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.add_column(
        "escalation_events",
        sa.Column("counsellor_reviewed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "escalation_events",
        sa.Column("reviewed_by_counsellor_id", sa.UUID(), nullable=True),
    )
    op.create_foreign_key(
        "fk_escalation_events_reviewed_by_counsellor_id_counsellors",
        "escalation_events",
        "counsellors",
        ["reviewed_by_counsellor_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_escalation_events_reviewed_by_counsellor_id_counsellors",
        "escalation_events",
        type_="foreignkey",
    )
    op.drop_column("escalation_events", "reviewed_by_counsellor_id")
    op.drop_column("escalation_events", "counsellor_reviewed_at")

    op.drop_constraint(
        "fk_safety_assessments_reviewed_by_counsellor_id_counsellors",
        "safety_assessments",
        type_="foreignkey",
    )
    op.drop_column("safety_assessments", "reviewed_by_counsellor_id")

    op.drop_index(
        "ix_counsellor_sessions_refresh_token_hash",
        table_name="counsellor_sessions",
    )
    op.drop_index(
        "ix_counsellor_sessions_counsellor_id",
        table_name="counsellor_sessions",
    )
    op.drop_table("counsellor_sessions")

    op.drop_table("counsellors")
