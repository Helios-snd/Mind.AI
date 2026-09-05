"""Account deletion must actually delete, across every table."""

from sqlalchemy import func, select

from app.modules.auth.models import AuthSession, LoginCode
from app.modules.onboarding.models import (
    BaselineAnswer,
    ConsentEvent,
    CrisisPlan,
    OnboardingProgress,
    TrustedContact,
)
from app.modules.users.models import User, UserProfile

ALL_MODELS = [
    User,
    UserProfile,
    AuthSession,
    LoginCode,
    OnboardingProgress,
    BaselineAnswer,
    ConsentEvent,
    CrisisPlan,
    TrustedContact,
]


async def test_delete_removes_every_row_and_clears_the_session(
    client, session, onboarding_payload
):
    await client.post("/api/v1/auth/anonymous")
    await client.patch("/api/v1/onboarding", json={"step": 2, "language": "bn"})
    await client.patch(
        "/api/v1/onboarding", json={"step": 3, "baseline": onboarding_payload["baseline"]}
    )
    await client.patch(
        "/api/v1/onboarding",
        json={"step": 4, "consentAt": "2026-09-04T10:00:00+00:00"},
    )
    await client.patch(
        "/api/v1/onboarding",
        json={
            "step": 5,
            "crisisPlan": onboarding_payload["crisisPlan"],
            "contact": onboarding_payload["contact"],
        },
    )
    await client.post("/api/v1/onboarding/complete")

    # Everything is in place before we delete.
    assert await session.scalar(select(func.count()).select_from(User)) == 1
    assert await session.scalar(select(func.count()).select_from(CrisisPlan)) == 1
    assert await session.scalar(select(func.count()).select_from(ConsentEvent)) == 1

    r = await client.delete("/api/v1/me/data")
    assert r.status_code == 204

    for model in ALL_MODELS:
        remaining = await session.scalar(select(func.count()).select_from(model))
        assert remaining == 0, f"{model.__tablename__} still has {remaining} row(s)"

    # The cookie is gone, so the next request is genuinely unauthenticated --
    # unlike wipeEverything(), which re-wrote the key it had just deleted.
    after = await client.get("/api/v1/onboarding")
    assert after.status_code == 401


async def test_a_token_naming_a_deleted_account_is_rejected(client):
    await client.post("/api/v1/auth/anonymous")
    access = client.cookies.get("mind_session")

    await client.delete("/api/v1/me/data")

    # Replay the still-unexpired access token from before the deletion.
    client.cookies.set("mind_session", access)
    r = await client.get("/api/v1/onboarding")
    assert r.status_code == 401


async def test_delete_also_removes_conversations_messages_and_safety_assessments(
    client, session, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    """Talk content is the most sensitive data this product holds. It is not
    in delete_all_data's explicit per-table loop, so this test settles
    empirically whether the ON DELETE CASCADE foreign keys actually cover it --
    reasoning about DDL is not the same as watching it happen."""
    from tests.fakes import FakeProvider

    monkeypatch.setattr(
        "app.modules.talk.service.OpenAICompatibleProvider",
        lambda: FakeProvider(companion_tokens=["hi"]),
    )

    await client.post("/api/v1/auth/anonymous")
    await client.patch("/api/v1/onboarding", json={"step": 2, "language": "en"})
    await client.patch(
        "/api/v1/onboarding", json={"step": 3, "baseline": onboarding_payload["baseline"]}
    )
    await client.patch(
        "/api/v1/onboarding", json={"step": 4, "consentAt": "2026-09-04T10:00:00+00:00"}
    )
    await client.patch(
        "/api/v1/onboarding",
        json={
            "step": 5,
            "crisisPlan": onboarding_payload["crisisPlan"],
            "contact": onboarding_payload["contact"],
        },
    )
    await client.post("/api/v1/onboarding/complete")

    await client.post("/api/v1/talk/messages", json={"text": "I want to kill myself"})

    from app.modules.talk.models import Conversation, Message
    from app.modules.talk.safety_models import SafetyAssessment

    assert await session.scalar(select(func.count()).select_from(Conversation)) == 1
    assert await session.scalar(select(func.count()).select_from(Message)) == 2
    assert await session.scalar(select(func.count()).select_from(SafetyAssessment)) == 1

    r = await client.delete("/api/v1/me/data")
    assert r.status_code == 204

    for model in (Conversation, Message, SafetyAssessment):
        remaining = await session.scalar(select(func.count()).select_from(model))
        assert remaining == 0, f"{model.__tablename__} still has {remaining} row(s)"
