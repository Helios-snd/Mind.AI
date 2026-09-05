from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.checkins.router import router as checkins_router
from app.modules.escalations.router import router as escalations_router
from app.modules.onboarding.router import router as onboarding_router
from app.modules.screening.router import router as screening_router
from app.modules.talk.router import router as talk_router
from app.modules.trends.router import router as trends_router
from app.modules.users.router import router as users_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(onboarding_router)
api_router.include_router(screening_router)
api_router.include_router(checkins_router)
api_router.include_router(trends_router)
api_router.include_router(talk_router)
api_router.include_router(escalations_router)
