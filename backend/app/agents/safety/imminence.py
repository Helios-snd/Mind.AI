"""The deterministic 3A/3B gate.

Only ever called once Safety has already decided a message is tier 3 (from
the lexicon or the classifier, in `service.py::assess`) -- this makes no tier
decision of its own. Its only job is imminence: does an already-crisis
message also name a method, a plan, or a timeframe? Same shape as
`lexicon.py` next to it (plain regex, no LLM call) for the same reason that
one is deterministic: this distinction gates a countdown and a stubbed
real-world contact action (E3), so it has to be auditable, not a model's
one-off judgement.

Ambiguous or no match -> not imminent -> 3A. Never the other way around: a
message that mentions a method or a timeframe is 3B even if the classifier or
lexicon reason code alone wouldn't have suggested it, because a specific
means is the strongest signal an ideation has become a plan.
"""

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class ImminenceResult:
    is_imminent: bool
    reason_code: str


MEANS_PATTERNS = [
    (
        r"\bpills?\b"
        r"|\boverdose\b"
        r"|\brazor\b"
        r"|\bblade\b"
        r"|\brope\b"
        r"|\bgun\b"
        r"|\bhang(ing)? myself\b"
        r"|\bjump(ing)? off\b"
        r"|\bjump in front of\b",
        "imminent_means_named",
    ),
    (
        r"\bi have (the |a )?(pills|rope|blade|razor|gun)\b"
        r"|\bi('ve| have) got (the |a )?(pills|rope|blade|razor|gun)\b",
        "imminent_means_possession",
    ),
    (
        r"\bmere paas (goli|dawai|rassi|blade)\b",
        "imminent_means_hinglish",
    ),
    (
        r"আমার কাছে (ওষুধ|দড়ি|ব্লেড) আছে",
        "imminent_means_bengali",
    ),
]

PLAN_PATTERNS = [
    (
        r"\bi('ve| have) decided\b"
        r"|\bi have a plan\b"
        r"|\balready (have|got) a plan\b"
        r"|\bi'?m going to do it\b"
        r"|\bi know how i'?ll do it\b",
        "imminent_plan",
    ),
    (
        r"\bmaine soch liya hai\b"
        r"|\bplan bana liya\b"
        r"|\bkarne wala hoon\b",
        "imminent_plan_hinglish",
    ),
    (
        r"আমি ঠিক করে ফেলেছি"
        r"|পরিকল্পনা করে ফেলেছি",
        "imminent_plan_bengali",
    ),
]

TIMEFRAME_PATTERNS = [
    (
        r"\btonight\b"
        r"|\bright now\b"
        r"|\bin an hour\b"
        r"|\bthis weekend\b"
        r"|\bwhen i get home\b"
        r"|\bin a (few )?(minute|hour)s?\b",
        "imminent_timeframe",
    ),
    (
        r"\baaj raat\b"
        r"|\babhi(\s+hi)?\b"
        r"|\baaj hi\b",
        "imminent_timeframe_hinglish",
    ),
    (
        r"আজ রাতে"
        r"|এখনই"
        r"|আজই",
        "imminent_timeframe_bengali",
    ),
]


def classify(text: str) -> ImminenceResult:
    normalized = re.sub(
        r"\s+",
        " ",
        text.lower(),
    ).strip()

    for pattern, reason in MEANS_PATTERNS:
        if re.search(pattern, normalized):
            return ImminenceResult(is_imminent=True, reason_code=reason)

    for pattern, reason in PLAN_PATTERNS:
        if re.search(pattern, normalized):
            return ImminenceResult(is_imminent=True, reason_code=reason)

    for pattern, reason in TIMEFRAME_PATTERNS:
        if re.search(pattern, normalized):
            return ImminenceResult(is_imminent=True, reason_code=reason)

    return ImminenceResult(is_imminent=False, reason_code="no_imminent_marker")
