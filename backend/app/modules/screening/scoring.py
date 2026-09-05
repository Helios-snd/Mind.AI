"""DASS-21 scoring.

Public-domain instrument (Lovibond & Lovibond, 1995). Item ids match the
published numbering used in src/content/instruments.ts.

Nothing here is shown to a student. The output is for the counsellor brief and
for TREND's baseline. Hard constraint 1: the system never diagnoses -- a
severity band is an instrument reading, not a diagnosis, and it never reaches
the app UI.
"""

from dataclasses import dataclass

# Published DASS-21 subscale allocation.
SUBSCALES: dict[str, tuple[int, ...]] = {
    "depression": (3, 5, 10, 13, 16, 17, 21),
    "anxiety": (2, 4, 7, 9, 15, 19, 20),
    "stress": (1, 6, 8, 11, 12, 14, 18),
}

# Published cut-offs, applied to the doubled score. Upper bound inclusive;
# the last band is open-ended.
BANDS: dict[str, tuple[tuple[int, str], ...]] = {
    "depression": ((9, "normal"), (13, "mild"), (20, "moderate"), (27, "severe")),
    "anxiety": ((7, "normal"), (9, "mild"), (14, "moderate"), (19, "severe")),
    "stress": ((14, "normal"), (18, "mild"), (25, "moderate"), (33, "severe")),
}

EXTREME = "extremely severe"

# The DASS-21 is a doubled short form of the DASS-42; raw subscale sums are
# multiplied by two so published DASS-42 cut-offs apply.
DASS21_MULTIPLIER = 2


@dataclass(frozen=True)
class SubscaleScore:
    subscale: str
    raw: int
    severity_band: str
    items_answered: int
    items_expected: int

    @property
    def is_complete(self) -> bool:
        return self.items_answered == self.items_expected


def band_for(subscale: str, raw: int) -> str:
    for upper, name in BANDS[subscale]:
        if raw <= upper:
            return name
    return EXTREME


def item_number(item_id: str) -> int | None:
    """"dass-13" -> 13. None for anything that is not a DASS-21 item id."""
    prefix, _, tail = item_id.partition("-")
    if prefix != "dass" or not tail.isdigit():
        return None
    number = int(tail)
    return number if 1 <= number <= 21 else None


def score_dass21(answers: dict[str, int]) -> list[SubscaleScore]:
    """Score a set of {item_id: 0..3} answers.

    A partial instrument still scores -- onboarding can be abandoned midway and
    the brief is more useful with something than nothing -- but items_answered
    is carried through so an incomplete subscale is never presented as a
    complete one.
    """
    by_number = {
        number: value
        for item_id, value in answers.items()
        if (number := item_number(item_id)) is not None
    }

    scores: list[SubscaleScore] = []
    for subscale, items in SUBSCALES.items():
        present = [by_number[n] for n in items if n in by_number]
        raw = sum(present) * DASS21_MULTIPLIER
        scores.append(
            SubscaleScore(
                subscale=subscale,
                raw=raw,
                severity_band=band_for(subscale, raw),
                items_answered=len(present),
                items_expected=len(items),
            )
        )
    return scores
