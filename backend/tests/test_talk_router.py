"""HTTP-level Talk: auth, the SSE contract, and conversation lifecycle.

The router constructs its own OpenAICompatibleProvider (never accepts an
injected one -- that seam exists for service-level tests only), so these
tests patch the constructor at its import site in the service module.
"""

import json

import pytest

from tests.fakes import FakeProvider


async def _onboard(client, payload):
    await client.post("/api/v1/auth/anonymous")
    await client.patch("/api/v1/onboarding", json={"step": 2, "language": "en"})
    await client.patch(
        "/api/v1/onboarding", json={"step": 3, "baseline": payload["baseline"]}
    )
    await client.patch(
        "/api/v1/onboarding", json={"step": 4, "consentAt": "2026-09-04T10:00:00+00:00"}
    )
    await client.patch(
        "/api/v1/onboarding",
        json={"step": 5, "crisisPlan": payload["crisisPlan"], "contact": payload["contact"]},
    )
    await client.post("/api/v1/onboarding/complete")


def _patch_provider(monkeypatch, **kwargs):
    fake = FakeProvider(**kwargs)
    monkeypatch.setattr(
        "app.modules.talk.service.OpenAICompatibleProvider", lambda: fake
    )
    return fake


def _parse_sse(text: str) -> list[dict]:
    events = []
    event_name = None
    for line in text.split("\n"):
        if line.startswith("event: "):
            event_name = line[len("event: ") :]
        elif line.startswith("data: "):
            events.append({"event": event_name, "data": json.loads(line[len("data: ") :])})
    return events


async def test_get_conversation_with_no_history_returns_an_empty_shell(
    client, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    r = await client.get("/api/v1/talk/conversation")
    assert r.status_code == 200
    assert r.json()["id"] is None
    assert r.json()["messages"] == []


async def test_talk_requires_onboarding_not_just_a_session(client):
    """Talk is health data -- gated the same way checkins and trends are."""
    await client.post("/api/v1/auth/anonymous")
    r = await client.get("/api/v1/talk/conversation")
    assert r.status_code == 403


async def test_sending_a_message_streams_sse_and_persists(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    await _onboard(client, onboarding_payload)
    _patch_provider(monkeypatch, companion_tokens=["Hi ", "there."])

    r = await client.post("/api/v1/talk/messages", json={"text": "hello"})
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/event-stream")

    events = _parse_sse(r.text)
    assert events[0]["event"] == "meta"
    assert events[-1]["event"] == "done"
    assert "".join(e["data"]["text"] for e in events if e["event"] == "token") == "Hi there."


async def test_the_conversation_persists_across_a_fresh_get(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    await _onboard(client, onboarding_payload)
    _patch_provider(monkeypatch, companion_tokens=["Okay."])

    await client.post("/api/v1/talk/messages", json={"text": "hello"})

    r = await client.get("/api/v1/talk/conversation")
    body = r.json()
    assert body["id"] is not None
    assert [m["text"] for m in body["messages"]] == ["hello", "Okay."]
    assert [m["role"] for m in body["messages"]] == ["user", "assistant"]


async def test_an_empty_message_is_rejected_with_422(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    r = await client.post("/api/v1/talk/messages", json={"text": "   "})
    assert r.status_code == 422


async def test_a_conversation_id_belonging_to_someone_else_is_refused(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    await _onboard(client, onboarding_payload)
    _patch_provider(monkeypatch, companion_tokens=["hi"])
    await client.post("/api/v1/talk/messages", json={"text": "mine"})
    mine = (await client.get("/api/v1/talk/conversation")).json()["id"]

    client.cookies.clear()
    await _onboard(client, onboarding_payload)
    r = await client.post(
        "/api/v1/talk/messages", json={"text": "not mine", "conversation_id": mine}
    )
    assert r.status_code == 404


async def test_delete_conversation_removes_it(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    await _onboard(client, onboarding_payload)
    _patch_provider(monkeypatch, companion_tokens=["hi"])
    await client.post("/api/v1/talk/messages", json={"text": "hello"})

    r = await client.delete("/api/v1/talk/conversation")
    assert r.status_code == 204

    after = await client.get("/api/v1/talk/conversation")
    assert after.json()["id"] is None
    assert after.json()["messages"] == []


async def test_deleting_with_no_conversation_is_not_an_error(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    r = await client.delete("/api/v1/talk/conversation")
    assert r.status_code == 204


async def test_conversations_are_isolated_between_students(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    await _onboard(client, onboarding_payload)
    _patch_provider(monkeypatch, companion_tokens=["hi"])
    await client.post("/api/v1/talk/messages", json={"text": "student one's secret"})

    client.cookies.clear()
    await _onboard(client, onboarding_payload)
    r = await client.get("/api/v1/talk/conversation")
    assert r.json()["id"] is None
    assert r.json()["messages"] == []


async def test_a_crisis_message_is_visible_in_the_conversation_history(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    """Even suppressed, the exchange is real history -- the student's message
    and the crisis response both persist and read back."""
    await _onboard(client, onboarding_payload)
    _patch_provider(monkeypatch, companion_tokens=["never shown"])

    await client.post("/api/v1/talk/messages", json={"text": "I want to kill myself"})

    body = (await client.get("/api/v1/talk/conversation")).json()
    assert body["messages"][0]["text"] == "I want to kill myself"
    assert "never shown" not in body["messages"][1]["text"]


# --- the tier-3b countdown endpoints (E3) ------------------------------------


async def test_a_3b_message_reports_an_assessment_id_for_the_countdown(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    await _onboard(client, onboarding_payload)
    _patch_provider(monkeypatch)

    r = await client.post(
        "/api/v1/talk/messages",
        json={"text": "I want to kill myself, I have the pills"},
    )
    events = _parse_sse(r.text)
    assert events[0]["data"]["tier3_kind"] == "3b"
    assert events[0]["data"]["safety_assessment_id"]


async def test_cancelling_a_countdown_succeeds(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    await _onboard(client, onboarding_payload)
    _patch_provider(monkeypatch)

    r = await client.post(
        "/api/v1/talk/messages",
        json={"text": "I want to kill myself, I have the pills"},
    )
    assessment_id = _parse_sse(r.text)[0]["data"]["safety_assessment_id"]

    cancel = await client.post(f"/api/v1/talk/safety/{assessment_id}/cancel")
    assert cancel.status_code == 204


async def test_expiring_a_countdown_succeeds(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    await _onboard(client, onboarding_payload)
    _patch_provider(monkeypatch)

    r = await client.post(
        "/api/v1/talk/messages",
        json={"text": "I want to kill myself, I have the pills"},
    )
    assessment_id = _parse_sse(r.text)[0]["data"]["safety_assessment_id"]

    expire = await client.post(f"/api/v1/talk/safety/{assessment_id}/expire")
    assert expire.status_code == 204


async def test_cancelling_someone_elses_countdown_is_a_silent_no_op(
    client, onboarding_payload, patch_talk_session_factory, monkeypatch
):
    """Scoped to the owning user -- no 403/404 that would let one student
    probe whether an assessment id belongs to someone else."""
    await _onboard(client, onboarding_payload)
    _patch_provider(monkeypatch)
    r = await client.post(
        "/api/v1/talk/messages",
        json={"text": "I want to kill myself, I have the pills"},
    )
    assessment_id = _parse_sse(r.text)[0]["data"]["safety_assessment_id"]

    client.cookies.clear()
    await _onboard(client, onboarding_payload)

    resp = await client.post(f"/api/v1/talk/safety/{assessment_id}/cancel")
    assert resp.status_code == 204
