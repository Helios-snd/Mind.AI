"""The deterministic 3A/3B gate: means/plan/timeframe language -> imminent."""

import pytest

from app.agents.safety import imminence


@pytest.mark.parametrize(
    "text",
    [
        "I want to kill myself, I have the pills",
        "I'm going to hang myself",
        "I have a rope ready",
        "mere paas goli hai",
        "আমার কাছে ওষুধ আছে",
    ],
)
def test_named_means_is_imminent(text):
    result = imminence.classify(text)
    assert result.is_imminent is True


@pytest.mark.parametrize(
    "text",
    [
        "I've decided, I'm going to do it",
        "I already have a plan",
        "maine soch liya hai",
        "আমি ঠিক করে ফেলেছি",
    ],
)
def test_an_explicit_plan_is_imminent(text):
    assert imminence.classify(text).is_imminent is True


@pytest.mark.parametrize(
    "text",
    [
        "I'm doing it tonight",
        "right now, I can't wait any longer",
        "aaj raat ko",
        "আজ রাতে",
    ],
)
def test_a_stated_timeframe_is_imminent(text):
    assert imminence.classify(text).is_imminent is True


@pytest.mark.parametrize(
    "text",
    [
        "I want to kill myself",
        "I don't want to be here anymore",
        "everything feels hopeless and I don't see the point",
    ],
)
def test_ordinary_crisis_language_without_a_marker_is_not_imminent(text):
    result = imminence.classify(text)
    assert result.is_imminent is False
    assert result.reason_code == "no_imminent_marker"


def test_is_case_and_whitespace_insensitive():
    assert imminence.classify("I HAVE   THE PILLS").is_imminent is True
