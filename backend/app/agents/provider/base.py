from abc import ABC, abstractmethod
from collections.abc import AsyncIterator, Sequence
from dataclasses import dataclass


@dataclass(frozen=True)
class ChatMessage:
    role: str
    content: str


class LLMProvider(ABC):
    @abstractmethod
    async def stream_chat(
        self,
        messages: Sequence[ChatMessage],
        *,
        temperature: float = 0.3,
    ) -> AsyncIterator[str]:
        raise NotImplementedError

    @abstractmethod
    async def complete(
        self,
        messages: Sequence[ChatMessage],
        *,
        temperature: float = 0.0,
        think: bool = True,
    ) -> str:
        """`think` lets a caller that only wants a short structured verdict
        (the Safety classifier) opt out of extended reasoning -- a hybrid
        thinking model otherwise spends most of its latency budget on a
        chain-of-thought nobody reads. Implementations that always think
        (or never do) may ignore it."""
        raise NotImplementedError