"""Conversational SIGNAL: topic reuse from check-ins, and the deterministic
sleep-hours extractor. No LLM involved -- these are pure functions."""

import pytest

from app.agents.signal_extraction import extract_from_message, extract_sleep_hours


@pytest.mark.parametrize(
    "text,expected",
    [
        ("I only slept 4 hours last night", 4.0),
        ("slept for about 6.5 hours", 6.5),
        ("I got 8 hours of sleep", 8.0),
        ("only 3 hrs sleep and I have an exam", 3.0),
    ],
)
def test_sleep_hours_extracted_when_clearly_stated(text, expected):
    assert extract_sleep_hours(text) == expected


@pytest.mark.parametrize(
    "text",
    [
        "I have 4 assignments due tomorrow",  # a number, but not sleep
        "I've read 4 chapters",
        "it's 4 o'clock and I can't sleep",  # sleep word present, but no hours near a number
        "",
    ],
)
def test_sleep_hours_not_guessed_from_unrelated_numbers(text):
    assert extract_sleep_hours(text) is None


@pytest.mark.parametrize("hours", [-1, 17, 100])
def test_implausible_sleep_hours_are_discarded(hours):
    # A wrong number recorded as fact is worse than a missed one.
    assert extract_sleep_hours(f"I slept {hours} hours") is None


def test_topic_patterns_are_the_same_ones_checkins_use():
    """Reused, not reimplemented -- a second copy of this list would drift."""
    from app.modules.checkins.signals import NOTE_PATTERNS

    signals = extract_from_message("I'm so ghabrahat about my exam tomorrow")
    kinds = {s.kind for s in signals}
    assert "anxiety_language" in kinds
    assert "exam_pressure" in kinds
    assert set(NOTE_PATTERNS) >= kinds


def test_every_extracted_signal_is_marked_as_conversation_sourced():
    signals = extract_from_message("I slept 4 hours and feel so lonely")
    assert signals
    assert all(s.source == "conversation" for s in signals)


def test_empty_message_extracts_nothing():
    assert extract_from_message("") == []
    assert extract_from_message("   ") == []


def test_ordinary_message_with_no_signal_extracts_nothing():
    assert extract_from_message("What time does the library close today?") == []


def test_sleep_number_and_topic_mention_both_extracted_together():
    signals = extract_from_message("only slept 4 hours because of the exam tomorrow")
    kinds_and_sources = {(s.kind, s.source): s.value for s in signals}
    assert kinds_and_sources[("sleep", "conversation")] == {"unit": "hours", "value": 4.0}
    assert ("exam_pressure", "conversation") in kinds_and_sources
