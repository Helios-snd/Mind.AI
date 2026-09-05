"""Imports every model so Base.metadata is complete for Alembic autogenerate.

Alembic's env.py imports this module and nothing else. A model that is not
reachable from here will be silently missing from generated migrations.
"""

from app.db.base import Base  # noqa: F401
from app.modules.auth.models import AuthSession, LoginCode  # noqa: F401
from app.modules.checkins.models import CheckIn, Signal  # noqa: F401
from app.modules.escalations.models import EscalationEvent, StudentBrief  # noqa: F401
from app.modules.talk.models import Conversation, Message  # noqa: F401
from app.modules.talk.safety_models import SafetyAssessment  # noqa: F401
from app.modules.onboarding.models import (  # noqa: F401
    BaselineAnswer,
    ConsentEvent,
    CrisisPlan,
    OnboardingProgress,
    TrustedContact,
)
from app.modules.screening.models import (  # noqa: F401
    ScreeningAnswer,
    ScreeningScore,
    ScreeningSession,
)
from app.modules.users.models import Institution, User, UserProfile  # noqa: F401
from app.modules.counsellors.models import Counsellor, CounsellorSession  # noqa: F401

__all__ = ["Base"]
