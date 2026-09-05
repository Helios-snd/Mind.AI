"""Test doubles for the agent layer.

A FakeProvider lets talk-pipeline tests exercise the real orchestration code
(persistence, safety-vs-companion parallelism, tier suppression, error
handling) without a live Ollama server -- deterministic, fast, and able to
simulate failures a real model can't be reliably coaxed into on demand.
"""

import asyncio
import json
from collections.abc import AsyncIterator, Sequence

from app.agents.provider.base import ChatMessage, LLMProvider


class FakeProvider(LLMProvider):
    """Every call is recorded, so a test can assert what Companion/Safety
    were actually shown, not just what came back."""

    def __init__(
        self,
        *,
        companion_tokens: list[str] | None = None,
        classifier_response: dict | None = None,
        raise_on_stream: Exception | None = None,
        raise_on_complete: Exception | None = None,
        stream_delay: float = 0.0,
        complete_delay: float = 0.0,
    ) -> None:
        self.companion_tokens = companion_tokens or ["Okay", ", ", "let's", " look at that."]
        self.classifier_response = classifier_response or {
            "tier": 0,
            "reason_code": "none",
            "confidence": 0.9,
        }
        self.raise_on_stream = raise_on_stream
        self.raise_on_complete = raise_on_complete
        self.stream_delay = stream_delay
        self.complete_delay = complete_delay

        self.stream_calls: list[Sequence[ChatMessage]] = []
        self.complete_calls: list[Sequence[ChatMessage]] = []

    async def stream_chat(
        self, messages: Sequence[ChatMessage], *, temperature: float = 0.3
    ) -> AsyncIterator[str]:
        self.stream_calls.append(list(messages))
        if self.stream_delay:
            await asyncio.sleep(self.stream_delay)
        if self.raise_on_stream:
            raise self.raise_on_stream
        for token in self.companion_tokens:
            yield token

    async def complete(
        self,
        messages: Sequence[ChatMessage],
        *,
        temperature: float = 0.0,
        think: bool = True,
    ) -> str:
        self.complete_calls.append(list(messages))
        if self.complete_delay:
            await asyncio.sleep(self.complete_delay)
        if self.raise_on_complete:
            raise self.raise_on_complete
        return json.dumps(self.classifier_response)


async def collect_sse(generator: AsyncIterator[str]) -> list[dict]:
    """Parses the `sse()` wire format back into a list of {event, data} dicts,
    the same shape a real EventSource-consuming client would reconstruct."""
    events: list[dict] = []
    event_name: str | None = None
    async for chunk in generator:
        for line in chunk.split("\n"):
            if line.startswith("event: "):
                event_name = line[len("event: ") :]
            elif line.startswith("data: "):
                events.append({"event": event_name, "data": json.loads(line[len("data: ") :])})
    return events
