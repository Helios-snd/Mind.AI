"""The counsellor console's queue and case detail.

Session-level, mirroring test_users.py's style: these exercise
console/service.py directly against manually-seeded rows, since the
interesting behaviour here (ranking, share_scope-bounded field presence,
the plain-language rule NOT applying) doesn't depend on the HTTP layer --
the router-level cross-boundary tests already live in test_counsellors.py.
"""

from datetime import timedelta

from app.db.base import utcnow
from app.modules.checkins.models import CheckIn
from app.modules.console import service
from app.modules.escalations.models import EscalationEvent, StudentBrief
from app.modules.talk.models import Conversation, Message
from app.modules.talk.safety_models import SafetyAssessment
from app.modules.users.models import User


async def _make_user(session) -> User:
    user = User()
    session.add(user)
    await session.flush()
    return user


async def _make_message(session, user, text="I want to hurt myself tonight") -> Message:
    conversation = Conversation(user_id=user.id)
    session.add(conversation)
    await session.flush()
    message = Message(
        conversation_id=conversation.id,
        user_id=user.id,
        role="user",
        content=text,
        sequence=1,
    )
    session.add(message)
    await session.flush()
    return message


async def _make_safety_case(session, user, *, tier=3, tier3_kind="3a", review_status="pending"):
    message = await _make_message(session, user)
    assessment = SafetyAssessment(
        user_id=user.id,
        conversation_id=message.conversation_id,
        message_id=message.id,
        lexicon_tier=tier,
        classifier_tier=0,
        tier=tier,
        tier3_kind=tier3_kind,
        reason_code="self_harm_explicit",
        confidence=0.9,
        review_status=review_status,
    )
    session.add(assessment)
    await session.flush()
    return assessment


async def _make_check_in(session, user, *, day_offset, mood):
    check_in = CheckIn(
        user_id=user.id,
        local_date=utcnow().date() - timedelta(days=day_offset),
        at=utcnow(),
        mood=mood,
        sleep_hours=7,
        note="",
        ack_key="today.ack.goodMood",
    )
    session.add(check_in)
    await session.flush()
    return check_in


async def _make_decline(session, user, *, previous_mood, current_mood):
    """Enough history spanning both trends/compute.py windows to give
    `change` a real (non-None) value: a few points 30-33 days back (the
    "previous" 28-day window) and a few points 0-3 days back (the current
    one). previous_mood > current_mood makes `change` negative -- a decline,
    proportional to the gap between them."""
    for offset in range(30, 34):
        await _make_check_in(session, user, day_offset=offset, mood=previous_mood)
    for offset in range(0, 4):
        await _make_check_in(session, user, day_offset=offset, mood=current_mood)


async def _make_escalation(
    session, user, *, status="approved", share_scope=None, reason_key="escalation.reason.trend_decline_mood"
):
    event = EscalationEvent(user_id=user.id, fired_by="trend", tier=2, status=status)
    if status != "pending":
        event.resolved_at = utcnow()
    session.add(event)
    await session.flush()
    brief = StudentBrief(
        escalation_event_id=event.id,
        reason_summary_key=reason_key,
        share_scope=share_scope if share_scope is not None else ["checkins", "talk_messages", "reason"],
        window_start=utcnow() - timedelta(hours=1),
        window_end=utcnow() + timedelta(hours=1),
        approved_by_student_at=utcnow() if status == "approved" else None,
        released_to_counsellor_at=utcnow() if status == "approved" else None,
        declined_at=utcnow() if status == "declined" else None,
    )
    session.add(brief)
    await session.flush()
    return event, brief


# --- queue ranking ------------------------------------------------------------


async def test_a_tier3_case_always_outranks_an_approved_escalation(session):
    safety_user = await _make_user(session)
    escalation_user = await _make_user(session)

    await _make_safety_case(session, safety_user)
    await _make_decline(session, escalation_user, previous_mood=5, current_mood=1)
    await _make_escalation(session, escalation_user)
    await session.commit()

    queue = await service.get_queue(session)
    assert [item.case_type for item in queue] == ["safety", "escalation"]


async def test_among_escalations_the_larger_decline_sorts_first(session):
    small_decline_user = await _make_user(session)
    large_decline_user = await _make_user(session)

    await _make_decline(session, small_decline_user, previous_mood=4, current_mood=3)
    small_event, _ = await _make_escalation(session, small_decline_user)

    await _make_decline(session, large_decline_user, previous_mood=5, current_mood=1)
    large_event, _ = await _make_escalation(session, large_decline_user)

    await session.commit()

    queue = await service.get_queue(session)
    ids = [item.case_id for item in queue]
    assert ids.index(large_event.id) < ids.index(small_event.id)
    large_item = next(i for i in queue if i.case_id == large_event.id)
    small_item = next(i for i in queue if i.case_id == small_event.id)
    assert large_item.change < small_item.change < 0


async def test_a_pending_escalation_never_appears_in_the_queue(session):
    user = await _make_user(session)
    await _make_escalation(session, user, status="pending")
    await session.commit()

    queue = await service.get_queue(session)
    assert queue == []


async def test_a_declined_escalation_never_appears_in_the_queue(session):
    user = await _make_user(session)
    await _make_escalation(session, user, status="declined")
    await session.commit()

    queue = await service.get_queue(session)
    assert queue == []


async def test_an_already_reviewed_tier3_case_drops_out_of_the_queue(session):
    user = await _make_user(session)
    await _make_safety_case(session, user, review_status="reviewed")
    await session.commit()

    queue = await service.get_queue(session)
    assert queue == []


async def test_an_already_counsellor_reviewed_escalation_drops_out(session):
    user = await _make_user(session)
    event, _ = await _make_escalation(session, user)
    event.counsellor_reviewed_at = utcnow()
    await session.commit()

    queue = await service.get_queue(session)
    assert queue == []


# --- case detail: the share_scope boundary ------------------------------------


async def test_get_escalation_case_omits_fields_absent_from_share_scope(session):
    user = await _make_user(session)
    await _make_check_in(session, user, day_offset=0, mood=2)
    event, _ = await _make_escalation(session, user, share_scope=["reason"])
    await session.commit()

    case = await service.get_escalation_case(session, event.id)
    assert case.check_ins is None
    assert case.messages is None
    assert case.share_scope == ["reason"]


async def test_get_escalation_case_includes_checkins_when_in_scope(session):
    user = await _make_user(session)
    await _make_check_in(session, user, day_offset=0, mood=2)
    event, _ = await _make_escalation(session, user, share_scope=["checkins"])
    await session.commit()

    case = await service.get_escalation_case(session, event.id)
    assert case.check_ins is not None
    assert len(case.check_ins) == 1
    assert case.messages is None


async def test_get_escalation_case_includes_messages_when_in_scope(session):
    user = await _make_user(session)
    await _make_message(session, user, text="hello")
    event, _ = await _make_escalation(session, user, share_scope=["talk_messages"])
    await session.commit()

    case = await service.get_escalation_case(session, event.id)
    assert case.messages is not None
    assert case.messages[0].text == "hello"
    assert case.check_ins is None


async def test_get_escalation_case_never_leaks_the_crisis_plan_or_contact(session):
    """Never in share_scope, so never in the schema at all -- confirmed by
    literal absence in the dumped shape, same style as F2's export test."""
    user = await _make_user(session)
    event, _ = await _make_escalation(session, user, share_scope=["reason"])
    await session.commit()

    case = await service.get_escalation_case(session, event.id)
    dumped = case.model_dump()
    assert "crisisPlan" not in dumped
    assert "crisis_plan" not in dumped
    assert "trustedContact" not in dumped
    assert "trusted_contact" not in dumped


# --- case detail: the console IS allowed full internal detail ----------------


async def test_get_safety_case_includes_the_real_tier_and_message_text(session):
    user = await _make_user(session)
    assessment = await _make_safety_case(session, user, tier=3, tier3_kind="3b")
    await session.commit()

    case = await service.get_safety_case(session, assessment.id)
    assert case.tier == 3
    assert case.tier3_kind == "3b"
    assert case.message_text == "I want to hurt myself tonight"
    assert case.reason_code == "self_harm_explicit"


async def test_get_safety_case_includes_crisis_plan_and_contact_when_present(session):
    from app.modules.onboarding.models import CrisisPlan, TrustedContact

    user = await _make_user(session)
    session.add(CrisisPlan(user_id=user.id, who_id_call="A friend"))
    session.add(TrustedContact(user_id=user.id, name="Priya", relationship="sister", phone="+911234567890"))
    assessment = await _make_safety_case(session, user)
    await session.commit()

    case = await service.get_safety_case(session, assessment.id)
    assert case.crisis_plan is not None
    assert case.crisis_plan.who_id_call == "A friend"
    assert case.trusted_contact is not None
    assert case.trusted_contact.name == "Priya"


# --- review actions ------------------------------------------------------------


async def _make_counsellor(session, email="reviewer@example.com"):
    from app.modules.counsellors import service as counsellors_service

    return await counsellors_service.create_counsellor(
        session, email, "Dr. Reviewer", "hunter22"
    )


async def test_marking_a_safety_case_reviewed_is_idempotent_and_records_who(session):
    user = await _make_user(session)
    assessment = await _make_safety_case(session, user)
    counsellor = await _make_counsellor(session)
    await session.commit()

    await service.mark_safety_reviewed(session, counsellor.id, assessment.id)
    first_reviewed_at = assessment.reviewed_at
    assert assessment.review_status == "reviewed"
    assert assessment.reviewed_by_counsellor_id == counsellor.id

    await service.mark_safety_reviewed(session, counsellor.id, assessment.id)
    assert assessment.reviewed_at == first_reviewed_at  # unchanged on replay

    queue = await service.get_queue(session)
    assert queue == []


async def test_marking_an_escalation_reviewed_is_idempotent_and_records_who(session):
    user = await _make_user(session)
    event, _ = await _make_escalation(session, user)
    counsellor = await _make_counsellor(session)
    await session.commit()

    await service.mark_escalation_reviewed(session, counsellor.id, event.id)
    first_reviewed_at = event.counsellor_reviewed_at
    assert event.reviewed_by_counsellor_id == counsellor.id

    await service.mark_escalation_reviewed(session, counsellor.id, event.id)
    assert event.counsellor_reviewed_at == first_reviewed_at

    queue = await service.get_queue(session)
    assert queue == []


# --- router-level: the full HTTP flow, not just service calls ----------------


async def _login(client, session):
    await _make_counsellor(session, email="console@example.com")
    await session.commit()
    r = await client.post(
        "/api/v1/console/auth/login",
        json={"email": "console@example.com", "password": "hunter22"},
    )
    assert r.status_code == 200


async def test_queue_and_case_and_review_over_real_http(client, session):
    user = await _make_user(session)
    assessment = await _make_safety_case(session, user, tier=3, tier3_kind="3b")
    await session.commit()

    await _login(client, session)

    queue = (await client.get("/api/v1/console/queue")).json()
    assert len(queue) == 1
    assert queue[0]["caseType"] == "safety"
    assert queue[0]["caseId"] == str(assessment.id)

    case = (
        await client.get(f"/api/v1/console/cases/safety/{assessment.id}")
    ).json()
    assert case["tier"] == 3
    assert case["tier3Kind"] == "3b"
    assert case["messageText"] == "I want to hurt myself tonight"

    review = await client.post(
        f"/api/v1/console/cases/safety/{assessment.id}/review"
    )
    assert review.status_code == 204

    queue_after = (await client.get("/api/v1/console/queue")).json()
    assert queue_after == []


async def test_an_escalation_case_over_real_http_respects_share_scope(client, session):
    user = await _make_user(session)
    await _make_check_in(session, user, day_offset=0, mood=2)
    event, _ = await _make_escalation(session, user, share_scope=["checkins"])
    await session.commit()

    await _login(client, session)

    case = (
        await client.get(f"/api/v1/console/cases/escalation/{event.id}")
    ).json()
    assert case["checkIns"] is not None
    assert case["messages"] is None
    assert "crisisPlan" not in case
    assert "trustedContact" not in case
