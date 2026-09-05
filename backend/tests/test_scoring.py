"""DASS-21 scoring, checked against the published allocation and cut-offs."""

import pytest

from app.modules.screening.scoring import (
    DASS21_MULTIPLIER,
    SUBSCALES,
    band_for,
    item_number,
    score_dass21,
)


def test_subscale_allocation_covers_all_21_items_exactly_once():
    allocated = sorted(n for items in SUBSCALES.values() for n in items)
    assert allocated == list(range(1, 22))
    assert all(len(items) == 7 for items in SUBSCALES.values())


def test_item_number_parses_and_rejects():
    assert item_number("dass-13") == 13
    assert item_number("dass-1") == 1
    assert item_number("dass-21") == 21
    assert item_number("dass-22") is None       # outside the instrument
    assert item_number("dass-0") is None
    assert item_number("phq-9") is None         # a different instrument
    assert item_number("nonsense") is None


@pytest.mark.parametrize(
    "subscale,raw,expected",
    [
        # Published DASS-21 cut-offs, applied to the doubled score.
        ("depression", 0, "normal"),
        ("depression", 9, "normal"),
        ("depression", 10, "mild"),
        ("depression", 13, "mild"),
        ("depression", 14, "moderate"),
        ("depression", 20, "moderate"),
        ("depression", 21, "severe"),
        ("depression", 27, "severe"),
        ("depression", 28, "extremely severe"),
        ("anxiety", 7, "normal"),
        ("anxiety", 8, "mild"),
        ("anxiety", 10, "moderate"),
        ("anxiety", 15, "severe"),
        ("anxiety", 20, "extremely severe"),
        ("stress", 14, "normal"),
        ("stress", 15, "mild"),
        ("stress", 19, "moderate"),
        ("stress", 26, "severe"),
        ("stress", 34, "extremely severe"),
    ],
)
def test_band_boundaries(subscale, raw, expected):
    assert band_for(subscale, raw) == expected


def test_all_zeros_is_normal_across_every_subscale():
    answers = {f"dass-{n}": 0 for n in range(1, 22)}
    scores = {s.subscale: s for s in score_dass21(answers)}
    assert len(scores) == 3
    for score in scores.values():
        assert score.raw == 0
        assert score.severity_band == "normal"
        assert score.is_complete


def test_all_threes_is_extremely_severe_and_doubles_correctly():
    answers = {f"dass-{n}": 3 for n in range(1, 22)}
    scores = {s.subscale: s for s in score_dass21(answers)}
    for score in scores.values():
        # 7 items x 3 x 2 = 42
        assert score.raw == 7 * 3 * DASS21_MULTIPLIER == 42
        assert score.severity_band == "extremely severe"


def test_only_the_owning_subscale_moves():
    """Item 13 is Depression. Scoring it must not touch anxiety or stress."""
    scores = {s.subscale: s for s in score_dass21({"dass-13": 3})}
    assert scores["depression"].raw == 6
    assert scores["anxiety"].raw == 0
    assert scores["stress"].raw == 0
    assert scores["depression"].items_answered == 1
    assert not scores["depression"].is_complete


def test_partial_instrument_scores_but_is_flagged_incomplete():
    """The three items the prototype shipped with are all Depression."""
    scores = {
        s.subscale: s
        for s in score_dass21({"dass-3": 2, "dass-5": 1, "dass-10": 3})
    }
    assert scores["depression"].raw == (2 + 1 + 3) * DASS21_MULTIPLIER == 12
    assert scores["depression"].items_answered == 3
    assert scores["depression"].items_expected == 7
    assert not scores["depression"].is_complete
    # An unanswered subscale must not read as a healthy one by default --
    # items_answered is what distinguishes 0-because-well from 0-because-absent.
    assert scores["anxiety"].items_answered == 0
    assert scores["anxiety"].raw == 0


def test_unknown_item_ids_are_ignored_not_counted():
    scores = {s.subscale: s for s in score_dass21({"phq-9": 3, "dass-99": 3})}
    assert all(s.items_answered == 0 for s in scores.values())
