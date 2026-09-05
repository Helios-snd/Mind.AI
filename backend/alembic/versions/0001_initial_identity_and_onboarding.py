"""Initial schema: identity, onboarding, crisis plan, consent.

Slice 1 of docs/blueprint/09-slice-order.md. Ten tables.

Constraint names are written out to match the naming_convention in
app/db/base.py, so a later --autogenerate does not report spurious diffs.

Revision ID: 0001
Revises:
"""

import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "institutions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_institutions"),
        sa.UniqueConstraint("slug", name="uq_institutions_slug"),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_users"),
    )

    op.create_table(
        "user_profiles",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("language", sa.String(length=5), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=True),
        sa.Column("email", sa.String(length=254), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("institution_id", sa.Uuid(), nullable=True),
        sa.Column("claimed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_user_profiles_user_id_users",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["institution_id"],
            ["institutions.id"],
            name="fk_user_profiles_institution_id_institutions",
        ),
        sa.PrimaryKeyConstraint("user_id", name="pk_user_profiles"),
        sa.UniqueConstraint("email", name="uq_user_profiles_email"),
        sa.UniqueConstraint("phone", name="uq_user_profiles_phone"),
    )
    op.create_index("ix_user_profiles_email", "user_profiles", ["email"])
    op.create_index("ix_user_profiles_phone", "user_profiles", ["phone"])

    op.create_table(
        "auth_sessions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("refresh_token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_auth_sessions_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_auth_sessions"),
    )
    op.create_index("ix_auth_sessions_user_id", "auth_sessions", ["user_id"])
    op.create_index(
        "ix_auth_sessions_refresh_token_hash", "auth_sessions", ["refresh_token_hash"]
    )

    op.create_table(
        "login_codes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("destination", sa.String(length=254), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("code_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_login_codes_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_login_codes"),
    )
    op.create_index("ix_login_codes_destination", "login_codes", ["destination"])

    op.create_table(
        "onboarding_progress",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("step", sa.SmallInteger(), nullable=False),
        sa.Column("consent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_onboarding_progress_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("user_id", name="pk_onboarding_progress"),
    )

    op.create_table(
        "baseline_answers",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("item_id", sa.String(length=32), nullable=False),
        sa.Column("value", sa.SmallInteger(), nullable=False),
        sa.Column("answered_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_baseline_answers_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_baseline_answers"),
        sa.UniqueConstraint("user_id", "item_id", name="uq_baseline_answers_user_id"),
    )
    op.create_index("ix_baseline_answers_user_id", "baseline_answers", ["user_id"])

    # No ondelete cascade, deliberately: consent history must survive an
    # ordinary cascade. A genuine account deletion purges it explicitly.
    op.create_table(
        "consent_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("kind", sa.String(length=40), nullable=False),
        sa.Column("policy_version", sa.String(length=40), nullable=False),
        sa.Column("at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_consent_events_user_id_users"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_consent_events"),
    )
    op.create_index("ix_consent_events_user_id", "consent_events", ["user_id"])

    op.create_table(
        "crisis_plans",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("who_id_call", sa.Text(), nullable=False),
        sa.Column("what_helps", sa.Text(), nullable=False),
        sa.Column("what_makes_it_worse", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_crisis_plans_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("user_id", name="pk_crisis_plans"),
    )

    op.create_table(
        "trusted_contacts",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("relationship", sa.String(length=120), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_trusted_contacts_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("user_id", name="pk_trusted_contacts"),
    )


def downgrade() -> None:
    op.drop_table("trusted_contacts")
    op.drop_table("crisis_plans")
    op.drop_index("ix_consent_events_user_id", table_name="consent_events")
    op.drop_table("consent_events")
    op.drop_index("ix_baseline_answers_user_id", table_name="baseline_answers")
    op.drop_table("baseline_answers")
    op.drop_table("onboarding_progress")
    op.drop_index("ix_login_codes_destination", table_name="login_codes")
    op.drop_table("login_codes")
    op.drop_index("ix_auth_sessions_refresh_token_hash", table_name="auth_sessions")
    op.drop_index("ix_auth_sessions_user_id", table_name="auth_sessions")
    op.drop_table("auth_sessions")
    op.drop_index("ix_user_profiles_phone", table_name="user_profiles")
    op.drop_index("ix_user_profiles_email", table_name="user_profiles")
    op.drop_table("user_profiles")
    op.drop_table("users")
    op.drop_table("institutions")
