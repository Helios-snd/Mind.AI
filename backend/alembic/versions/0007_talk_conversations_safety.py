"""talk conversations messages and safety assessments

Revision ID: 0007
Revises: 0006
"""

from alembic import op
import sqlalchemy as sa


revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "conversations",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=True),
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_conversations_user_id",
        "conversations",
        ["user_id"],
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("conversation_id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["conversations.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_messages_conversation_id",
        "messages",
        ["conversation_id"],
    )

    op.create_index(
        "ix_messages_user_id",
        "messages",
        ["user_id"],
    )

    op.create_table(
        "safety_assessments",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("conversation_id", sa.UUID(), nullable=False),
        sa.Column("message_id", sa.UUID(), nullable=False),
        sa.Column("lexicon_tier", sa.Integer(), nullable=False),
        sa.Column("classifier_tier", sa.Integer(), nullable=False),
        sa.Column("tier", sa.Integer(), nullable=False),
        sa.Column("reason_code", sa.String(length=100), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("model", sa.String(length=200), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_status", sa.String(length=30), nullable=False),
        sa.Column("details", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["conversations.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["message_id"],
            ["messages.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_safety_assessments_user_id",
        "safety_assessments",
        ["user_id"],
    )

    op.create_index(
        "ix_safety_assessments_conversation_id",
        "safety_assessments",
        ["conversation_id"],
    )

    op.create_index(
        "ix_safety_assessments_message_id",
        "safety_assessments",
        ["message_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_safety_assessments_message_id",
        table_name="safety_assessments",
    )
    op.drop_index(
        "ix_safety_assessments_conversation_id",
        table_name="safety_assessments",
    )
    op.drop_index(
        "ix_safety_assessments_user_id",
        table_name="safety_assessments",
    )
    op.drop_table("safety_assessments")

    op.drop_index(
        "ix_messages_user_id",
        table_name="messages",
    )
    op.drop_index(
        "ix_messages_conversation_id",
        table_name="messages",
    )
    op.drop_table("messages")

    op.drop_index(
        "ix_conversations_user_id",
        table_name="conversations",
    )
    op.drop_table("conversations")
