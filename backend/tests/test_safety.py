"""SAFETY: the deterministic lexicon, the classifier's JSON contract, and the
independent-assessment service that combines them.

Hard requirement under test throughout: a lexicon hit cannot be talked down by
the classifier, and a classifier failure fails closed to the most severe tier,
never to "safe by default".
"""

import asyncio

import pytest

from app.agents.provider.base import ChatMessage
from app.agents.safety import classifier, lexicon
from app.agents.safety.service import assess
from tests.fakes import FakeProvider


# --- lexicon: deterministic, cannot be argued out of a tier ------------------


@pytest.mark.parametrize(
    "text",
    [
        "I want to kill myself",
        "I am going to end my life tonight",
        "I will kill myself",
        "marna chahta hoon",
        "আত্মহত্যা করতে চাই",
    ],
)
def test_lexicon_fires_tier_3_on_explicit_crisis_language(text):
    result = lexicon.classify(text)
    assert result.tier == 3


@pytest.mark.parametrize(
    "text",
    ["I want to hurt myself", "I can't keep myself safe right now", "khud ko harm karna"],
)
def test_lexicon_fires_tier_2_on_high_risk_language(text):
    assert lexicon.classify(text).tier == 2


def test_lexicon_fires_tier_1_on_ambiguous_hopelessness():
    assert lexicon.classify("everything feels hopeless").tier == 1


def test_lexicon_is_silent_on_ordinary_distress():
    result = lexicon.classify("I'm really stressed about my exam tomorrow")
    assert result.tier == 0
    assert result.reason_code == "none"


def test_lexicon_is_case_and_whitespace_insensitive():
    assert lexicon.classify("I WANT   TO    KILL MYSELF").tier == 3


# --- classifier: the LLM's JSON contract, parsed defensively ----------------


async def test_classifier_parses_a_well_formed_response():
    provider = FakeProvider(
        classifier_response={"tier": 2, "reason_code": "self_harm_concern", "confidence": 0.7}
    )
    tier, reason, confidence = await classifier.classify(provider, "some text", [])
    assert (tier, reason, confidence) == (2, "self_harm_concern", 0.7)


async def test_classifier_clamps_an_out_of_range_tier():
    provider = FakeProvider(classifier_response={"tier": 9, "reason_code": "x", "confidence": 5})
    tier, _, confidence = await classifier.classify(provider, "text", [])
    assert tier == 3  # clamped to the valid ceiling
    assert confidence == 1.0  # clamped to the valid ceiling


async def test_classifier_fails_closed_on_malformed_json():
    provider = FakeProvider()
    provider.classifier_response = None  # forces complete() to return "null"
    tier, reason, confidence = await classifier.classify(provider, "text", [])
    assert tier == 3
    assert reason == "classifier_error"
    assert confidence == 0.0


async def test_classifier_fails_closed_when_the_provider_raises():
    provider = FakeProvider(raise_on_complete=RuntimeError("model unreachable"))
    tier, reason, confidence = await classifier.classify(provider, "text", [])
    assert tier == 3
    assert reason == "classifier_error"


async def test_classifier_uses_only_the_last_8_turns_of_history():
    provider = FakeProvider()
    long_history = [ChatMessage(role="user", content=f"turn {i}") for i in range(20)]
    await classifier.classify(provider, "latest", long_history)

    sent = provider.complete_calls[0]
    # system prompt + last 8 history turns + the latest message
    assert len(sent) == 1 + 8 + 1
    assert sent[-1].content == "latest"
    assert sent[-2].content == "turn 19"


# --- service: lexicon and classifier combined, worst tier wins --------------


async def test_tier_is_the_maximum_of_lexicon_and_classifier():
    # Lexicon sees nothing; classifier alone raises the alarm.
    provider = FakeProvider(classifier_response={"tier": 2, "reason_code": "clf", "confidence": 0.6})
    result = await assess(provider, "I'm having a rough week", [])
    assert result.lexicon_tier == 0
    assert result.classifier_tier == 2
    assert result.tier == 2
    assert result.reason_code == "clf"


async def test_a_lexicon_hit_wins_even_when_the_classifier_disagrees():
    """The classifier cannot talk the system out of an explicit phrase --
    this is the actual architectural point of running both."""
    provider = FakeProvider(
        classifier_response={"tier": 0, "reason_code": "none", "confidence": 0.9}
    )
    result = await assess(provider, "I want to kill myself", [])
    assert result.tier == 3
    assert result.lexicon_tier == 3
    assert result.reason_code != "none"  # the lexicon's reason, not the classifier's


async def test_a_tie_prefers_the_lexicons_reason_code():
    provider = FakeProvider(
        classifier_response={"tier": 1, "reason_code": "classifier_says_this", "confidence": 0.5}
    )
    result = await assess(provider, "everything feels hopeless", [])
    assert result.tier == 1
    assert result.reason_code == "hopelessness"  # the lexicon's code, not the classifier's


async def test_classifier_timeout_fails_closed_to_tier_3_not_to_safe(monkeypatch):
    """The one property that matters most: a hung classifier must never be
    silently treated as a clean bill of health."""
    monkeypatch.setattr("app.core.config.settings.safety_timeout_seconds", 0.05)

    async def never_returns(*args, **kwargs):
        await asyncio.sleep(10)
        return 0, "none", 1.0

    provider = FakeProvider()
    monkeypatch.setattr("app.agents.safety.service.classify_llm", never_returns)

    result = await assess(provider, "an ordinary message", [])
    assert result.classifier_tier == 3
    assert result.reason_code == "classifier_timeout_or_error"
    assert result.tier == 3


async def test_model_name_is_recorded_on_every_assessment():
    provider = FakeProvider()
    result = await assess(provider, "hi", [])
    assert result.model  # the configured LLM_MODEL, not blank


# --- the 3A/3B gate, wired into assess() -------------------------------------


async def test_tier3_kind_is_none_below_tier_3():
    provider = FakeProvider(
        classifier_response={"tier": 2, "reason_code": "concern", "confidence": 0.6}
    )
    result = await assess(provider, "I'm having a rough week", [])
    assert result.tier == 2
    assert result.tier3_kind is None


async def test_tier3_kind_is_3a_for_ordinary_crisis_language():
    # Lexicon fires tier 3 on its own; no means/plan/timeframe marker present.
    result = await assess(FakeProvider(), "I want to kill myself", [])
    assert result.tier == 3
    assert result.tier3_kind == "3a"


async def test_tier3_kind_is_3b_when_a_means_is_named():
    result = await assess(
        FakeProvider(), "I want to kill myself, I have the pills", []
    )
    assert result.tier == 3
    assert result.tier3_kind == "3b"


async def test_tier3_kind_is_3b_even_when_only_the_classifier_reaches_tier_3():
    provider = FakeProvider(
        classifier_response={"tier": 3, "reason_code": "clf", "confidence": 0.8}
    )
    # No lexicon hit at all -- the classifier alone decides tier 3, and the
    # gate still runs against the raw text for imminence.
    result = await assess(provider, "I'm doing it tonight", [])
    assert result.tier == 3
    assert result.tier3_kind == "3b"


@pytest.mark.parametrize(
    "text",
    [
        "আমি মরে যেতে চাই",
        "আমি নিজেকে মেরে ফেলব",
        "আমার জীবন শেষ করতে চাই",
    ],
)
def test_lexicon_matches_every_bengali_crisis_phrase_in_a_full_sentence(text):
    """Each of these previously failed silently because \\b cannot match
    immediately after a Bengali dependent vowel sign -- verified for every
    phrase in the tier, not just one, since the bug was pattern-specific."""
    assert lexicon.classify(text).tier == 3


@pytest.mark.parametrize(
    "text",
    [
        "মরে যেতে ইচ্ছে করছে",
        "বাঁচতে ইচ্ছে করছে না আজকাল",
    ],
)
def test_lexicon_matches_bengali_ambiguous_phrases_in_a_full_sentence(text):
    assert lexicon.classify(text).tier == 1
