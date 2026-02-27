"""
Integration tests for the auth router.

Uses an in-memory SQLite database via aiosqlite so no PostgreSQL is needed.
The PostgreSQL-specific UUID column type is handled by using String columns
in a test-specific model variant (SQLAlchemy's UUID type falls back to
CHAR(32) on non-PostgreSQL dialects automatically).
"""

import uuid

import httpx
import pytest

try:
    import aiosqlite  # noqa: F401

    HAS_AIOSQLITE = True
except ImportError:
    HAS_AIOSQLITE = False

pytestmark = pytest.mark.skipif(not HAS_AIOSQLITE, reason="aiosqlite not installed")


@pytest.fixture()
async def test_app():
    """
    Create a minimal FastAPI app with the auth router backed by
    an in-memory SQLite database.
    """
    from sqlalchemy.ext.asyncio import (
        AsyncSession,
        async_sessionmaker,
        create_async_engine,
    )
    from sqlalchemy.pool import StaticPool

    from fastapi import FastAPI
    from services.shared.db.session import Base, get_db

    # Import models BEFORE create_all so they are registered on Base.metadata.
    # On the very first fixture invocation the models module hasn't been loaded
    # yet, so Base.metadata.tables would be empty without this import.
    import services.shared.db.models  # noqa: F401
    from services.shared.auth.router import router as auth_router
    from services.shared.auth.router import setup_rate_limiting, limiter

    # Use StaticPool to share the same in-memory DB across all connections
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def override_get_db():
        async with factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app = FastAPI()

    app.include_router(auth_router)
    setup_rate_limiting(app)
    # Disable rate limiting during tests
    limiter.enabled = False
    app.dependency_overrides[get_db] = override_get_db

    yield app

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture()
async def client(test_app):
    transport = httpx.ASGITransport(app=test_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_register_new_user(client):
    """Registration with valid data returns 201 and a token."""
    response = await client.post(
        "/auth/register",
        json={
            "email": "farmer@example.com",
            "password": "securepass123",
            "full_name": "Test Farmer",
            "role": "farmer",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    """Registering with an already-used email returns 400."""
    payload = {
        "email": "duplicate@example.com",
        "password": "pass1234",
        "full_name": "User One",
    }
    resp1 = await client.post("/auth/register", json=payload)
    assert resp1.status_code == 201

    resp2 = await client.post("/auth/register", json=payload)
    assert resp2.status_code == 400
    assert "already registered" in resp2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_valid_credentials(client):
    """Login with correct credentials returns a token."""
    await client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "mypassword1",
            "full_name": "Login User",
        },
    )
    response = await client.post(
        "/auth/login",
        json={
            "email": "login@example.com",
            "password": "mypassword1",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    """Login with wrong password returns 401."""
    await client.post(
        "/auth/register",
        json={
            "email": "wrongpass@example.com",
            "password": "correct1pw",
            "full_name": "WP User",
        },
    )
    response = await client.post(
        "/auth/login",
        json={
            "email": "wrongpass@example.com",
            "password": "incorrect1",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    """Login with email that was never registered returns 401."""
    response = await client.post(
        "/auth/login",
        json={
            "email": "ghost@example.com",
            "password": "anything",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_profile_with_valid_token(client):
    """GET /auth/me with a valid token returns user profile."""
    reg_resp = await client.post(
        "/auth/register",
        json={
            "email": "profile@example.com",
            "password": "pass1234",
            "full_name": "Profile User",
            "role": "researcher",
            "state": "Maharashtra",
        },
    )
    token = reg_resp.json()["access_token"]

    response = await client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "profile@example.com"
    assert data["full_name"] == "Profile User"
    assert data["role"] == "researcher"
    assert data["state"] == "Maharashtra"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_get_profile_without_token(client):
    """GET /auth/me without a token returns 401 (HTTPBearer default)."""
    response = await client.get("/auth/me")
    # HTTPBearer auto_error returns 401 when no credentials are provided
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_profile_with_invalid_token(client):
    """GET /auth/me with a bad token returns 401."""
    response = await client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalid-garbage-token"},
    )
    assert response.status_code == 401
