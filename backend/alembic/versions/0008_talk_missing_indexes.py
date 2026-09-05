"""Add the two indexes the model declared but migration 0007 never created.

conversations.last_message_at is index=True on the model (it drives
"most recent conversation" ordering); safety_assessments.tier is index=True
too (it drives "every unreviewed tier-3 event" queries for the human-review
workflow). Neither existed in the deployed schema until now -- caught by
running --autogenerate against the corrected model metadata.

Revision ID: 0008
Revises: 0007
"""

import sqlalchemy as sa
from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_conversations_last_message_at",
        "conversations",
        ["last_message_at"],
    )
    op.create_index(
        "ix_safety_assessments_tier",
        "safety_assessments",
        ["tier"],
    )


def downgrade() -> None:
    op.drop_index("ix_safety_assessments_tier", table_name="safety_assessments")
    op.drop_index("ix_conversations_last_message_at", table_name="conversations")
