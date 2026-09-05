import re
from dataclasses import dataclass


@dataclass(frozen=True)
class LexiconResult:
    tier: int
    reason_code: str


CRISIS_PATTERNS = [
    (
        r"\bkill myself\b|\bsuicide\b|\bend my life\b|\bdie by suicide\b",
        "self_harm_explicit",
    ),
    (
        r"\bi want to die\b|\bi wanna die\b|\bwant to be dead\b",
        "self_harm_want_die",
    ),
    (
        r"\bi will kill myself\b"
        r"|\bi am going to kill myself\b"
        r"|\bgoing to end my life\b",
        "self_harm_imminent",
    ),
    (
        r"\bmarna chahta\b"
        r"|\bmarna chahti\b"
        r"|\bkhud ko maar\b"
        r"|\bjaan dena\b"
        r"|\bzindagi khatam\b",
        "self_harm_hinglish",
    ),
    (
        # No \b here: Python's regex word boundary requires a word-character
        # transition, and Bengali dependent vowel signs (matras) are Unicode
        # category Mc/Mn, not "word" characters -- \b anchored right after
        # one (as every one of these phrases ends) can never match at all.
        # checkins/signals.py already avoids \b for this exact reason; this
        # file just hadn't followed that convention. Confirmed by test.
        r"আত্মহত্যা"
        r"|মরে যেতে চাই"
        r"|নিজেকে মেরে"
        r"|জীবন শেষ করতে চাই",
        "self_harm_bengali",
    ),
]


HIGH_RISK_PATTERNS = [
    (
        r"\bhurt myself\b"
        r"|\bcut myself\b"
        r"|\boverdose\b"
        r"|\bself harm\b"
        r"|\bself-harm\b",
        "self_harm_nonexplicit",
    ),
    (
        r"\bcan't keep myself safe\b"
        r"|\bnot safe with myself\b"
        r"|\bunsafe with myself\b",
        "unsafe_self",
    ),
    (
        r"\bkhud ko nuksan\b"
        r"|\bkhud ko hurt\b"
        r"|\bkhud ko harm\b",
        "self_harm_hinglish",
    ),
]


REVIEW_PATTERNS = [
    (
        r"\bhopeless\b"
        r"|\bno reason to live\b"
        r"|\bworthless\b",
        "hopelessness",
    ),
    (
        r"\bmar jaana\b"
        r"|\bmar jaunga\b"
        r"|\bmar jaungi\b"
        r"|\bjeene ka mann nahi\b",
        "self_harm_ambiguous",
    ),
    (
        r"মরে যেতে ইচ্ছে"
        r"|বাঁচতে ইচ্ছে করছে না",
        "self_harm_bengali_ambiguous",
    ),
]


def classify(text: str) -> LexiconResult:
    normalized = re.sub(
        r"\s+",
        " ",
        text.lower(),
    ).strip()

    for pattern, reason in CRISIS_PATTERNS:
        if re.search(pattern, normalized):
            return LexiconResult(
                tier=3,
                reason_code=reason,
            )

    for pattern, reason in HIGH_RISK_PATTERNS:
        if re.search(pattern, normalized):
            return LexiconResult(
                tier=2,
                reason_code=reason,
            )

    for pattern, reason in REVIEW_PATTERNS:
        if re.search(pattern, normalized):
            return LexiconResult(
                tier=1,
                reason_code=reason,
            )

    return LexiconResult(
        tier=0,
        reason_code="none",
    )