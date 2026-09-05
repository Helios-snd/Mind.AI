"""Runtime configuration, read once from the environment."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "dev"
    log_level: str = "INFO"

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/mindai"

    jwt_secret: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    refresh_token_days: int = 30

    cookie_secure: bool = False
    cookie_domain: str = ""

    login_code_ttl_minutes: int = 10
    login_code_max_attempts: int = 5
    login_code_echo: bool = True

    policy_version: str = "2026-09-01"

    llm_base_url: str = ""
    llm_model: str = ""
    # Bearer token for a hosted OpenAI-compatible provider (Groq, a
    # keyed vLLM deployment, ...). Empty for Ollama, which needs no auth.
    llm_api_key: str = ""
    # Cap on a single Companion reply. Also keeps a hosted provider's
    # per-minute output-token budget from being blown by one long reply.
    # The system prompt already asks Companion for "2-6 short paragraphs or
    # bullets" -- this is a backstop against runaway generation, not the
    # primary length control, so it's set loose enough that a normal
    # on-topic reply (including a short structured list or table) never
    # gets cut off mid-sentence. A truncated reply reads as broken; a
    # slightly-too-long one just reads as a bit much.
    llm_max_tokens: int = 1200
    # Wall-clock budget for one Companion turn. Generous, because a slow
    # answer is a UX problem; an unbounded one is a stuck request.
    llm_timeout_seconds: float = 45.0
    # Safety must resolve fast enough that a hung classifier does not stall
    # every message -- and when it does time out, the caller fails closed
    # to tier 3, never to "safe by default".
    safety_timeout_seconds: float = 12.0
    stt_base_url: str = ""

    @property
    def is_dev(self) -> bool:
        return self.env == "dev"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
