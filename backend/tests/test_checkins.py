"""Today: persistence, one-per-day, and SIGNAL extraction."""

import pytest
from sqlalchemy import func, select

from app.modules.checkins.models import CheckIn, Signal


async def _onboard(client, payload, language="en"):
    """A completed account, since check-ins require one."""
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


FULL = {
    "date": "2026-09-04",
    "mood": 2,
    "sleepHours": 4.5,
    "energy": 2,
    "social": 3,
    "note": "Exam tomorrow and I haven't prepared.",
}


async def test_check_in_requires_a_finished_account(client):
    await client.post("/api/v1/auth/anonymous")
    r = await client.post("/api/v1/checkins", json=FULL)
    assert r.status_code == 403


async def test_values_survive_exactly(client, onboarding_payload):
    """The student's own numbers are authoritative and must not be reshaped."""
    await _onboard(client, onboarding_payload)
    r = await client.post("/api/v1/checkins", json=FULL)
    assert r.status_code == 200

    body = r.json()
    assert body["mood"] == 2
    # A JSON *number*, not a string. Pydantic serialises Decimal as a string,
    # and the frontend does arithmetic on this field.
    assert isinstance(body["sleepHours"], (int, float))
    assert body["sleepHours"] == 4.5
    assert body["energy"] == 2
    assert body["social"] == 3
    assert body["date"] == "2026-09-04"


async def test_reflection_matches_the_ported_rules(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    # Exam hint outranks low sleep and low mood, as in the original fixture.
    body = (await client.post("/api/v1/checkins", json=FULL)).json()
    assert body["reflection"]["ackKey"] == "today.ack.exam"
    assert body["reflection"]["suggestion"]["titleKey"] == "today.suggest.reframe.title"

    good = {**FULL, "date": "2026-09-05", "mood": 5, "sleepHours": 8, "note": ""}
    body = (await client.post("/api/v1/checkins", json=good)).json()
    assert body["reflection"]["ackKey"] == "today.ack.goodMood"
    assert body["reflection"]["suggestion"] is None


async def test_structured_signals_are_recorded_verbatim(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    await client.post("/api/v1/checkins", json=FULL)

    rows = (await session.scalars(select(Signal))).all()
    structured = {s.kind: s.value for s in rows if s.source == "structured"}

    assert structured["mood"]["value"] == 2
    assert structured["sleep"]["value"] == 4.5
    assert structured["energy"]["value"] == 2
    assert structured["social"]["value"] == 3


async def test_note_signals_are_additive_and_never_overwrite(
    client, session, onboarding_payload
):
    """A note may add context. It must not change a reported number."""
    await _onboard(client, onboarding_payload)
    # The note claims great sleep while the slider says 4.5 hours.
    await client.post(
        "/api/v1/checkins",
        json={**FULL, "note": "slept wonderfully, exam went great, felt amazing"},
    )

    rows = (await session.scalars(select(Signal))).all()
    structured = {s.kind: s.value for s in rows if s.source == "structured"}
    note_kinds = {s.kind for s in rows if s.source == "note"}

    # The slider still wins.
    assert structured["sleep"]["value"] == 4.5
    assert structured["mood"]["value"] == 2
    # And the note contributed its own, separately marked, observations.
    assert "exam_pressure" in note_kinds
    assert "sleep_mention" in note_kinds
    # Note signals never masquerade as structured ones.
    assert not (note_kinds & set(structured))


async def test_skipped_scales_produce_no_signal_rather_than_zero(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    await client.post(
        "/api/v1/checkins",
        json={"date": "2026-09-04", "mood": 3, "sleepHours": 7, "note": ""},
    )

    rows = (await session.scalars(select(Signal))).all()
    kinds = {s.kind for s in rows}
    assert "mood" in kinds and "sleep" in kinds
    # Absent is not the same fact as "none of it".
    assert "energy" not in kinds
    assert "social" not in kinds

    body = (await client.get("/api/v1/checkins/2026-09-04")).json()
    assert body["energy"] is None
    assert body["social"] is None


async def test_second_submission_same_day_replaces_rather_than_duplicates(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    await client.post("/api/v1/checkins", json=FULL)
    await client.post("/api/v1/checkins", json={**FULL, "mood": 5, "note": ""})

    assert await session.scalar(select(func.count()).select_from(CheckIn)) == 1
    body = (await client.get("/api/v1/checkins/2026-09-04")).json()
    assert body["mood"] == 5
    # Signals are derived, so the stale ones must not linger.
    rows = (await session.scalars(select(Signal))).all()
    assert not any(s.source == "note" for s in rows)


async def test_a_different_day_is_a_new_check_in(client, session, onboarding_payload):
    await _onboard(client, onboarding_payload)
    await client.post("/api/v1/checkins", json=FULL)
    await client.post("/api/v1/checkins", json={**FULL, "date": "2026-09-05"})
    assert await session.scalar(select(func.count()).select_from(CheckIn)) == 2


async def test_list_is_newest_first(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    for day in ("2026-09-01", "2026-09-03", "2026-09-02"):
        await client.post("/api/v1/checkins", json={**FULL, "date": day})

    days = [c["date"] for c in (await client.get("/api/v1/checkins")).json()]
    assert days == ["2026-09-03", "2026-09-02", "2026-09-01"]


async def test_delete_removes_the_check_in_and_its_signals(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    await client.post("/api/v1/checkins", json=FULL)

    r = await client.delete("/api/v1/checkins/2026-09-04")
    assert r.status_code == 204

    assert await session.scalar(select(func.count()).select_from(CheckIn)) == 0
    # Nothing derived may outlive the row it came from -- /data promises the
    # student it is gone for good.
    assert await session.scalar(select(func.count()).select_from(Signal)) == 0
    assert (await client.get("/api/v1/checkins/2026-09-04")).json() is None


async def test_deleting_a_day_with_no_check_in_is_a_404(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    assert (await client.delete("/api/v1/checkins/2026-09-04")).status_code == 404


@pytest.mark.parametrize(
    "bad",
    [
        {"mood": 0},
        {"mood": 6},
        {"sleepHours": -1},
        {"sleepHours": 13},
        {"sleepHours": 6.25},  # slider moves in 0.5 steps
        {"energy": 0},
        {"social": 9},
    ],
)
async def test_out_of_range_values_are_refused(client, onboarding_payload, bad):
    await _onboard(client, onboarding_payload)
    r = await client.post("/api/v1/checkins", json={**FULL, **bad})
    assert r.status_code == 422


async def test_check_ins_are_scoped_to_their_own_account(
    client, session, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    await client.post("/api/v1/checkins", json=FULL)

    client.cookies.clear()
    await _onboard(client, onboarding_payload, language="bn")
    assert (await client.get("/api/v1/checkins")).json() == []
