"""Wire shapes for counsellor auth. Small on purpose -- there is no
onboarding-equivalent state to report, unlike the student SessionOut."""

from app.modules.onboarding.schemas import WireModel


class CounsellorLoginIn(WireModel):
    email: str
    password: str


class CounsellorOut(WireModel):
    id: str
    email: str
    name: str
