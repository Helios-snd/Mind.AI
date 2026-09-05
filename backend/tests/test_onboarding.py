"""Onboarding: the payload shape, merge semantics, and completion rules."""

import pytest


async def _anon(client):
    await client.post("/api/v1/auth/anonymous")


async def test_progress_defaults_to_step_one_and_omits_absent_fields(client):
    await _anon(client)
    r = await client.get("/api/v1/onboarding")
    assert r.status_code == 200

    body = r.json()
    assert body["step"] == 1
    # mockClient never sets absent keys, so the real API must not send nulls.
    for absent in ("baseline", "consentAt", "crisisPlan", "contact", "completedAt"):
        assert absent not in body


async def test_patch_returns_the_full_merged_progress_in_camel_case(
    client, onboarding_payload
):
    await _anon(client)

    r = await client.patch(
        "/api/v1/onboarding", json={"step": 2, "language": "bn"}
    )
    assert r.json()["language"] == "bn"
    assert r.json()["step"] == 2

    r = await client.patch(
        "/api/v1/onboarding",
        json={"step": 4, "baseline": onboarding_payload["baseline"]},
    )
    body = r.json()
    assert body["step"] == 4
    assert body["language"] == "bn"  # earlier fields survive the patch
    assert len(body["baseline"]) == 3
    assert body["baseline"][0]["itemId"] == "dass-3"


async def test_crisis_plan_round_trips_in_the_frontends_key_names(client):
    await _anon(client)
    plan = {
        "whoIdCall": "Rhea",
        "whatHelps": "Cold water",
        "whatMakesItWorse": "Scrolling",
    }
    r = await client.put("/api/v1/crisis-plan", json=plan)
    assert r.status_code == 200
    assert r.json() == plan

    assert (await client.get("/api/v1/crisis-plan")).json() == plan


async def test_a_blanked_field_is_actually_cleared(client):
    """Regression: merging on truthiness would make a field impossible to
    erase, and the crisis-plan form allows blank answers."""
    await _anon(client)
    await client.put(
        "/api/v1/crisis-plan",
        json={
            "whoIdCall": "Rhea",
            "whatHelps": "Cold water",
            "whatMakesItWorse": "Scrolling",
        },
    )

    await client.put(
        "/api/v1/crisis-plan",
        json={"whoIdCall": "Rhea", "whatHelps": "Cold water", "whatMakesItWorse": ""},
    )
    assert (await client.get("/api/v1/crisis-plan")).json()["whatMakesItWorse"] == ""


async def test_an_omitted_field_is_preserved(client):
    await _anon(client)
    await client.put(
        "/api/v1/crisis-plan",
        json={
            "whoIdCall": "Rhea",
            "whatHelps": "Cold water",
            "whatMakesItWorse": "Scrolling",
        },
    )

    # A partial write must not blank the rest -- mockClient's shallow replace
    # would have.
    await client.put("/api/v1/crisis-plan", json={"whoIdCall": "Ma"})
    body = (await client.get("/api/v1/crisis-plan")).json()
    assert body["whoIdCall"] == "Ma"
    assert body["whatHelps"] == "Cold water"


async def test_contact_rejects_a_malformed_phone(client):
    await _anon(client)
    r = await client.put(
        "/api/v1/trusted-contact",
        json={"name": "Rhea", "relationship": "friend", "phone": "12345"},
    )
    assert r.status_code == 422


async def test_missing_plan_or_contact_returns_null_not_404(client):
    await _anon(client)
    assert (await client.get("/api/v1/crisis-plan")).json() is None
    assert (await client.get("/api/v1/trusted-contact")).json() is None


async def test_complete_refuses_an_unfinished_account(client):
    await _anon(client)
    r = await client.post("/api/v1/onboarding/complete")
    # mockClient stamped completedAt unconditionally; the server must not.
    assert r.status_code == 422


async def test_full_run_completes_and_records_consent(client, onboarding_payload):
    await _anon(client)

    await client.patch(
        "/api/v1/onboarding", json={"step": 2, "language": onboarding_payload["language"]}
    )
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

    done = await client.post("/api/v1/onboarding/complete")
    assert done.status_code == 200
    assert done.json()["completedAt"] is not None

    # The reissued token must say onboarded, or middleware keeps redirecting.
    me = await client.get("/api/v1/me")
    assert me.json()["onboarded"] is True
    assert me.json()["language"] == "bn"


async def test_consent_is_stamped_once_even_if_resent(client, session):
    from sqlalchemy import func, select

    from app.modules.onboarding.models import ConsentEvent

    await _anon(client)
    for _ in range(3):
        await client.patch(
            "/api/v1/onboarding",
            json={"step": 4, "consentAt": "2026-09-04T10:00:00+00:00"},
        )

    count = await session.scalar(select(func.count()).select_from(ConsentEvent))
    assert count == 1


async def _complete_run(client, payload, language="bn"):
    await _anon(client)
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
    return await client.post("/api/v1/onboarding/complete")


async def test_completion_scores_the_baseline(client, session, onboarding_payload):
    from sqlalchemy import select

    from app.modules.screening.models import ScreeningScore, ScreeningSession

    assert (await _complete_run(client, onboarding_payload)).status_code == 200

    run = (await session.scalars(select(ScreeningSession))).one()
    assert run.instrument == "dass21"
    assert run.trigger == "onboarding"
    assert run.language == "bn"
    # Bengali items are working translations, so the score is explicitly not
    # marked as coming from a validated instrument.
    assert run.instrument_validated is False

    scores = {s.subscale: s for s in (await session.scalars(select(ScreeningScore))).all()}
    assert set(scores) == {"depression", "anxiety", "stress"}
    # The fixture answers dass-3=2, dass-5=1, dass-10=3 -- all Depression.
    assert scores["depression"].raw == 12
    assert scores["depression"].items_answered == 3
    assert scores["anxiety"].items_answered == 0


async def test_english_run_is_marked_validated(client, session, onboarding_payload):
    from sqlalchemy import select

    from app.modules.screening.models import ScreeningSession

    assert (
        await _complete_run(client, onboarding_payload, language="en")
    ).status_code == 200
    run = (await session.scalars(select(ScreeningSession))).one()
    assert run.instrument_validated is True


async def test_scores_are_never_exposed_to_the_student(client, onboarding_payload):
    """Hard constraint 1: the student sees plain language, never a label."""
    assert (await _complete_run(client, onboarding_payload)).status_code == 200

    body = (await client.get("/api/v1/onboarding")).json()
    serialised = str(body).lower()
    for leaked in ("severity", "depression", "anxiety", "stress", "moderate", "severe"):
        assert leaked not in serialised

    me = (await client.get("/api/v1/me")).json()
    assert "severity" not in str(me).lower()
