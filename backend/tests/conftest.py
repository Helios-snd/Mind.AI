"""Test fixtures.

These run against a real PostgreSQL database, not SQLite. SQLite drops tzinfo
on read from DateTime(timezone=True), which would make every token-expiry
comparison raise on naive-vs-aware -- and the cascade and unique-constraint
behaviour we care about is Postgres behaviour anyway.

    createdb -h localhost -U postgres mindai_test
    TEST_DATABASE_URL=postgresql+asyncpg://... pytest
"""

import os
from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings
from app.db.registry import Base
from app.db.session import get_session
from app.main import create_app

_SCHEMA_READY = False

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    settings.database_url.rsplit("/", 1)[0] + "/mindai_test",
)


@pytest_asyncio.fixture
async def engine() -> AsyncIterator[AsyncEngine]:
    """Function-scoped, with NullPool.

    asyncpg binds a connection to the event loop that opened it, and
    pytest-asyncio gives each test its own loop. A session-scoped engine
    therefore hands the second test a connection belonging to a dead loop --
    which surfaces as "attached to a different loop" during teardown, long
    after the assertions have already passed. One engine per test, pooling
    off, is the fix; create_all is checkfirst so the cost is a metadata query.
    """
    eng = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)

    global _SCHEMA_READY
    async with eng.begin() as conn:
        if not _SCHEMA_READY:
            # Once per run, drop before creating. create_all is checkfirst, so
            # a table left over from an older revision keeps its old columns
            # and every test fails on a column the model has but the table
            # does not -- which is exactly how a missing migration hides.
            await conn.run_sync(Base.metadata.drop_all)
            _SCHEMA_READY = True
        await conn.run_sync(Base.metadata.create_all)

    yield eng

    # Truncate rather than drop, so the next test starts clean without paying
    # for a schema rebuild.
    async with eng.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())
    await eng.dispose()


@pytest_asyncio.fixture
async def session(engine: AsyncEngine) -> AsyncIterator[AsyncSession]:
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as s:
        yield s
        await s.rollback()


@pytest_asyncio.fixture
async def client(engine: AsyncEngine) -> AsyncIterator[AsyncClient]:
    app = create_app()
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def override() -> AsyncIterator[AsyncSession]:
        async with factory() as s:
            try:
                yield s
                await s.commit()
            except Exception:
                await s.rollback()
                raise

    app.dependency_overrides[get_session] = override

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture
async def patch_talk_session_factory(engine: AsyncEngine, monkeypatch):
    """`persist_assistant`/`persist_safety` open their own sessions directly
    from `app.modules.talk.service.SessionFactory` rather than the injected,
    per-request one -- deliberately, since a StreamingResponse body executes
    after the endpoint's own session dependency would otherwise be torn down.

    That means the module-level production SessionFactory (bound to the real
    `mindai` database) is what those two functions would use unless something
    points them at the test engine instead. This fixture does that, for any
    test that actually exercises assistant/safety persistence.
    """
    import app.modules.talk.service as talk_service

    test_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    monkeypatch.setattr(talk_service, "SessionFactory", test_factory)
    yield test_factory


@pytest.fixture
def onboarding_payload() -> dict:
    """A complete, valid onboarding run, in the exact camelCase the frontend sends."""
    return {
        "language": "bn",
        "baseline": [
            {"itemId": "dass-3", "value": 2},
            {"itemId": "dass-5", "value": 1},
            {"itemId": "dass-10", "value": 3},
        ],
        "crisisPlan": {
            "whoIdCall": "Rhea. And didi if it's really bad.",
            "whatHelps": "Walking by the lake. Cold water on my face.",
            "whatMakesItWorse": "Being alone all evening. Scrolling.",
        },
        "contact": {
            "name": "Rhea",
            "relationship": "closest friend",
            "phone": "+919876543210",
        },
    }
