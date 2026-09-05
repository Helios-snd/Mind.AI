"""Public screening answer storage and safety state.

Revision ID: 0004
Revises: 0003
"""

from alembic import op
import sqlalchemy as sa


revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "screening_sessions",
        sa.Column("safety_state", sa.String(length=20), nullable=False, server_default="not_applicable"),
    )
    op.create_table(
        "screening_answers",
        sa.Column("session_id", sa.Uuid(), nullable=False),
        sa.Column("item_id", sa.String(length=32), nullable=False),
        sa.Column("value", sa.Integer(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["screening_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_screening_answers_session_id", "screening_answers", ["session_id"])


def downgrade() -> None:
    op.drop_index("ix_screening_answers_session_id", table_name="screening_answers")
    op.drop_table("screening_answers")
    op.drop_column("screening_sessions", "safety_state")
