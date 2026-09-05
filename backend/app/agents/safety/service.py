import asyncio
from dataclasses import dataclass

from app.agents.provider.base import ChatMessage, LLMProvider
from app.agents.safety.classifier import classify as classify_llm
from app.agents.safety import imminence
from app.agents.safety.lexicon import classify as classify_lexicon
from app.core.config import settings


@dataclass(frozen=True)
class SafetyResult:
    lexicon_tier: int
    classifier_tier: int
    tier: int
    reason_code: str
    confidence: float
    model: str
    # "3a" | "3b" | None -- None below tier 3. See imminence.py: a
    # deterministic gate, not a second model call, decides this.
    tier3_kind: str | None


async def assess(
    provider: LLMProvider,
    text: str,
    recent_history: list[ChatMessage],
) -> SafetyResult:

    lexicon = classify_lexicon(text)

    classifier_task = asyncio.create_task(
        classify_llm(
            provider,
            text,
            recent_history,
        )
    )

    try:
        (
            classifier_tier,
            classifier_reason,
            confidence,
        ) = await asyncio.wait_for(
            classifier_task,
            timeout=settings.safety_timeout_seconds,
        )

    except Exception:
        classifier_tier = 3
        classifier_reason = "classifier_timeout_or_error"
        confidence = 0.0

    tier = max(
        lexicon.tier,
        classifier_tier,
    )

    if lexicon.tier >= classifier_tier:
        reason_code = lexicon.reason_code
    else:
        reason_code = classifier_reason

    tier3_kind = None
    if tier >= 3:
        result = imminence.classify(text)
        tier3_kind = "3b" if result.is_imminent else "3a"

    return SafetyResult(
        lexicon_tier=lexicon.tier,
        classifier_tier=classifier_tier,
        tier=tier,
        reason_code=reason_code,
        confidence=confidence,
        model=settings.llm_model,
        tier3_kind=tier3_kind,
    )