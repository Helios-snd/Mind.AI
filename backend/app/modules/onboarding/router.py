"""Onboarding, crisis plan, trusted contact and account deletion.

Response models use exclude_none so absent fields are omitted rather than sent
as null -- matching mockClient, which simply never sets the key.
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import current_user
from app.core.security import clear_session_cookies, create_access_token, set_session_cookies
from app.db.session import get_session
from app.modules.auth import service as auth_service
from app.modules.onboarding import service
from app.modules.screening import service as screening_service
from app.modules.onboarding.schemas import (
    CrisisPlanSchema,
    OnboardingPatch,
    OnboardingProgressSchema,
    TrustedContactSchema,
)
from app.modules.users.models import User

router = APIRouter(tags=["onboarding"])


@router.get(
    "/onboarding",
    response_model=OnboardingProgressSchema,
    response_model_exclude_none=True,
)
async def get_onboarding(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> OnboardingProgressSchema:
    return await service.build_progress(session, user.id)


@router.patch(
    "/onboarding",
    response_model=OnboardingProgressSchema,
    response_model_exclude_none=True,
)
async def patch_onboarding(
    patch: OnboardingPatch,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> OnboardingProgressSchema:
    return await service.apply_patch(session, user.id, patch)


@router.post(
    "/onboarding/complete",
    response_model=OnboardingProgressSchema,
    response_model_exclude_none=True,
)
async def complete_onboarding(
    response: Response,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> OnboardingProgressSchema:
    progress = await service.complete(session, user.id)
    # The baseline is only meaningful once the flow is finished, so scoring
    # hangs off completion rather than off the baseline PATCH.
    await screening_service.score_baseline(session, user.id)
    # Re-issue the access token so its `onb` claim is true. Without this the
    # middleware would keep redirecting a student who has just finished.
    set_session_cookies(response, create_access_token(user.id, True), None, True)
    return progress


@router.get(
    "/crisis-plan", response_model=CrisisPlanSchema | None, response_model_exclude_none=True
)
async def get_crisis_plan(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> CrisisPlanSchema | None:
    return await service.get_crisis_plan(session, user.id)


@router.put("/crisis-plan", response_model=CrisisPlanSchema)
async def put_crisis_plan(
    plan: CrisisPlanSchema,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> CrisisPlanSchema:
    return await service.save_crisis_plan(session, user.id, plan)


@router.get(
    "/trusted-contact",
    response_model=TrustedContactSchema | None,
    response_model_exclude_none=True,
)
async def get_trusted_contact(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> TrustedContactSchema | None:
    return await service.get_contact(session, user.id)


@router.put("/trusted-contact", response_model=TrustedContactSchema)
async def put_trusted_contact(
    contact: TrustedContactSchema,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> TrustedContactSchema:
    return await service.save_contact(session, user.id, contact)


@router.delete("/me/data", status_code=204)
async def delete_my_data(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    await auth_service.delete_all_data(session, user.id)
    response = Response(status_code=204)
    clear_session_cookies(response)
    return response
