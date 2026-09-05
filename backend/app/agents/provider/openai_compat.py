import json
from collections.abc import AsyncIterator, Sequence

import httpx

from app.agents.provider.base import ChatMessage, LLMProvider
from app.core.config import settings


class OpenAICompatibleProvider(LLMProvider):
    """
    Works with Ollama, vLLM and other OpenAI-compatible local runtimes.
    """

    def __init__(
        self,
        base_url: str | None = None,
        model: str | None = None,
    ) -> None:
        self.base_url = (
            base_url or settings.llm_base_url
        ).rstrip("/")

        self.model = model or settings.llm_model

        if not self.base_url:
            raise RuntimeError("LLM_BASE_URL is not configured")

        if not self.model:
            raise RuntimeError("LLM_MODEL is not configured")

    def _payload(
        self,
        messages: Sequence[ChatMessage],
        *,
        temperature: float,
        stream: bool,
        max_tokens: int | None = None,
        json_mode: bool = False,
    ) -> dict:
        payload: dict = {
            "model": self.model,
            "messages": [
                {
                    "role": message.role,
                    "content": message.content,
                }
                for message in messages
            ],
            "temperature": temperature,
            "stream": stream,
        }

        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        return payload

    def _auth_headers(self) -> dict[str, str]:
        # Ollama needs no auth; a hosted provider (Groq, a keyed vLLM
        # deployment) does. Absent on requests when there's no key to send.
        if not settings.llm_api_key:
            return {}
        return {"Authorization": f"Bearer {settings.llm_api_key}"}

    async def stream_chat(
        self,
        messages: Sequence[ChatMessage],
        *,
        temperature: float = 0.3,
    ) -> AsyncIterator[str]:

        timeout = httpx.Timeout(
            settings.llm_timeout_seconds,
            connect=10.0,
        )

        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                json=self._payload(
                    messages,
                    temperature=temperature,
                    stream=True,
                    max_tokens=settings.llm_max_tokens,
                ),
                headers=self._auth_headers(),
            ) as response:

                response.raise_for_status()

                async for line in response.aiter_lines():
                    if not line:
                        continue

                    if line.startswith(":"):
                        continue

                    if line.startswith("data:"):
                        line = line[5:].strip()

                    if line == "[DONE]":
                        break

                    try:
                        data = json.loads(line)
                    except json.JSONDecodeError:
                        continue

                    choices = data.get("choices") or []

                    if not choices:
                        continue

                    delta = choices[0].get("delta") or {}
                    content = delta.get("content")

                    if content:
                        yield str(content)

    async def complete(
        self,
        messages: Sequence[ChatMessage],
        *,
        temperature: float = 0.0,
        think: bool = True,
    ) -> str:

        # The Ollama-native fast path only applies to an unauthenticated
        # local Ollama -- a configured API key means a hosted provider
        # (Groq, a keyed vLLM) where that route doesn't exist and would
        # just be a wasted round trip on every single call.
        if not think and not settings.llm_api_key:
            # Ollama's OpenAI-compatible /v1 shim ignores every standard way
            # of turning off a hybrid model's thinking (top-level "think",
            # vLLM's chat_template_kwargs.enable_thinking, even the model's
            # own "/no_think" chat-template marker) -- qwen3:8b then spends
            # ~45s narrating a chain-of-thought before a one-line verdict,
            # which is what blew the Safety classifier's timeout in dev.
            # Ollama's native /api/chat DOES honour "think": false and
            # answers in ~5s, so try that first. A failure here (connection
            # error, 404) just means "not talking to Ollama" and falls
            # through to the standard path below.
            native = await self._complete_ollama_native(
                messages,
                temperature=temperature,
            )
            if native is not None:
                return native

        timeout = httpx.Timeout(
            settings.llm_timeout_seconds,
            connect=10.0,
        )

        # complete() only ever has one caller in this codebase -- the Safety
        # classifier, which always wants a short, strictly-parseable verdict
        # rather than prose. Forcing JSON mode here (rather than trusting the
        # prompt alone) is what makes that reliable: a plain instruction to
        # "return only JSON" is not something every model obeys consistently
        # on an ordinary, non-alarming message.
        # No further "think" handling below this point: unlike Ollama's
        # lenient /v1 shim, a real OpenAI-compatible server can validate its
        # request schema strictly -- Groq returns a hard 400 for an
        # unrecognised field such as vLLM's chat_template_kwargs, so this
        # path deliberately sends nothing speculative. It doesn't need to:
        # every hosted model tried here answers in well under a second
        # regardless of thinking, so disabling it is a non-issue in
        # practice. If a future provider needs it, add that provider's own
        # documented switch here rather than guessing at one that fits all.
        payload = self._payload(
            messages,
            temperature=temperature,
            stream=False,
            max_tokens=300,
            json_mode=True,
        )

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                json=payload,
                headers=self._auth_headers(),
            )

            response.raise_for_status()

            data = response.json()

        choices = data.get("choices") or []

        if not choices:
            raise RuntimeError("LLM returned no choices")

        message = choices[0].get("message") or {}

        return str(message.get("content") or "").strip()

    async def _complete_ollama_native(
        self,
        messages: Sequence[ChatMessage],
        *,
        temperature: float,
    ) -> str | None:
        """Best-effort call against Ollama's native /api/chat with thinking
        disabled. Returns None on any failure so the caller falls back to the
        OpenAI-compatible path -- this must never be the reason a completion
        fails outright."""

        # Ollama's OpenAI-compatible base is conventionally "<host>/v1";
        # the native API lives at the same host without that suffix.
        if self.base_url.endswith("/v1"):
            native_base = self.base_url[: -len("/v1")]
        else:
            native_base = self.base_url

        timeout = httpx.Timeout(
            settings.llm_timeout_seconds,
            connect=10.0,
        )

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{native_base}/api/chat",
                    json={
                        "model": self.model,
                        "stream": False,
                        "think": False,
                        "options": {"temperature": temperature},
                        "messages": [
                            {
                                "role": message.role,
                                "content": message.content,
                            }
                            for message in messages
                        ],
                    },
                )

                response.raise_for_status()

                data = response.json()

        except (httpx.HTTPError, ValueError):
            return None

        content = (data.get("message") or {}).get("content")

        return str(content).strip() if content else None