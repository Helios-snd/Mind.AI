"""Account deletion must actually delete, across every table."""

from datetime import timedelta

from sqlalchemy import func, select

from app.db.base import utcnow
from app.modules.auth.models import AuthSession, LoginCode
from app.modules.checkins.models import CheckIn, Signal
from app.modules.escalations.models import EscalationEvent, StudentBrief
from app.modules.onboarding.models import (
    BaselineAnswer,
    ConsentEvent,
    CrisisPlan,
    OnboardingProgress,
    TrustedContact,
)
from app.modules.screening.models import ScreeningAnswer, ScreeningScore, ScreeningSession
from app.modules.talk.models import Conversation, Message
from app.modules.talk.safety_models import SafetyAssessment
from app.modules.users.models import User, UserProfile

# F2 finding: this list originally covered only the pre-Talk tables (through
# TrustedContact below) -- it never included CheckIn/Signal either, despite
# delete_all_data() already deleting both explicitly. A separate test lower
# in this file (test_delete_also_removes_conversations_messages_and_safety_
# assessments) already exercised Conversation/Message/SafetyAssessment on
# its own, relying on their ON DELETE CASCADE FKs alone -- so those three
# were genuinely covered, just not through this list. Screening and
# Escalations were not covered anywhere. This is now the definitive list;
# see test_delete_removes_screenings_checkins_signals_and_escalations below
# for the setup that actually exercises the second half of it.
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
    CheckIn,
    Signal,
    Conversation,
    Message,
    SafetyAssessment,
    ScreeningSession,
    ScreeningAnswer,
    ScreeningScore,
    EscalationEvent,
    StudentBrief,
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
    """Talk content is the most sensitive data this product holds. It's now
    also in delete_all_data's explicit per-table loop (F2), but this test
    predates that and is kept as-is -- it settles empirically whether the
    ON DELETE CASCADE foreign keys cover it on their own, which they do;
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


async def test_delete_removes_screenings_checkins_signals_and_escalations(
    client, session, onboarding_payload
):
    """The other half of the F2 finding: unlike Talk/Safety above, nothing
    had ever exercised Screening or Escalations deletion at all, in either
    direction. None of the three calls below touch an LLM, so no provider
    patch is needed."""
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

    # A steady baseline, then one low day -- below-baseline creates an
    # EscalationEvent + StudentBrief (E1); every check-in also produces at
    # least one Signal (sleepHours alone is enough).
    today = utcnow().date()
    for offset in range(16, 9, -1):
        await client.post(
            "/api/v1/checkins",
            json={"date": str(today - timedelta(days=offset)), "mood": 4, "sleepHours": 7, "note": ""},
        )
    await client.post(
        "/api/v1/checkins",
        json={"date": str(today), "mood": 1, "sleepHours": 7, "note": ""},
    )

    await client.post(
        "/api/v1/screenings/complete",
        json={
            "instrument": "phq9",
            "language": "en",
            "answers": [{"itemId": f"phq9-{i}", "value": 0} for i in range(1, 10)],
        },
    )

    assert await session.scalar(select(func.count()).select_from(CheckIn)) == 8
    assert await session.scalar(select(func.count()).select_from(Signal)) > 0
    # 2, not 1: onboarding's own DASS-21 baseline is itself a ScreeningSession
    # row (trigger="onboarding", answers held in baseline_answers instead --
    # see BaselineAnswer above, though DASS-21 does score per-subscale rows
    # here), alongside the PHQ-9 just completed. Exact counts for the DASS-21
    # side aren't the point of this test -- only that deletion clears
    # everything below, whatever the count turns out to be.
    assert await session.scalar(select(func.count()).select_from(ScreeningSession)) == 2
    assert await session.scalar(select(func.count()).select_from(ScreeningAnswer)) == 9
    assert await session.scalar(select(func.count()).select_from(ScreeningScore)) >= 1
    assert await session.scalar(select(func.count()).select_from(EscalationEvent)) == 1
    assert await session.scalar(select(func.count()).select_from(StudentBrief)) == 1

    r = await client.delete("/api/v1/me/data")
    assert r.status_code == 204

    for model in ALL_MODELS:
        remaining = await session.scalar(select(func.count()).select_from(model))
        assert remaining == 0, f"{model.__tablename__} still has {remaining} row(s)"


async def test_deleting_an_already_deleted_account_is_not_a_server_error(client):
    """Idempotence, for a client that retries a DELETE it isn't sure landed:
    the session cookie's own user is gone, so this is an auth failure, never
    a 500 from deleting rows that no longer exist."""
    await client.post("/api/v1/auth/anonymous")

    first = await client.delete("/api/v1/me/data")
    assert first.status_code == 204

    second = await client.delete("/api/v1/me/data")
    assert second.status_code == 401
