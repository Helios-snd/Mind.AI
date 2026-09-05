"""Self-serve assessments: scoring, the safety path, and the schema that
silently broke both.
"""

import pytest
from sqlalchemy import func, select

from app.modules.screening.models import ScreeningAnswer, ScreeningScore, ScreeningSession


def phq9(*values: int) -> dict:
    return {
        "instrument": "phq9",
        "language": "en",
        "answers": [{"itemId": f"phq9-{i}", "value": v} for i, v in enumerate(values, 1)],
    }


def gad7(*values: int) -> dict:
    return {
        "instrument": "gad7",
        "language": "en",
        "answers": [{"itemId": f"gad7-{i}", "value": v} for i, v in enumerate(values, 1)],
    }


def asrs(*values: int) -> dict:
    return {
        "instrument": "asrs_v1_1",
        "language": "en",
        "answers": [
            {"itemId": f"asrs_v1_1-{i}", "value": v} for i, v in enumerate(values, 1)
        ],
    }


async def _anon(client):
    await client.post("/api/v1/auth/anonymous")


async def test_submission_requires_a_session_but_onboarding_is_not_needed(client):
    """The assessment lives on the public site, so it must work without having
    finished onboarding -- but it still needs an account to save against."""
    assert (await client.post("/api/v1/screenings/complete", json=phq9(*([0] * 9)))).status_code == 401

    await _anon(client)
    r = await client.post("/api/v1/screenings/complete", json=phq9(*([0] * 9)))
    assert r.status_code == 200


async def test_phq9_scores_and_bands(client):
    await _anon(client)
    body = (await client.post("/api/v1/screenings/complete", json=phq9(2, 2, 2, 2, 2, 2, 2, 2, 0))).json()
    assert body["score"] == 16
    assert body["maximum"] == 27
    assert body["band"] == "moderately severe"
    assert body["requiresSafetyReview"] is False


async def test_phq9_item_9_routes_to_safety_and_withholds_the_score(client):
    """A sensitive response must not come back as a reassuring number."""
    await _anon(client)
    body = (await client.post("/api/v1/screenings/complete", json=phq9(0, 0, 0, 0, 0, 0, 0, 0, 1))).json()

    assert body["requiresSafetyReview"] is True
    # No ordinary aggregate result is handed back on this path.
    assert body["score"] is None
    assert body["band"] is None
    assert body["maximum"] is None


async def test_safety_state_is_persisted(client, session):
    await _anon(client)
    await client.post("/api/v1/screenings/complete", json=phq9(0, 0, 0, 0, 0, 0, 0, 0, 3))

    row = (await session.scalars(select(ScreeningSession))).one()
    # Regression: this column existed on the model but not in the database,
    # which made every submission a 500.
    assert row.safety_state == "needs_review"
    assert row.trigger == "self_serve"


async def test_answers_are_stored(client, session):
    await _anon(client)
    await client.post("/api/v1/screenings/complete", json=gad7(1, 2, 3, 0, 1, 2, 3))

    stored = {
        a.item_id: a.value for a in (await session.scalars(select(ScreeningAnswer))).all()
    }
    assert stored == {f"gad7-{i}": v for i, v in enumerate((1, 2, 3, 0, 1, 2, 3), 1)}


async def test_asrs_long_band_label_fits_the_column(client, session):
    """Regression: "further evaluation may be worthwhile" is 36 characters and
    overflowed a varchar(20), producing a 500 only for this instrument."""
    await _anon(client)
    body = (await client.post("/api/v1/screenings/complete", json=asrs(3, 3, 3, 3, 3, 3))).json()

    assert body["band"] == "further evaluation may be worthwhile"
    assert body["positiveCount"] == 6
    assert body["maximum"] == 6

    stored = (await session.scalars(select(ScreeningScore))).all()
    assert any(s.severity_band == "further evaluation may be worthwhile" for s in stored)


async def test_asrs_below_threshold(client):
    await _anon(client)
    body = (await client.post("/api/v1/screenings/complete", json=asrs(0, 0, 0, 0, 0, 0))).json()
    assert body["positiveCount"] == 0
    assert body["band"] == "screen did not reach the referral threshold"


@pytest.mark.parametrize(
    "payload,reason",
    [
        (phq9(*([0] * 8)), "one answer short"),
        (phq9(*([0] * 10)), "one answer too many"),
        (phq9(*([4] * 9)), "value above the response scale"),
        (phq9(*([-1] * 9)), "value below the response scale"),
    ],
)
async def test_malformed_submissions_are_refused_not_scored(client, payload, reason):
    await _anon(client)
    r = await client.post("/api/v1/screenings/complete", json=payload)
    assert r.status_code in (400, 422), reason


async def test_duplicate_item_ids_are_refused(client):
    await _anon(client)
    body = {
        "instrument": "phq9",
        "language": "en",
        "answers": [{"itemId": "phq9-1", "value": 1}] * 9,
    }
    assert (await client.post("/api/v1/screenings/complete", json=body)).status_code in (400, 422)


async def test_each_submission_is_its_own_session(client, session):
    await _anon(client)
    await client.post("/api/v1/screenings/complete", json=gad7(*([0] * 7)))
    await client.post("/api/v1/screenings/complete", json=gad7(*([1] * 7)))
    assert await session.scalar(select(func.count()).select_from(ScreeningSession)) == 2
