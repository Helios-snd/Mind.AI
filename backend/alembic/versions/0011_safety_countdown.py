"""safety_assessments countdown_status / countdown_resolved_at

Revision ID: 0011
Revises: 0010
"""

from alembic import op
import sqlalchemy as sa


revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "safety_assessments",
        sa.Column("countdown_status", sa.String(length=20), nullable=True),
    )
    op.add_column(
        "safety_assessments",
        sa.Column("countdown_resolved_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_index(
        "ix_safety_assessments_countdown_status",
        "safety_assessments",
        ["countdown_status"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_safety_assessments_countdown_status",
        table_name="safety_assessments",
    )
    op.drop_column("safety_assessments", "countdown_resolved_at")
    op.drop_column("safety_assessments", "countdown_status")
