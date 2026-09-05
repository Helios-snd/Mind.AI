"""safety_assessments.tier3_kind

Revision ID: 0010
Revises: 0009
"""

from alembic import op
import sqlalchemy as sa


revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "safety_assessments",
        sa.Column("tier3_kind", sa.String(length=4), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("safety_assessments", "tier3_kind")
