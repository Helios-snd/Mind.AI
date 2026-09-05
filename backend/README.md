# Mind.AI backend

FastAPI + PostgreSQL. Slice 1 of `docs/blueprint/09-slice-order.md`: auth, the
access gate, and onboarding.

## What this slice covers

Ten tables and thirteen endpoints. Everything the existing `ApiClient` needed,
plus the auth surface the frontend had no equivalent for.

The student app's check-ins, conversation thread and trends still live in
`localStorage` — those are slices 2–4.

## Setup

PostgreSQL 18 is already installed locally (EDB, at `/Library/PostgreSQL/18`),
running on `:5432`. It is not a Homebrew install, so `brew services` does not
manage it.

```bash
createdb -h localhost -U postgres mindai
createdb -h localhost -U postgres mindai_test

python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'

cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
alembic upgrade head
```

Generate a signing key with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
open http://localhost:8000/docs
```

The frontend proxies `/api/v1/*` here via `next.config.mjs`, so the session
cookie is first-party and there is **no CORS configuration anywhere**. If you
ever find yourself needing CORS, the proxy has been bypassed and the cookie is
about to stop working.

## Test

```bash
pytest
```

Tests run against `mindai_test` on a real PostgreSQL, not SQLite: SQLite drops
tzinfo on read from `DateTime(timezone=True)`, which would make every token
expiry comparison raise on naive-vs-aware, and the cascade and unique-constraint
behaviour under test is Postgres behaviour.

Override with `TEST_DATABASE_URL` if your test database lives elsewhere.

## Shape

```
app/
├── main.py            app factory, /healthz
├── core/              config · logging · errors · security · validators
├── db/                base · session · registry
├── api/v1/            router · deps  (deps owns current_user)
└── modules/<name>/    models · schemas · service · router
```

One module shape per domain. Later slices add `checkins`, `conversations`,
`trends`, `screening`, `care`, `safety`, `referrals`, `counsellor` the same way.

Agents will live in a sibling `agents/` package behind an `LLMProvider` ABC so
no agent module ever imports a vendor SDK. See `docs/blueprint/07-agents.md`.

## Two things that are load-bearing

**Authorization is here, not in `middleware.ts`.** The middleware redirects for
UX and does not verify the token's signature. Every protected request is
re-checked against a signed token and live database state in `api/v1/deps.py`.

**Logs never carry student content.** `core/logging.py` redacts a deny-list of
field names. Log the fact, the user id, the timestamp and the verdict — never
the text. See `docs/blueprint/08-safety-and-privacy.md` §6.

## Dev-only settings

`LOGIN_CODE_ECHO=true` returns the one-time code in the API response so the
claim and login flows are testable without a mail or SMS provider. **It must be
off in production** — it hands anyone the code for any destination.
