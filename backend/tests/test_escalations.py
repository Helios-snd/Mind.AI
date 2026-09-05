"""Escalations: the Trend-driven tier-2 offer, independent of Safety's
per-message tiers, approval gate, and the decline cooldown."""

from datetime import timedelta

from sqlalchemy import func, select

from app.db.base import utcnow
from app.modules.escalations.models import EscalationEvent, StudentBrief


async def _onboard(client, payload, language="en"):
    await client.post("/api/v1/auth/anonymous")
    await client.patch("/api/v1/onboarding", json={"step": 2, "language": language})
    await client.patch(
        "/api/v1/onboarding", json={"step": 3, "baseline": payload["baseline"]}
    )
    await client.patch(
        "/api/v1/onboarding",
        json={"step": 4, "consentAt": "2026-09-04T10:00:00+00:00"},
    )
    await client.patch(
        "/api/v1/onboarding",
        json={
            "step": 5,
            "crisisPlan": payload["crisisPlan"],
            "contact": payload["contact"],
        },
    )
    await client.post("/api/v1/onboarding/complete")


async def _check_in(client, day, **values):
    body = {"date": day, "mood": 3, "sleepHours": 7, "note": "", **values}
    return await client.post("/api/v1/checkins", json=body)


async def _seed_baseline_and_decline(client, today):
    """7 good-mood days old enough to form a baseline, then one low-mood day
    that reads as below it -- the shared setup most of these tests need."""
    for offset in range(16, 9, -1):
        await _check_in(client, str(today - timedelta(days=offset)), mood=4)
    return await _check_in(client, str(today), mood=1)


async def test_a_below_baseline_check_in_creates_a_pending_escalation(
    client, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()

    resp = await _seed_baseline_and_decline(client, today)
    assert resp.status_code == 200

    body = (await client.get("/api/v1/escalations/pending")).json()
    assert body is not None
    assert body["reasonSummaryKey"] == "escalation.reason.trend_decline_mood"
    assert set(body["shareScope"]) == {"checkins", "talk_messages", "reason"}


async def test_steady_check_ins_create_no_escalation(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()

    for offset in range(9, -1, -1):
        await _check_in(client, str(today - timedelta(days=offset)), mood=4)

    body = (await client.get("/api/v1/escalations/pending")).json()
    assert body is None


async def test_a_second_qualifying_check_in_does_not_duplicate_the_escalation(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()

    await _seed_baseline_and_decline(client, today)
    first = (await client.get("/api/v1/escalations/pending")).json()

    # Another low day -- still below baseline, must not create a second row.
    await _check_in(client, str(today + timedelta(days=1)), mood=1)
    second = (await client.get("/api/v1/escalations/pending")).json()

    assert first["id"] == second["id"]
    count = await session.scalar(select(func.count()).select_from(EscalationEvent))
    assert count == 1


async def test_approving_releases_the_brief(client, session, onboarding_payload):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()
    await _seed_baseline_and_decline(client, today)

    pending = (await client.get("/api/v1/escalations/pending")).json()
    resp = await client.post(f"/api/v1/escalations/{pending['id']}/approve")
    assert resp.status_code == 204

    assert (await client.get("/api/v1/escalations/pending")).json() is None

    event = await session.get(EscalationEvent, pending["id"])
    assert event.status == "approved"
    assert event.resolved_at is not None

    brief = await session.scalar(
        select(StudentBrief).where(StudentBrief.escalation_event_id == event.id)
    )
    assert brief.approved_by_student_at is not None
    assert brief.released_to_counsellor_at is not None


async def test_declining_sets_a_reoffer_window_and_is_not_released(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()
    await _seed_baseline_and_decline(client, today)

    pending = (await client.get("/api/v1/escalations/pending")).json()
    resp = await client.post(f"/api/v1/escalations/{pending['id']}/decline")
    assert resp.status_code == 204

    assert (await client.get("/api/v1/escalations/pending")).json() is None

    event = await session.get(EscalationEvent, pending["id"])
    assert event.status == "declined"
    assert event.re_offer_after > utcnow()

    brief = await session.scalar(
        select(StudentBrief).where(StudentBrief.escalation_event_id == event.id)
    )
    assert brief.declined_at is not None
    assert brief.released_to_counsellor_at is None


async def test_a_declined_escalation_is_not_recreated_before_its_reoffer_window(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()
    await _seed_baseline_and_decline(client, today)

    pending = (await client.get("/api/v1/escalations/pending")).json()
    await client.post(f"/api/v1/escalations/{pending['id']}/decline")

    # Still below baseline -- must not be re-offered immediately.
    await _check_in(client, str(today + timedelta(days=1)), mood=1)
    assert (await client.get("/api/v1/escalations/pending")).json() is None

    count = await session.scalar(select(func.count()).select_from(EscalationEvent))
    assert count == 1


async def test_escalations_are_scoped_to_their_own_account(
    client, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()
    await _seed_baseline_and_decline(client, today)
    pending = (await client.get("/api/v1/escalations/pending")).json()

    client.cookies.clear()
    await _onboard(client, onboarding_payload, language="bn")

    assert (await client.get("/api/v1/escalations/pending")).json() is None
    resp = await client.post(f"/api/v1/escalations/{pending['id']}/approve")
    assert resp.status_code == 404


# --- /escalations/history (F2) -----------------------------------------------


async def test_history_excludes_a_still_pending_escalation(
    client, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()
    await _seed_baseline_and_decline(client, today)

    history = (await client.get("/api/v1/escalations/history")).json()
    assert history == []


async def test_an_approved_escalation_appears_in_history(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()
    await _seed_baseline_and_decline(client, today)
    pending = (await client.get("/api/v1/escalations/pending")).json()
    await client.post(f"/api/v1/escalations/{pending['id']}/approve")

    history = (await client.get("/api/v1/escalations/history")).json()
    assert len(history) == 1
    assert history[0]["status"] == "approved"
    assert history[0]["reasonSummaryKey"] == "escalation.reason.trend_decline_mood"
    assert history[0]["resolvedAt"] is not None
    # Never the internal tier int or fired_by source -- /data's history is
    # status + reason + dates, nothing else.
    assert "tier" not in history[0]
    assert "firedBy" not in history[0]


async def test_a_declined_escalation_appears_in_history_too(
    client, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()
    await _seed_baseline_and_decline(client, today)
    pending = (await client.get("/api/v1/escalations/pending")).json()
    await client.post(f"/api/v1/escalations/{pending['id']}/decline")

    history = (await client.get("/api/v1/escalations/history")).json()
    assert len(history) == 1
    assert history[0]["status"] == "declined"


async def test_history_is_scoped_to_the_requesting_user(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    today = utcnow().date()
    await _seed_baseline_and_decline(client, today)
    pending = (await client.get("/api/v1/escalations/pending")).json()
    await client.post(f"/api/v1/escalations/{pending['id']}/approve")

    client.cookies.clear()
    await _onboard(client, onboarding_payload, language="bn")

    assert (await client.get("/api/v1/escalations/history")).json() == []


# --- /escalations/request (F3) -----------------------------------------------


async def test_requesting_support_creates_a_manual_pending_escalation(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)

    resp = await client.post("/api/v1/escalations/request")
    assert resp.status_code == 204

    body = (await client.get("/api/v1/escalations/pending")).json()
    assert body is not None
    assert body["reasonSummaryKey"] == "escalation.reason.manual_request"
    assert set(body["shareScope"]) == {"talk_messages", "checkins", "request"}

    event = await session.get(EscalationEvent, body["id"])
    assert event.fired_by == "manual"
    assert event.tier == 0
    # Never exposed to the client -- confirmed directly against the row.
    assert "firedBy" not in body
    assert "tier" not in body


async def test_requesting_support_twice_does_not_duplicate(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)

    await client.post("/api/v1/escalations/request")
    await client.post("/api/v1/escalations/request")

    count = await session.scalar(select(func.count()).select_from(EscalationEvent))
    assert count == 1


async def test_requesting_support_ignores_a_still_cooling_down_decline(
    client, session, onboarding_payload
):
    """The one behaviour F3 adds to create_if_needed: an explicit ask must
    never be silently blocked by an earlier decline's re_offer_after, unlike
    a fresh Trend-fired offer would be."""
    await _onboard(client, onboarding_payload)
    today = utcnow().date()
    await _seed_baseline_and_decline(client, today)
    pending = (await client.get("/api/v1/escalations/pending")).json()
    await client.post(f"/api/v1/escalations/{pending['id']}/decline")

    # Confirms the cooldown is actually in effect for the Trend path first --
    # otherwise this test would pass for the wrong reason.
    await _check_in(client, str(today + timedelta(days=1)), mood=1)
    assert (await client.get("/api/v1/escalations/pending")).json() is None

    resp = await client.post("/api/v1/escalations/request")
    assert resp.status_code == 204

    body = (await client.get("/api/v1/escalations/pending")).json()
    assert body is not None
    assert body["reasonSummaryKey"] == "escalation.reason.manual_request"

    count = await session.scalar(select(func.count()).select_from(EscalationEvent))
    assert count == 2


async def test_approving_a_manual_request_releases_it_like_any_other(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    await client.post("/api/v1/escalations/request")
    pending = (await client.get("/api/v1/escalations/pending")).json()

    resp = await client.post(f"/api/v1/escalations/{pending['id']}/approve")
    assert resp.status_code == 204

    event = await session.get(EscalationEvent, pending["id"])
    assert event.status == "approved"
    brief = await session.scalar(
        select(StudentBrief).where(StudentBrief.escalation_event_id == event.id)
    )
    assert brief.approved_by_student_at is not None
    assert brief.released_to_counsellor_at is not None

    history = (await client.get("/api/v1/escalations/history")).json()
    assert len(history) == 1
    assert history[0]["status"] == "approved"
    assert history[0]["reasonSummaryKey"] == "escalation.reason.manual_request"
