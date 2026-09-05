"""GET /me/summary, /me/inventory and /me/export: plain-language rollups and
a real data export. Never a tier number, never a screening band -- see the
Slice F / F1 and F2 plans."""

import uuid
from datetime import timedelta

from app.db.base import utcnow
from app.modules.checkins.models import CheckIn, Signal
from app.modules.escalations.models import EscalationEvent, StudentBrief
from app.modules.onboarding.models import ConsentEvent
from app.modules.screening.models import ScreeningSession
from app.modules.talk.models import Conversation, Message
from app.modules.talk.safety_models import SafetyAssessment
from app.modules.users import service
from app.modules.users.models import User


async def _make_user(session) -> User:
    user = User()
    session.add(user)
    await session.flush()
    await session.commit()
    return user


async def _make_message(session, user) -> Message:
    conversation = Conversation(user_id=user.id)
    session.add(conversation)
    await session.flush()
    message = Message(
        conversation_id=conversation.id,
        user_id=user.id,
        role="user",
        content="test",
        sequence=1,
    )
    session.add(message)
    await session.flush()
    return message


async def _make_assessment(session, user, *, tier, review_status="not_required", age_days=0):
    message = await _make_message(session, user)
    assessment = SafetyAssessment(
        user_id=user.id,
        conversation_id=message.conversation_id,
        message_id=message.id,
        lexicon_tier=tier,
        classifier_tier=0,
        tier=tier,
        reason_code="test",
        review_status=review_status,
    )
    session.add(assessment)
    await session.flush()
    if age_days:
        assessment.created_at = utcnow() - timedelta(days=age_days)
        await session.flush()
    return assessment


async def _make_screening(session, user, *, instrument):
    record = ScreeningSession(
        user_id=user.id,
        instrument=instrument,
        trigger="self_serve",
        language="en",
        instrument_validated=True,
        completed_at=utcnow(),
        safety_state="not_applicable",
    )
    session.add(record)
    await session.flush()
    return record


async def test_a_fresh_user_gets_zeros_and_an_empty_list(session):
    user = await _make_user(session)
    summary = await service.get_summary(session, user.id)
    assert summary.safety.recent_flag_count == 0
    assert summary.safety.pending_review is False
    assert summary.screenings == []


async def test_a_tier_2_assessment_bumps_the_recent_flag_count(session):
    user = await _make_user(session)
    await _make_assessment(session, user, tier=2)
    summary = await service.get_summary(session, user.id)
    assert summary.safety.recent_flag_count == 1


async def test_a_tier_1_assessment_does_not_count_as_flagged(session):
    """Tier 1 is "ambiguous, may need review" -- too noisy to surface."""
    user = await _make_user(session)
    await _make_assessment(session, user, tier=1)
    summary = await service.get_summary(session, user.id)
    assert summary.safety.recent_flag_count == 0


async def test_an_old_tier_2_assessment_outside_the_window_does_not_count(session):
    user = await _make_user(session)
    await _make_assessment(session, user, tier=2, age_days=45)
    summary = await service.get_summary(session, user.id)
    assert summary.safety.recent_flag_count == 0


async def test_a_pending_review_status_is_reported(session):
    user = await _make_user(session)
    await _make_assessment(session, user, tier=3, review_status="pending")
    summary = await service.get_summary(session, user.id)
    assert summary.safety.pending_review is True


async def test_a_reviewed_assessment_is_not_reported_as_pending(session):
    user = await _make_user(session)
    await _make_assessment(session, user, tier=3, review_status="reviewed")
    summary = await service.get_summary(session, user.id)
    assert summary.safety.pending_review is False


async def test_a_completed_screening_appears_with_no_score_or_band(session):
    user = await _make_user(session)
    await _make_screening(session, user, instrument="phq9")

    summary = await service.get_summary(session, user.id)

    assert len(summary.screenings) == 1
    assert summary.screenings[0].instrument == "phq9"
    assert summary.screenings[0].completed_at

    # Never a score or a band -- confirmed at the actual wire shape, not
    # just by trusting the schema definition.
    dumped = summary.model_dump()
    assert "band" not in dumped["screenings"][0]
    assert "score" not in dumped["screenings"][0]


async def test_screenings_are_scoped_to_the_requesting_user(session):
    owner = await _make_user(session)
    someone_else = await _make_user(session)
    await _make_screening(session, someone_else, instrument="gad7")

    summary = await service.get_summary(session, owner.id)

    assert summary.screenings == []


# --- GET /me/inventory (F2) --------------------------------------------------


async def _make_consent_event(session, user, *, kind="onboarding"):
    record = ConsentEvent(
        user_id=user.id, kind=kind, policy_version="2026-09-01", at=utcnow()
    )
    session.add(record)
    await session.flush()
    return record


async def test_a_fresh_user_has_no_signals_or_consent_events(session):
    user = await _make_user(session)
    inventory = await service.get_data_inventory(session, user.id)
    assert inventory.signals_count == 0
    assert inventory.consent_events == []


async def test_signals_are_counted_not_listed(session):
    user = await _make_user(session)
    session.add(
        Signal(
            user_id=user.id,
            source_type="checkin",
            source_id=uuid.uuid4(),
            source="structured",
            kind="sleep",
            value={"hours": 7},
            observed_at=utcnow(),
        )
    )
    await session.flush()

    inventory = await service.get_data_inventory(session, user.id)
    assert inventory.signals_count == 1


async def test_consent_events_are_listed_oldest_first(session):
    user = await _make_user(session)
    await _make_consent_event(session, user, kind="onboarding")
    await _make_consent_event(session, user, kind="tier3_protocol")

    inventory = await service.get_data_inventory(session, user.id)
    assert [event.kind for event in inventory.consent_events] == [
        "onboarding",
        "tier3_protocol",
    ]


# --- GET /me/export (F2) -----------------------------------------------------


async def _make_check_in(session, user):
    check_in = CheckIn(
        user_id=user.id,
        local_date=utcnow().date(),
        at=utcnow(),
        mood=3,
        sleep_hours=7,
        note="",
        ack_key="today.ack.goodMood",
    )
    session.add(check_in)
    await session.flush()
    return check_in


async def _make_escalation(session, user):
    event = EscalationEvent(user_id=user.id, fired_by="trend", tier=2, status="approved")
    session.add(event)
    await session.flush()
    brief = StudentBrief(
        escalation_event_id=event.id,
        reason_summary_key="escalation.reason.trend_decline_mood",
        share_scope=["checkins", "talk_messages", "reason"],
        window_start=utcnow(),
        window_end=utcnow(),
        approved_by_student_at=utcnow(),
        released_to_counsellor_at=utcnow(),
    )
    session.add(brief)
    await session.flush()
    return event


async def test_an_empty_account_exports_an_honest_empty_shape(session):
    user = await _make_user(session)
    export = await service.get_export(session, user.id)

    assert export.check_ins == []
    assert export.signals == []
    assert export.consent_events == []
    assert export.screenings == []
    assert export.escalation_history == []
    assert export.conversation.message_count == 0
    assert export.safety.recent_flag_count == 0


async def test_a_populated_account_exports_every_category(session):
    user = await _make_user(session)
    await _make_consent_event(session, user)
    await _make_check_in(session, user)
    await _make_screening(session, user, instrument="phq9")
    await _make_assessment(session, user, tier=2)
    await _make_escalation(session, user)
    session.add(
        Signal(
            user_id=user.id,
            source_type="checkin",
            source_id=uuid.uuid4(),
            source="structured",
            kind="sleep",
            value={"hours": 7},
            observed_at=utcnow(),
        )
    )
    await session.flush()

    export = await service.get_export(session, user.id)

    assert len(export.check_ins) == 1
    assert len(export.signals) == 1
    assert len(export.consent_events) == 1
    assert len(export.screenings) == 1
    assert len(export.escalation_history) == 1
    assert export.escalation_history[0].status == "approved"
    # _make_assessment also creates the conversation/message it's attached to.
    assert export.conversation.message_count == 1
    assert export.safety.recent_flag_count == 1


async def test_the_export_never_leaks_a_tier_number_score_or_band(session):
    """The literal check: dump the whole export to JSON and confirm none of
    the words this product has kept out of every screen anywhere appear in
    the safety/screening sections -- not just that the schema doesn't define
    a field for them."""
    user = await _make_user(session)
    await _make_assessment(session, user, tier=3, review_status="pending")
    await _make_screening(session, user, instrument="gad7")

    export = await service.get_export(session, user.id)
    dumped = export.model_dump()

    assert "band" not in dumped["screenings"][0]
    assert "score" not in dumped["screenings"][0]
    assert "tier" not in dumped["safety"]
    assert "reasonCode" not in dumped["safety"]


async def test_the_wire_response_gives_conversation_messages_the_same_shape_everywhere(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    """HTTP-level, not service-level: MessageOut.text/at used to carry
    Field(alias="content"/"created_at") for a different reason (populating
    from the ORM row's own column names), but that same alias also controls
    serialization once a WireModel wrapper -- like MeExportOut -- dumps by
    alias. GET /talk/conversation was already guarded against this with an
    explicit response_model_by_alias=False; GET /me/export composes the same
    MessageOut and had no such guard, so it silently put `content`/
    `created_at` on the wire instead of `text`/`at`. Caught by inspecting a
    real export payload while verifying F2, not by the service-level test
    above -- export.model_dump() without by_alias=True doesn't reproduce
    FastAPI's own response serialization, only a real HTTP round-trip does."""
    from tests.fakes import FakeProvider

    fake = FakeProvider(companion_tokens=["Hi ", "there."])
    monkeypatch.setattr("app.modules.talk.service.OpenAICompatibleProvider", lambda: fake)

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

    await client.post("/api/v1/talk/messages", json={"text": "hello"})

    conversation = (await client.get("/api/v1/talk/conversation")).json()
    export = (await client.get("/api/v1/me/export")).json()

    for source in (conversation["messages"], export["conversation"]["messages"]):
        assert len(source) == 2
        for message in source:
            assert "text" in message and "at" in message
            assert "content" not in message and "created_at" not in message
