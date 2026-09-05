import json
import logging

from app.agents.provider.base import ChatMessage, LLMProvider
from app.core.logging import log_event


logger = logging.getLogger(__name__)


CLASSIFIER_PROMPT = """
You are an independent safety classifier.

Classify ONLY the student's latest message.

Do not provide a therapeutic response.

Return ONLY valid JSON:

{
  "tier": 0,
  "reason_code": "none",
  "confidence": 0.0
}

Allowed tiers:

0:
No meaningful safety signal.

1:
Ambiguous distress, hopelessness or concerning language that may need review.

2:
Self-harm concern or meaningful inability to stay safe,
without clear imminent intent.

3:
Explicit suicidal/self-harm intent, plan, imminent danger,
or immediate inability to stay safe.

Do not diagnose.

Do not infer intent unless supported by the text.

Use recent conversation context only to disambiguate the latest message.
"""


async def classify(
    provider: LLMProvider,
    latest_text: str,
    recent_history: list[ChatMessage],
) -> tuple[int, str, float]:

    messages = [
        ChatMessage(
            role="system",
            content=CLASSIFIER_PROMPT,
        ),
        *recent_history[-8:],
        ChatMessage(
            role="user",
            content=latest_text,
        ),
    ]

    try:
        # The whole body, not just the parsing -- a network failure calling
        # the model must fail closed exactly like a malformed response does.
        # service.assess() also wraps this call in a timeout, but a safety
        # function documented as "fail closed" should hold that guarantee on
        # its own, not only because a caller happens to add a second layer.
        raw = await provider.complete(
            messages,
            temperature=0.0,
            # The classifier only ever needs a one-line verdict -- a hybrid
            # thinking model's chain-of-thought is pure latency here, and is
            # what made this call blow safety_timeout_seconds in practice.
            think=False,
        )

        data = json.loads(raw)

        tier = int(data.get("tier", 3))
        tier = max(0, min(3, tier))

        reason = str(
            data.get(
                "reason_code",
                "classifier_review",
            )
        )[:80]

        confidence = float(
            data.get(
                "confidence",
                0.0,
            )
        )

        confidence = max(
            0.0,
            min(1.0, confidence),
        )

        return tier, reason, confidence

    except Exception as exc:
        # Fail closed -- but silently was the wrong instinct: a bare
        # "classifier_error" reason code with no trace of *why* (a 400 from
        # a strict provider validating the request schema, malformed JSON,
        # a network error) is nearly unfindable later. Never log the
        # message text itself, only the failure shape.
        log_event(
            logger,
            "safety.classifier_failed",
            error=type(exc).__name__,
            detail=str(exc)[:200],
        )
        return 3, "classifier_error", 0.0