"""Validators shared with the frontend.

phone_looks_valid is a direct port of phoneLooksValid in
src/components/formFields.tsx. The rule lives in two languages, so it is
written once here rather than reinvented per module.
"""

import re

_PHONE_STRIP = re.compile(r"[\s-]")
_PHONE_SHAPE = re.compile(r"^(\+?91)?\d{10}$")


def normalise_phone(raw: str) -> str:
    return _PHONE_STRIP.sub("", raw or "")


def phone_looks_valid(raw: str) -> bool:
    return bool(_PHONE_SHAPE.match(normalise_phone(raw)))


def normalise_email(raw: str) -> str:
    return (raw or "").strip().lower()


def is_email(destination: str) -> bool:
    return "@" in destination
