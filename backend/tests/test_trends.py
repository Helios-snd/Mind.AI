"""Trends: thresholds, baselines, and the refusal to invent data."""

from datetime import date, timedelta

import pytest

from app.modules.trends import compute
from app.modules.trends.compute import Point


def days(*values: float, start: date = date(2026, 8, 1)) -> list[Point]:
    return [Point(start + timedelta(days=i), v) for i, v in enumerate(values)]


# --- pure computation -------------------------------------------------------


def test_below_the_chart_threshold_shows_the_numbers_but_no_trend_claim():
    """A 1-2 check-in student still reported real data. The points, average,
    high and low come through; anything that implies a trend -- baseline,
    direction, change, an observation sentence -- is withheld until there is
    enough to say it honestly."""
    history = days(3, 4, start=date(2026, 8, 30))
    result = compute.compute_series("mood", history, "7d", date(2026, 8, 31))
    assert result.has_enough is False
    assert len(result.points) == 2
    assert result.average == 3.5
    assert result.high == 4
    assert result.low == 3
    assert result.change is None
    assert result.baseline is None
    assert result.direction is None
    assert result.observation_key is None


def test_at_the_threshold_a_chart_appears():
    history = days(3, 4, 2, start=date(2026, 8, 29))
    result = compute.compute_series("mood", history, "7d", date(2026, 8, 31))
    assert len(result.points) == 3
    assert result.average == 3.0


def test_no_baseline_until_there_is_older_history():
    """Three days is not "your usual range"."""
    history = days(3, 4, 2, start=date(2026, 8, 29))
    result = compute.compute_series("mood", history, "7d", date(2026, 8, 31))
    assert result.baseline is None
    assert result.relation is None


def test_baseline_excludes_the_recent_holdout():
    """Otherwise a sustained decline drags the baseline down with it and the
    student never reads as below their own normal."""
    today = date(2026, 9, 30)
    # Twenty older days around 4, then a week of 1s inside the holdout.
    history = days(*([4.0] * 20), start=date(2026, 9, 1))
    history += days(*([1.0] * 7), start=date(2026, 9, 24))

    baseline = compute.compute_baseline(history, today)
    assert baseline is not None
    # The recent collapse must not be inside "usual".
    assert baseline.low >= 3.5
    assert baseline.high >= 3.5


def test_a_dip_reads_as_below_the_students_own_range():
    today = date(2026, 9, 30)
    history = days(*([4.0] * 20), start=date(2026, 9, 1))
    history += days(*([1.5] * 7), start=date(2026, 9, 24))

    result = compute.compute_series("mood", history, "7d", today)
    assert result.relation == "below"
    assert result.observation_key == "trends.obs.belowBaseline"
    assert result.tip_key == "trends.tip.mood"


def test_direction_needs_four_points():
    history = days(5, 4, 3, start=date(2026, 8, 29))
    result = compute.compute_series("mood", history, "7d", date(2026, 8, 31))
    assert result.direction is None


def test_declining_and_rising_are_detected():
    today = date(2026, 8, 8)
    falling = compute.compute_series(
        "mood", days(5, 5, 4, 2, 2, 1, start=date(2026, 8, 3)), "7d", today
    )
    assert falling.direction == "declining"

    rising = compute.compute_series(
        "mood", days(1, 1, 2, 4, 4, 5, start=date(2026, 8, 3)), "7d", today
    )
    assert rising.direction == "rising"


def test_small_wobble_is_steady_not_a_trend():
    today = date(2026, 8, 8)
    result = compute.compute_series(
        "mood", days(3, 3.1, 3, 3.2, 3, 3.1, start=date(2026, 8, 3)), "7d", today
    )
    assert result.direction == "steady"
    assert result.tip_key is None  # a steady week gets no advice


def test_sleep_uses_a_wider_steady_band_than_the_1_to_5_scales():
    """Sleep is in hours; a 0.4h wobble is not a trend, a 0.4 mood shift is."""
    today = date(2026, 8, 8)
    # Halves differ by 0.4 -- above the 1-5 scales' 0.3 threshold, below
    # sleep's 0.5. Same numbers, different verdict, which is the point.
    values = (7.0, 7.0, 7.0, 7.4, 7.4, 7.4)
    assert (
        compute.compute_series("sleep", days(*values, start=date(2026, 8, 3)), "7d", today).direction
        == "steady"
    )
    assert (
        compute.compute_series("mood", days(*values, start=date(2026, 8, 3)), "7d", today).direction
        == "rising"
    )


def test_weekly_ranges_bucket_by_monday():
    today = date(2026, 8, 30)
    history = days(*([3.0] * 28), start=date(2026, 8, 3))
    result = compute.compute_series("mood", history, "4w", today)
    assert all(p.at.weekday() == 0 for p in result.points)
    assert len(result.points) == 4


def test_change_compares_against_the_previous_window():
    today = date(2026, 8, 14)
    history = days(*([5.0] * 7), start=date(2026, 8, 1))     # previous week
    history += days(*([3.0] * 7), start=date(2026, 8, 8))    # this week
    result = compute.compute_series("mood", history, "7d", today)
    assert result.change == -2.0


def test_summary_only_speaks_when_two_things_move_together():
    today = date(2026, 9, 30)

    def falling(series_id):
        history = days(*([4.0] * 20), start=date(2026, 9, 1))
        history += days(*([1.5] * 7), start=date(2026, 9, 24))
        return compute.compute_series(series_id, history, "7d", today)

    def flat(series_id):
        return compute.compute_series(
            series_id, days(*([3.0] * 27), start=date(2026, 9, 1)), "7d", today
        )

    both = {"sleep": falling("sleep"), "mood": falling("mood"),
            "energy": flat("energy"), "social": flat("social")}
    insights, tip = compute.summarise(both)
    assert insights == ["trends.summary.sleepAndMood"]
    assert tip == "trends.tip.sleepConsistency"

    calm = {k: flat(k) for k in compute.SERIES_IDS}
    insights, tip = compute.summarise(calm)
    assert insights == ["trends.summary.steady"]
    assert tip is None


# --- through the API --------------------------------------------------------


async def _onboard(client, payload):
    await client.post("/api/v1/auth/anonymous")
    await client.patch("/api/v1/onboarding", json={"step": 2, "language": "en"})
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


async def test_zero_check_ins_is_an_honest_empty_state(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    body = (await client.get("/api/v1/trends")).json()
    assert body["checkInCount"] == 0
    assert body["hasEnoughData"] is False
    assert all(s["points"] == [] for s in body["series"])
    assert body["summary"]["insightKeys"] == []


async def test_two_check_ins_offer_no_baseline_or_insight(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    await _check_in(client, "2026-09-03", mood=2)
    await _check_in(client, "2026-09-04", mood=4)

    body = (await client.get("/api/v1/trends")).json()
    assert body["hasEnoughData"] is False
    for series in body["series"]:
        assert series["baseline"] is None
        assert series["observationKey"] is None
    assert body["summary"]["insightKeys"] == []


async def test_energy_and_social_come_through_as_collected(
    client, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    for day, energy, social in (
        ("2026-09-02", 1, 5),
        ("2026-09-03", 2, 4),
        ("2026-09-04", 3, 3),
    ):
        await _check_in(client, day, energy=energy, social=social)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    series = {s["id"]: s for s in body["series"]}

    assert [p["value"] for p in series["energy"]["points"]] == [1.0, 2.0, 3.0]
    assert [p["value"] for p in series["social"]["points"]] == [5.0, 4.0, 3.0]


async def test_skipped_scales_are_absent_not_zero(client, onboarding_payload):
    """A day with no energy answer must not pull the energy line to zero.

    Four days, one of which skips energy. Mood plots four points; energy plots
    three and skips the gap entirely -- the threshold applies per series, not
    per check-in.
    """
    await _onboard(client, onboarding_payload)
    await _check_in(client, "2026-09-01", energy=4)
    await _check_in(client, "2026-09-02", energy=4)
    await _check_in(client, "2026-09-03")            # energy omitted
    await _check_in(client, "2026-09-04", energy=4)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    series = {s["id"]: s for s in body["series"]}

    assert len(series["mood"]["points"]) == 4
    assert [p["value"] for p in series["energy"]["points"]] == [4.0, 4.0, 4.0]
    assert [p["at"] for p in series["energy"]["points"]] == [
        "2026-09-01",
        "2026-09-02",
        "2026-09-04",
    ]
    # Never dragged toward zero by the missing day.
    assert series["energy"]["average"] == 4.0


async def test_sleep_values_are_json_numbers(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    for day in ("2026-09-02", "2026-09-03", "2026-09-04"):
        await _check_in(client, day, sleepHours=4.5)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    sleep = {s["id"]: s for s in body["series"]}["sleep"]
    assert all(isinstance(p["value"], (int, float)) for p in sleep["points"])
    assert sleep["points"][0]["value"] == 4.5


async def test_points_match_the_database_exactly(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    written = {"2026-09-02": 1, "2026-09-03": 5, "2026-09-04": 3}
    for day, mood in written.items():
        await _check_in(client, day, mood=mood)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    mood = {s["id"]: s for s in body["series"]}["mood"]
    assert {p["at"]: p["value"] for p in mood["points"]} == {
        k: float(v) for k, v in written.items()
    }


async def test_deleting_a_check_in_removes_its_trend_point(
    client, onboarding_payload
):
    await _onboard(client, onboarding_payload)
    for day in ("2026-09-02", "2026-09-03", "2026-09-04"):
        await _check_in(client, day, mood=4)

    before = (await client.get("/api/v1/trends?range=7d")).json()
    assert len({s["id"]: s for s in before["series"]}["mood"]["points"]) == 3

    await client.delete("/api/v1/checkins/2026-09-03")

    after = (await client.get("/api/v1/trends?range=7d")).json()
    points = {s["id"]: s for s in after["series"]}["mood"]["points"]
    assert "2026-09-03" not in [p["at"] for p in points]
    assert after["checkInCount"] == 2


async def test_trends_require_a_finished_account(client):
    await client.post("/api/v1/auth/anonymous")
    assert (await client.get("/api/v1/trends")).status_code == 403


async def test_one_student_never_sees_another(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    for day in ("2026-09-02", "2026-09-03", "2026-09-04"):
        await _check_in(client, day, mood=1)

    client.cookies.clear()
    await _onboard(client, onboarding_payload)

    body = (await client.get("/api/v1/trends")).json()
    assert body["checkInCount"] == 0
    assert all(s["points"] == [] for s in body["series"])


@pytest.mark.parametrize("bad", ["1d", "12w", "", "all"])
async def test_unknown_ranges_are_refused(client, onboarding_payload, bad):
    await _onboard(client, onboarding_payload)
    assert (await client.get(f"/api/v1/trends?range={bad}")).status_code == 422


async def test_a_check_in_dated_ahead_of_utc_still_appears(
    client, onboarding_payload
):
    """Kolkata is UTC+5:30, so a check-in at 1am local carries a local_date one
    day ahead of the server's UTC date. Anchoring the window on UTC dropped it
    from every range -- the student's most recent day simply vanished."""
    await _onboard(client, onboarding_payload)

    from datetime import date, timedelta

    from app.db.base import utcnow

    tomorrow = utcnow().date() + timedelta(days=1)
    for offset in (2, 1, 0):
        await _check_in(client, str(tomorrow - timedelta(days=offset)), mood=4)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    mood = {s["id"]: s for s in body["series"]}["mood"]

    assert body["hasEnoughData"] is True
    assert len(mood["points"]) == 3
    assert str(tomorrow) in [p["at"] for p in mood["points"]]


async def test_enough_data_reflects_the_selected_range_not_all_history(
    client, onboarding_payload
):
    """Otherwise the page announces it has enough data above four cards that
    each say it does not."""
    await _onboard(client, onboarding_payload)

    from datetime import timedelta

    from app.db.base import utcnow

    # Three check-ins, all far outside a 7-day window.
    old = utcnow().date() - timedelta(days=60)
    for offset in range(3):
        await _check_in(client, str(old + timedelta(days=offset)), mood=3)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    assert body["checkInCount"] == 3
    # Nothing is plottable in this range, so the gate must say so.
    assert body["hasEnoughData"] is False
    assert all(s["points"] == [] for s in body["series"])


# --- secondary indicators and the starting point -----------------------------


async def test_appetite_and_activity_come_back_as_secondary_indicators(
    client, onboarding_payload
):
    """Collected in Today, so they must not be invisible in Trends."""
    await _onboard(client, onboarding_payload)

    from datetime import timedelta

    from app.db.base import utcnow

    today = utcnow().date()
    # Got out on 3 of 4 days.
    for offset, activity in ((3, 1), (2, 4), (1, 3), (0, 5)):
        await _check_in(
            client, str(today - timedelta(days=offset)), appetite=3, activity=activity
        )

    body = (await client.get("/api/v1/trends?range=7d")).json()
    secondary = {s["id"]: s for s in body["secondary"]}

    assert set(secondary) == {"appetite", "activity"}
    assert secondary["activity"]["daysCounted"] == 4
    assert secondary["activity"]["positiveDays"] == 3
    assert secondary["activity"]["observationKey"] == "trends.secondary.activity.count"
    assert secondary["appetite"]["average"] == 3.0
    # Appetite has no "got out" notion, so no count is invented for it.
    assert secondary["appetite"]["positiveDays"] is None


async def test_secondary_is_empty_when_those_scales_were_skipped(
    client, onboarding_payload
):
    await _onboard(client, onboarding_payload)

    from datetime import timedelta

    from app.db.base import utcnow

    today = utcnow().date()
    for offset in (2, 1, 0):
        await _check_in(client, str(today - timedelta(days=offset)))  # no appetite/activity

    body = (await client.get("/api/v1/trends?range=7d")).json()
    for entry in body["secondary"]:
        assert entry["daysCounted"] == 0
        assert entry["average"] is None
        assert entry["observationKey"] is None


async def test_starting_point_carries_a_date_but_never_an_instrument_label(
    client, onboarding_payload
):
    """Hard constraint 1: the student sees plain language, never a label. The
    DASS-21 severity band stays in the counsellor's half of the product."""
    await _onboard(client, onboarding_payload)

    from datetime import timedelta

    from app.db.base import utcnow

    today = utcnow().date()
    # Two weeks, so the starting point has a genuinely earlier window to
    # average over rather than overlapping the recent one.
    for offset in range(13, -1, -1):
        await _check_in(client, str(today - timedelta(days=offset)), mood=4)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    start = body["startingPoint"]

    assert start is not None
    assert start["since"] is not None
    assert start["baselineTaken"] is True
    assert start["firstValues"]["mood"] == 4.0

    # Nothing clinical anywhere in the payload.
    serialised = str(body).lower()
    for leaked in ("severity", "depression", "anxiety", "stress", "moderate", "dass"):
        assert leaked not in serialised


async def test_starting_point_needs_more_than_one_day(client, onboarding_payload):
    await _onboard(client, onboarding_payload)

    from app.db.base import utcnow

    await _check_in(client, str(utcnow().date()), mood=5)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    # One reading is not a starting point.
    assert body["startingPoint"]["firstValues"] == {}


async def test_starting_point_withholds_values_until_then_precedes_now(
    client, onboarding_payload
):
    """With only a week of history the "first week" and the recent window are
    the same data, so the comparison would read Then 3.7 / Now 3.7 on a day the
    student actually dropped."""
    await _onboard(client, onboarding_payload)

    from datetime import timedelta

    from app.db.base import utcnow

    today = utcnow().date()
    for offset in range(6, 0, -1):
        await _check_in(client, str(today - timedelta(days=offset)), mood=4)
    await _check_in(client, str(today), mood=2)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    start = body["startingPoint"]
    assert start["since"] is not None
    # The date and the baseline flag still show; the misleading numbers do not.
    assert start["firstValues"] == {}


async def test_starting_point_appears_once_history_is_long_enough(
    client, onboarding_payload
):
    await _onboard(client, onboarding_payload)

    from datetime import timedelta

    from app.db.base import utcnow

    today = utcnow().date()
    # Two weeks: the first week is genuinely earlier than the recent window.
    for offset in range(13, 6, -1):
        await _check_in(client, str(today - timedelta(days=offset)), mood=5)
    for offset in range(6, -1, -1):
        await _check_in(client, str(today - timedelta(days=offset)), mood=2)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    start = body["startingPoint"]
    assert start["firstValues"]["mood"] == 5.0


async def test_high_and_low_reflect_the_actual_extremes(client, onboarding_payload):
    await _onboard(client, onboarding_payload)

    from datetime import timedelta

    from app.db.base import utcnow

    today = utcnow().date()
    for offset, mood in ((2, 1), (1, 5), (0, 3)):
        await _check_in(client, str(today - timedelta(days=offset)), mood=mood)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    mood = {s["id"]: s for s in body["series"]}["mood"]
    assert mood["high"] == 5.0
    assert mood["low"] == 1.0
    assert mood["average"] == 3.0


async def test_one_check_in_still_returns_its_own_number(client, onboarding_payload):
    """The point that exists is real. It should not be withheld just because
    there is only one of it."""
    await _onboard(client, onboarding_payload)
    await _check_in(client, "2026-09-04", mood=4)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    assert body["hasEnoughData"] is False
    mood = {s["id"]: s for s in body["series"]}["mood"]
    assert len(mood["points"]) == 1
    assert mood["points"][0]["value"] == 4.0
    assert mood["average"] == 4.0
    assert mood["high"] == 4.0
    assert mood["low"] == 4.0
    assert mood["baseline"] is None
    assert mood["change"] is None


async def test_two_check_ins_show_points_but_the_top_level_gate_stays_closed(
    client, onboarding_payload
):
    """Regression: hasEnoughData must not flip true just because points became
    non-empty at the partial-data tier."""
    await _onboard(client, onboarding_payload)
    await _check_in(client, "2026-09-03", mood=2)
    await _check_in(client, "2026-09-04", mood=4)

    body = (await client.get("/api/v1/trends?range=7d")).json()
    assert body["hasEnoughData"] is False
    mood = {s["id"]: s for s in body["series"]}["mood"]
    assert len(mood["points"]) == 2
    assert mood["average"] == 3.0


# --- check-in rhythm ---------------------------------------------------------


async def test_rhythm_counts_distinct_check_in_days_in_the_window(
    client, onboarding_payload
):
    await _onboard(client, onboarding_payload)

    from datetime import timedelta

    from app.db.base import utcnow

    today = utcnow().date()
    for offset in (5, 3, 0):
        await _check_in(client, str(today - timedelta(days=offset)))

    body = (await client.get("/api/v1/trends?range=7d")).json()
    assert body["rhythm"] == {"daysLogged": 3, "windowDays": 7}


async def test_rhythm_scales_with_the_selected_range(client, onboarding_payload):
    await _onboard(client, onboarding_payload)

    from app.db.base import utcnow

    await _check_in(client, str(utcnow().date()))

    for range_key, window_days in (("7d", 7), ("4w", 28), ("6w", 42)):
        body = (await client.get(f"/api/v1/trends?range={range_key}")).json()
        assert body["rhythm"] == {"daysLogged": 1, "windowDays": window_days}


async def test_rhythm_is_zero_with_no_check_ins(client, onboarding_payload):
    await _onboard(client, onboarding_payload)
    body = (await client.get("/api/v1/trends?range=7d")).json()
    assert body["rhythm"] == {"daysLogged": 0, "windowDays": 7}


async def test_rhythm_never_fabricates_a_day_outside_the_window(
    client, onboarding_payload
):
    """A check-in from three weeks ago must not inflate a 7-day rhythm count."""
    await _onboard(client, onboarding_payload)

    from datetime import timedelta

    from app.db.base import utcnow

    today = utcnow().date()
    await _check_in(client, str(today - timedelta(days=21)))
    await _check_in(client, str(today))

    body = (await client.get("/api/v1/trends?range=7d")).json()
    assert body["rhythm"]["daysLogged"] == 1
