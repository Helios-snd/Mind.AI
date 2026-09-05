"""SIGNAL extraction.

Produces a record, not an interpretation. Two origins, and the distinction is
load-bearing:

  structured   the student's own scale answers, carried through verbatim.
               Authoritative. Nothing downstream may overwrite these.
  note         contextual observations read out of the free-text note.
               Additive only -- a note can never change a reported value.

Deterministic by design in this slice. The patterns below are ported from the
prototype's fixtures (`today/reflect.ts`, `talk/replies.ts`), which already
carry an English / Bengali / romanised-Bengali corpus. A model-backed extractor
arrives with the Talk slice and will sit alongside this, never in place of the
structured half.

It does not diagnose. "exam_pressure" is a topic the student raised, not a
finding about them.
"""

import re
from dataclasses import dataclass
from decimal import Decimal

# Ported from EXAM_HINTS in src/app/(app)/today/reflect.ts.
NOTE_PATTERNS: dict[str, tuple[re.Pattern[str], ...]] = {
    "exam_pressure": (
        re.compile(r"\bexams?\b", re.I),
        re.compile(r"\bviva\b", re.I),
        re.compile(r"\bresults?\b", re.I),
        re.compile(r"\bassignments?\b", re.I),
        re.compile(r"\bdeadlines?\b", re.I),
        re.compile(r"\bsemester\b", re.I),
        re.compile(r"\bsubmission\b", re.I),
        re.compile("পরীক্ষা"),
        re.compile("পড়া"),
        re.compile("রেজাল্ট"),
    ),
    "sleep_mention": (
        # "slept" is the commonest form in a note ("barely slept", "slept
        # badly"), so matching only the bare stem misses most real mentions.
        re.compile(r"\bslee\w*|\bslept\b|\binsomnia\b|\bawake\b|\bexhaust", re.I),
        re.compile(r"can'?t sleep|tired all", re.I),
        re.compile("ঘুম|নিদ্রা|ক্লান্ত"),
    ),
    "social_withdrawal": (
        re.compile(r"\blonely\b|\balone\b|\bisolated\b|left out", re.I),
        re.compile(r"no one|nobody", re.I),
        re.compile("একা|নিঃসঙ্গ|কেউ নেই"),
    ),
    "somatic": (
        re.compile(r"\bchest\b|\bbreath|palpitation|heart (is )?racing", re.I),
        re.compile(r"\bbuke\b", re.I),
        re.compile("বুকে|শ্বাস|হৃৎ|ধড়ফড়"),
    ),
    "anxiety_language": (
        re.compile(r"ghabra|ghabrahat|bechain|becheni", re.I),
        re.compile(r"\banxious\b|\banxiety\b|\bnervous\b|\bpanic\b|on edge", re.I),
        re.compile("ঘাবড়|বেচেন|উদ্বেগ|অস্থির|টেনশন"),
    ),
    "appetite_mention": (
        re.compile(r"\bappetite\b|not eating|skipped? meals?|didn'?t eat", re.I),
        re.compile("খাওয়া|খিদে"),
    ),
}


@dataclass(frozen=True)
class ExtractedSignal:
    kind: str
    source: str
    value: dict


def from_structured(
    mood: int,
    sleep_hours: Decimal,
    energy: int | None,
    social: int | None,
    appetite: int | None = None,
    activity: int | None = None,
) -> list[ExtractedSignal]:
    """The student's own answers, verbatim.

    Values are copied, never inferred or adjusted. A skipped scale produces no
    signal at all rather than a zero -- absent and "none of it" are different
    facts.
    """
    signals = [
        ExtractedSignal("mood", "structured", {"scale": 5, "value": mood}),
        ExtractedSignal(
            "sleep", "structured", {"unit": "hours", "value": float(sleep_hours)}
        ),
    ]
    if energy is not None:
        signals.append(
            ExtractedSignal("energy", "structured", {"scale": 5, "value": energy})
        )
    if social is not None:
        signals.append(
            ExtractedSignal("social", "structured", {"scale": 5, "value": social})
        )
    if appetite is not None:
        signals.append(
            ExtractedSignal("appetite", "structured", {"scale": 5, "value": appetite})
        )
    if activity is not None:
        signals.append(
            ExtractedSignal("activity", "structured", {"scale": 5, "value": activity})
        )
    return signals


def from_note(note: str) -> list[ExtractedSignal]:
    """Topics the student raised, as observations rather than conclusions.

    Records that a subject came up and nothing more -- no severity, no
    direction, no reading of how they feel about it.
    """
    text = (note or "").strip()
    if not text:
        return []

    return [
        ExtractedSignal(kind, "note", {"mentioned": True})
        for kind, patterns in NOTE_PATTERNS.items()
        if any(pattern.search(text) for pattern in patterns)
    ]


def extract(
    mood: int,
    sleep_hours: Decimal,
    energy: int | None,
    social: int | None,
    note: str,
    appetite: int | None = None,
    activity: int | None = None,
) -> list[ExtractedSignal]:
    return from_structured(
        mood, sleep_hours, energy, social, appetite, activity
    ) + from_note(note)
