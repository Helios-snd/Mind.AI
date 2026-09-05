"""Onboarding read/write logic.

The response shape is assembled from five tables into the single
OnboardingProgress object the frontend already expects, so no component has to
learn a new shape.
"""

import re
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import ValidationFailed
from app.db.base import utcnow
from app.modules.onboarding.models import (
    BaselineAnswer,
    ConsentEvent,
    CrisisPlan,
    OnboardingProgress,
    TrustedContact,
)
from app.modules.onboarding.schemas import (
    BaselineAnswerSchema,
    CrisisPlanSchema,
    OnboardingPatch,
    OnboardingProgressSchema,
    TrustedContactSchema,
)
from app.modules.users.models import UserProfile


def _item_sort_key(item_id: str) -> tuple[str, int, str]:
    """Natural order for instrument item ids like "dass-3" / "dass-10".

    Falls back to plain string order for anything that does not match, so a
    future instrument with differently shaped ids still sorts deterministically.
    """
    match = re.fullmatch(r"([a-z]+)-(\d+)", item_id)
    if match:
        return (match.group(1), int(match.group(2)), "")
    return (item_id, 0, item_id)


async def _get_or_create_progress(
    session: AsyncSession, user_id: UUID
) -> OnboardingProgress:
    row = await session.get(OnboardingProgress, user_id)
    if row is None:
        row = OnboardingProgress(user_id=user_id, step=1)
        session.add(row)
        await session.flush()
    return row


async def build_progress(
    session: AsyncSession, user_id: UUID
) -> OnboardingProgressSchema:
    progress = await _get_or_create_progress(session, user_id)
    profile = await session.get(UserProfile, user_id)

    answers = (
        await session.scalars(
            select(BaselineAnswer).where(BaselineAnswer.user_id == user_id)
        )
    ).all()
    # Instrument order, not lexicographic: ORDER BY item_id puts "dass-10"
    # before "dass-3". Sorted here rather than in SQL because the set is at
    # most 21 rows and the numeric suffix is not a column.
    answers = sorted(answers, key=lambda a: _item_sort_key(a.item_id))

    plan = await session.get(CrisisPlan, user_id)
    contact = await session.get(TrustedContact, user_id)

    return OnboardingProgressSchema(
        step=progress.step,
        language=profile.language if profile else None,
        baseline=(
            [
                BaselineAnswerSchema(item_id=a.item_id, value=a.value)
                for a in answers
            ]
            or None
        ),
        consent_at=progress.consent_at,
        crisis_plan=CrisisPlanSchema.model_validate(plan) if plan else None,
        contact=TrustedContactSchema.model_validate(contact) if contact else None,
        completed_at=progress.completed_at,
    )


async def apply_patch(
    session: AsyncSession, user_id: UUID, patch: OnboardingPatch
) -> OnboardingProgressSchema:
    progress = await _get_or_create_progress(session, user_id)
    now = utcnow()

    if patch.step is not None:
        progress.step = patch.step

    if patch.language is not None:
        profile = await session.get(UserProfile, user_id)
        if profile is None:
            profile = UserProfile(user_id=user_id, language=patch.language)
            session.add(profile)
        else:
            profile.language = patch.language
            profile.updated_at = now

    if patch.baseline is not None:
        await _replace_baseline(session, user_id, patch.baseline, now)

    if patch.consent_at is not None and progress.consent_at is None:
        # Consent is recorded once. A re-send does not re-stamp it, and the
        # append-only audit row is written exactly once per consent.
        progress.consent_at = patch.consent_at
        session.add(
            ConsentEvent(
                user_id=user_id,
                kind="onboarding",
                policy_version=settings.policy_version,
                at=patch.consent_at,
            )
        )

    if patch.crisis_plan is not None:
        await _merge_crisis_plan(session, user_id, patch.crisis_plan, now)

    if patch.contact is not None:
        await _merge_contact(session, user_id, patch.contact, now)

    progress.updated_at = now
    await session.flush()
    return await build_progress(session, user_id)


async def _replace_baseline(
    session: AsyncSession,
    user_id: UUID,
    answers: list[BaselineAnswerSchema],
    now: datetime,
) -> None:
    """The UI always sends the full answer set it holds, so a replace keeps the
    table in step with the client without needing per-item diffing."""
    await session.execute(
        delete(BaselineAnswer).where(BaselineAnswer.user_id == user_id)
    )
    for answer in answers:
        session.add(
            BaselineAnswer(
                user_id=user_id,
                item_id=answer.item_id,
                value=answer.value,
                answered_at=now,
            )
        )


async def _merge_crisis_plan(
    session: AsyncSession, user_id: UUID, incoming: CrisisPlanSchema, now: datetime
) -> None:
    """Merge on *presence*, not on truthiness.

    model_fields_set holds exactly the keys the client sent, which is the only
    way to tell "omitted, leave alone" from "sent as empty, clear it". The
    crisis-plan form allows blank answers, so treating "" as absent would make
    a field impossible to erase. The UI sends all three fields, so this behaves
    like mockClient's replace today, while a future partial write no longer
    blanks the rest.
    """
    row = await session.get(CrisisPlan, user_id)
    if row is None:
        row = CrisisPlan(user_id=user_id)
        session.add(row)
    for field in ("who_id_call", "what_helps", "what_makes_it_worse"):
        if field in incoming.model_fields_set:
            setattr(row, field, getattr(incoming, field))
    row.updated_at = now


async def _merge_contact(
    session: AsyncSession, user_id: UUID, incoming: TrustedContactSchema, now: datetime
) -> None:
    row = await session.get(TrustedContact, user_id)
    if row is None:
        row = TrustedContact(user_id=user_id)
        session.add(row)
    for field in ("name", "relationship", "phone"):
        if field in incoming.model_fields_set:
            setattr(row, field, getattr(incoming, field))
    row.updated_at = now


async def complete(session: AsyncSession, user_id: UUID) -> OnboardingProgressSchema:
    """Stamps completed_at, but only once the required steps are genuinely
    filled. mockClient did not validate this, so a client bug could mark an
    empty account complete."""
    progress = await _get_or_create_progress(session, user_id)

    if progress.completed_at is not None:
        return await build_progress(session, user_id)

    profile = await session.get(UserProfile, user_id)
    if profile is None or not profile.language:
        raise ValidationFailed("Language has not been chosen")
    if progress.consent_at is None:
        raise ValidationFailed("Consent has not been recorded")

    plan = await session.get(CrisisPlan, user_id)
    contact = await session.get(TrustedContact, user_id)
    if plan is None or not plan.who_id_call.strip():
        raise ValidationFailed("The crisis plan is incomplete")
    if contact is None or not contact.name.strip() or not contact.phone.strip():
        raise ValidationFailed("The trusted contact is incomplete")

    progress.completed_at = utcnow()
    # Step 5 is the claim screen; completion lands the student there.
    progress.step = max(progress.step, 5)
    await session.flush()
    return await build_progress(session, user_id)


async def get_crisis_plan(
    session: AsyncSession, user_id: UUID
) -> CrisisPlanSchema | None:
    row = await session.get(CrisisPlan, user_id)
    return CrisisPlanSchema.model_validate(row) if row else None


async def save_crisis_plan(
    session: AsyncSession, user_id: UUID, plan: CrisisPlanSchema
) -> CrisisPlanSchema:
    await _merge_crisis_plan(session, user_id, plan, utcnow())
    await session.flush()
    row = await session.get(CrisisPlan, user_id)
    return CrisisPlanSchema.model_validate(row)


async def get_contact(
    session: AsyncSession, user_id: UUID
) -> TrustedContactSchema | None:
    row = await session.get(TrustedContact, user_id)
    return TrustedContactSchema.model_validate(row) if row else None


async def save_contact(
    session: AsyncSession, user_id: UUID, contact: TrustedContactSchema
) -> TrustedContactSchema:
    await _merge_contact(session, user_id, contact, utcnow())
    await session.flush()
    row = await session.get(TrustedContact, user_id)
    return TrustedContactSchema.model_validate(row)
