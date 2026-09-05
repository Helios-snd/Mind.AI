"""Counsellor identity: creation, authentication, and the session lifecycle --
plus the actual boundary the whole slice exists for for: a student's
mind_session cookie must never satisfy current_counsellor, and a
counsellor's console_session must never satisfy onboarded_user."""

from app.core.security import (
    ACCESS_COOKIE,
    CONSOLE_ACCESS_COOKIE,
    CONSOLE_REFRESH_COOKIE,
)
from app.modules.counsellors import service


async def _make_counsellor(session, email="dr.rao@example.com", password="hunter22"):
    return await service.create_counsellor(session, email, "Dr. Rao", password)


async def test_authenticate_rejects_wrong_password(session):
    await _make_counsellor(session)
    await session.commit()

    result = await service.authenticate(session, "dr.rao@example.com", "wrong")
    assert result is None


async def test_authenticate_rejects_unknown_email(session):
    result = await service.authenticate(session, "nobody@example.com", "whatever")
    assert result is None


async def test_authenticate_rejects_a_deactivated_counsellor(session):
    from app.db.base import utcnow

    counsellor = await _make_counsellor(session)
    counsellor.deactivated_at = utcnow()
    await session.commit()

    result = await service.authenticate(session, "dr.rao@example.com", "hunter22")
    assert result is None


async def test_authenticate_succeeds_with_the_right_password(session):
    await _make_counsellor(session)
    await session.commit()

    result = await service.authenticate(session, "dr.rao@example.com", "hunter22")
    assert result is not None
    assert result.email == "dr.rao@example.com"


async def test_login_sets_console_cookies_not_student_ones(client, session):
    await _make_counsellor(session)
    await session.commit()

    r = await client.post(
        "/api/v1/console/auth/login",
        json={"email": "dr.rao@example.com", "password": "hunter22"},
    )
    assert r.status_code == 200
    assert r.json()["email"] == "dr.rao@example.com"

    cookies = {c.name for c in client.cookies.jar}
    assert CONSOLE_ACCESS_COOKIE in cookies
    assert CONSOLE_REFRESH_COOKIE in cookies
    assert ACCESS_COOKIE not in cookies


async def test_login_with_wrong_password_is_rejected(client, session):
    await _make_counsellor(session)
    await session.commit()

    r = await client.post(
        "/api/v1/console/auth/login",
        json={"email": "dr.rao@example.com", "password": "wrong"},
    )
    assert r.status_code == 401


async def test_console_refresh_rotates_and_old_token_stops_working(client, session):
    await _make_counsellor(session)
    await session.commit()
    await client.post(
        "/api/v1/console/auth/login",
        json={"email": "dr.rao@example.com", "password": "hunter22"},
    )
    first_refresh = client.cookies.get(CONSOLE_REFRESH_COOKIE)

    r = await client.post("/api/v1/console/auth/refresh")
    assert r.status_code == 200
    second_refresh = client.cookies.get(CONSOLE_REFRESH_COOKIE)
    assert second_refresh != first_refresh

    client.cookies.set(CONSOLE_REFRESH_COOKIE, first_refresh)
    replay = await client.post("/api/v1/console/auth/refresh")
    assert replay.status_code == 401


async def test_a_students_session_cookie_never_satisfies_a_counsellor_route(client):
    """The actual boundary this whole slice exists for."""
    await client.post("/api/v1/auth/anonymous")
    r = await client.get("/api/v1/console/queue")
    assert r.status_code == 401


async def test_a_counsellors_session_cookie_never_satisfies_a_student_route(
    client, session
):
    await _make_counsellor(session)
    await session.commit()
    await client.post(
        "/api/v1/console/auth/login",
        json={"email": "dr.rao@example.com", "password": "hunter22"},
    )

    r = await client.get("/api/v1/me")
    assert r.status_code == 401


async def test_logout_clears_console_cookies_and_revokes_the_session(client, session):
    await _make_counsellor(session)
    await session.commit()
    await client.post(
        "/api/v1/console/auth/login",
        json={"email": "dr.rao@example.com", "password": "hunter22"},
    )

    r = await client.post("/api/v1/console/auth/logout")
    assert r.status_code == 204

    replay = await client.post("/api/v1/console/auth/refresh")
    assert replay.status_code == 401
