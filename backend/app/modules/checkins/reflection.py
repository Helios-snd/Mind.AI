"""The acknowledgement shown after a check-in.

Ported verbatim from the prototype fixture `today/reflect.ts` -- same five
rules, same priority order, same i18n keys -- so the screen reads exactly as it
did while the source of truth moves to the server.

Returning i18n keys rather than prose keeps every user-facing string in
src/i18n and leaves the two dictionaries as the single place translations live.
The Talk slice replaces this rule engine with COMPANION, which will return free
text; the response contract already has room for both.

Deliberately not using energy or social yet. They are collected and stored from
this slice on, but adding reflection branches for them would mean new copy in
both languages, and this slice is about moving ownership, not changing what the
student reads.
"""

import re
from dataclasses import dataclass
from decimal import Decimal

EXAM_HINTS = (
    re.compile(r"\bexams?\b", re.I),
    re.compile(r"\bviva\b", re.I),
    re.compile(r"\bresults?\b", re.I),
    re.compile(r"\bassignments?\b", re.I),
    re.compile(r"\bdeadlines?\b", re.I),
    re.compile("পরীক্ষা"),
    re.compile("পড়া"),
)

LOW_SLEEP_HOURS = Decimal("5")


@dataclass(frozen=True)
class Reflection:
    ack_key: str
    suggestion_title_key: str | None = None
    suggestion_body_key: str | None = None


def reflect(mood: int, sleep_hours: Decimal, note: str) -> Reflection:
    """First match wins, in this order."""
    if note and any(pattern.search(note) for pattern in EXAM_HINTS):
        return Reflection(
            "today.ack.exam",
            "today.suggest.reframe.title",
            "today.suggest.reframe.body",
        )

    # `> 0` matters: zero means "less than an hour", which the slider can
    # produce, and the original fixture deliberately did not treat it as a
    # short night.
    if Decimal(0) < sleep_hours < LOW_SLEEP_HOURS:
        return Reflection(
            "today.ack.lowSleep",
            "today.suggest.sleep.title",
            "today.suggest.sleep.body",
        )

    if mood <= 2:
        return Reflection(
            "today.ack.lowMood",
            "today.suggest.activation.title",
            "today.suggest.activation.body",
        )

    if mood == 3:
        return Reflection(
            "today.ack.midMood",
            "today.suggest.grounding.title",
            "today.suggest.grounding.body",
        )

    return Reflection("today.ack.goodMood")
