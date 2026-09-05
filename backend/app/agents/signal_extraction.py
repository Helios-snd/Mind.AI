"""SIGNAL, extended to Talk.

Reuses the same topic-mention patterns and the same ExtractedSignal shape as
today's check-in note extraction (app.modules.checkins.signals) -- a subject
raised in conversation is the same kind of fact as one raised in a check-in
note, and duplicating the pattern list would let the two drift apart.

One addition specific to conversation: a deterministic sleep-hours extractor,
because a student typing "I only slept 4 hours" is reporting a number, not
just raising a topic, and that number is worth capturing the same way a
check-in's own sleep slider is.

Two things this deliberately does NOT do:

  * It does not feed Trends. Trends' four series come only from the
    checkins table, where every value came from a dedicated scale control the
    student explicitly set. A number typed in the middle of a sentence is a
    different reliability tier -- worth recording, not worth quietly blending
    into a series whose whole point is "the values the student explicitly
    reported on a control built for that purpose". Wiring conversational
    signals into Trends is a deliberate future decision, not a side effect of
    this module existing.
  * It does not call the LLM. Companion already reads the raw message
    directly; asking a second model call to also extract structured facts
    would add latency, cost, and hallucination risk for exactly the kind of
    literal pattern-matching a regex already does reliably.
"""

import re
from dataclasses import dataclass

from app.modules.checkins.signals import NOTE_PATTERNS

# Reasonable range for a self-reported night's sleep. Outside this, the
# number almost certainly refers to something else in the sentence (a page
# count, a time of day, an exam attempt) and is discarded rather than guessed.
MIN_PLAUSIBLE_SLEEP_HOURS = 0.0
MAX_PLAUSIBLE_SLEEP_HOURS = 16.0

# A number and a sleep word within a short span of each other, in either
# order ("slept 4 hours" / "4 hours of sleep"). The bounded gap keeps this
# from matching an unrelated number elsewhere in a longer message.
#
# The lookbehind/lookahead pair matters more than it looks: without them,
# "100 hours" silently re-matches as "00" (the last two digits, once the
# 2-digit-greedy attempt against "10" fails because "0 hours" doesn't follow
# it) -- producing a confident, wrong 0.0 instead of correctly matching
# nothing. The same guard blocks "-1" from being read as a bare "1".
_NUMBER = r"(?<![\d-])(\d{1,2}(?:\.\d)?)(?!\d)"
_SLEEP_WORD = r"(?:sleep|slept|ঘুম)"
SLEEP_HOURS_PATTERNS = (
    re.compile(rf"\b{_SLEEP_WORD}\w*\b.{{0,15}}?{_NUMBER}\s*(?:hours?|hrs?|hr)\b", re.I),
    re.compile(rf"\b{_NUMBER}\s*(?:hours?|hrs?|hr)\b.{{0,15}}?{_SLEEP_WORD}", re.I),
)


@dataclass(frozen=True)
class ExtractedSignal:
    kind: str
    source: str
    value: dict


def extract_sleep_hours(text: str) -> float | None:
    """A confidently-stated number of hours slept, or None.

    Deliberately conservative: an ambiguous or out-of-range match is dropped
    rather than reported, because a wrong number recorded as fact is worse
    than a missed one -- the whole reason SIGNAL insists on determinism here.
    """
    for pattern in SLEEP_HOURS_PATTERNS:
        match = pattern.search(text)
        if not match:
            continue
        try:
            hours = float(match.group(1))
        except ValueError:
            continue
        if MIN_PLAUSIBLE_SLEEP_HOURS <= hours <= MAX_PLAUSIBLE_SLEEP_HOURS:
            return hours
    return None


def extract_from_message(text: str) -> list[ExtractedSignal]:
    """Everything SIGNAL can responsibly read out of one user message.

    `source="conversation"` throughout -- distinct from a check-in's
    "structured" (the student's own scale answer) and "note" (a check-in's
    free-text field), because a number typed mid-conversation is neither: it
    is real, but it did not come through a control built to collect it.
    """
    clean = (text or "").strip()
    if not clean:
        return []

    signals = [
        ExtractedSignal(kind, "conversation", {"mentioned": True})
        for kind, patterns in NOTE_PATTERNS.items()
        if any(pattern.search(clean) for pattern in patterns)
    ]

    sleep_hours = extract_sleep_hours(clean)
    if sleep_hours is not None:
        signals.append(
            ExtractedSignal(
                "sleep", "conversation", {"unit": "hours", "value": sleep_hours}
            )
        )

    return signals
