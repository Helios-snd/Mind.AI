"""Auth: anonymous accounts, refresh rotation, claim and return."""

import pytest
from sqlalchemy import select

from app.core.security import ACCESS_COOKIE, REFRESH_COOKIE, STAGE_COOKIE
from app.modules.users.models import UserProfile


async def test_anonymous_mints_account_and_sets_httponly_cookies(client):
    r = await client.post("/api/v1/auth/anonymous")
    assert r.status_code == 200
    assert r.json()["onboarded"] is False

    cookies = {c.name: c for c in client.cookies.jar}
    assert ACCESS_COOKIE in cookies
    assert REFRESH_COOKIE in cookies

    # The session must be unreadable from JavaScript; the stage hint is
    # deliberately readable so the marketing layout can decide whether to
    # render the tab bar without making an API call. Both halves are pinned
    # here because getting either backwards is a real defect.
    raw = {
        header.split("=", 1)[0]: header for header in r.headers.get_list("set-cookie")
    }
    assert "HttpOnly" in raw[ACCESS_COOKIE]
    assert "HttpOnly" in raw[REFRESH_COOKIE]
    assert "HttpOnly" not in raw[STAGE_COOKIE]
    assert "mind_stage=anon" in raw[STAGE_COOKIE]


async def test_protected_route_requires_a_session(client):
    r = await client.get("/api/v1/onboarding")
    assert r.status_code == 401


async def test_refresh_rotates_and_old_token_stops_working(client):
    await client.post("/api/v1/auth/anonymous")
    first_refresh = client.cookies.get(REFRESH_COOKIE)

    r = await client.post("/api/v1/auth/refresh")
    assert r.status_code == 200
    second_refresh = client.cookies.get(REFRESH_COOKIE)
    assert second_refresh != first_refresh

    # Replaying the consumed token must fail -- single-use rotation.
    client.cookies.set(REFRESH_COOKIE, first_refresh)
    replay = await client.post("/api/v1/auth/refresh")
    assert replay.status_code == 401


async def test_login_for_unknown_destination_does_not_reveal_absence(client):
    r = await client.post(
        "/api/v1/auth/login", json={"destination": "nobody@example.com"}
    )
    assert r.status_code == 200
    assert r.json()["ok"] is True
    # No code is issued, but the response is indistinguishable from success.
    assert r.json()["dev_code"] is None


async def test_claim_then_return_on_a_clean_client_keeps_the_same_account(
    client, session
):
    created = await client.post("/api/v1/auth/anonymous")
    user_id = created.json()["user_id"]

    claim = await client.post(
        "/api/v1/auth/claim", json={"destination": "Student@Example.COM"}
    )
    assert claim.status_code == 200
    code = claim.json()["dev_code"]
    assert code is not None

    verified = await client.post(
        "/api/v1/auth/verify",
        json={"destination": "student@example.com", "code": code},
    )
    assert verified.status_code == 200
    assert verified.json()["user_id"] == user_id
    assert verified.json()["claimed"] is True

    # Email is stored lowercased, so the unique index is case-insensitive.
    profile = (
        await session.scalars(
            select(UserProfile).where(UserProfile.email == "student@example.com")
        )
    ).first()
    assert profile is not None

    # Simulate a new device: drop every cookie, then log back in.
    client.cookies.clear()
    login = await client.post(
        "/api/v1/auth/login", json={"destination": "student@example.com"}
    )
    login_code = login.json()["dev_code"]
    back = await client.post(
        "/api/v1/auth/verify",
        json={"destination": "student@example.com", "code": login_code},
    )
    assert back.status_code == 200
    assert back.json()["user_id"] == user_id


async def test_wrong_code_counts_attempts_then_locks(client):
    await client.post("/api/v1/auth/anonymous")
    await client.post("/api/v1/auth/claim", json={"destination": "a@example.com"})

    for _ in range(5):
        bad = await client.post(
            "/api/v1/auth/verify",
            json={"destination": "a@example.com", "code": "000000"},
        )
        assert bad.status_code == 401

    locked = await client.post(
        "/api/v1/auth/verify", json={"destination": "a@example.com", "code": "000000"}
    )
    assert locked.status_code == 429


async def test_claiming_a_destination_owned_by_someone_else_is_refused(client):
    await client.post("/api/v1/auth/anonymous")
    claim = await client.post(
        "/api/v1/auth/claim", json={"destination": "taken@example.com"}
    )
    await client.post(
        "/api/v1/auth/verify",
        json={"destination": "taken@example.com", "code": claim.json()["dev_code"]},
    )

    client.cookies.clear()
    await client.post("/api/v1/auth/anonymous")
    second = await client.post(
        "/api/v1/auth/claim", json={"destination": "taken@example.com"}
    )
    assert second.status_code == 422


async def test_malformed_phone_is_refused_with_the_same_rule_as_the_ui(client):
    await client.post("/api/v1/auth/anonymous")
    r = await client.post("/api/v1/auth/claim", json={"destination": "12345"})
    assert r.status_code == 422


async def test_logout_clears_cookies(client):
    await client.post("/api/v1/auth/anonymous")
    r = await client.post("/api/v1/auth/logout")
    assert r.status_code == 204
    assert not client.cookies.get(ACCESS_COOKIE)
