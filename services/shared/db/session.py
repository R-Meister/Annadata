"""
Async SQLAlchemy 2.0 database session management.
All services share a single PostgreSQL database.

Engine and session factory are created lazily (on first use) so that
importing this module does not require a live PostgreSQL connection.
This is critical for unit tests and CLI scripts.
"""

from typing import Optional

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from services.shared.config import settings


# ---------------------------------------------------------------------------
# Lazy engine / session factory
# ---------------------------------------------------------------------------

_engine: Optional[AsyncEngine] = None
_session_factory: Optional[async_sessionmaker] = None


def get_engine() -> AsyncEngine:
    """Return the shared async engine, creating it on first call."""
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            pool_size=20,
            max_overflow=10,
            pool_pre_ping=True,
        )
    return _engine


def get_session_factory() -> async_sessionmaker:
    """Return the shared session factory, creating it on first call."""
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _session_factory


# ---------------------------------------------------------------------------
# Backwards-compatible module-level aliases (properties would be nicer,
# but module-level descriptors aren't a thing in Python).  Code that does
# ``from services.shared.db.session import engine`` will get a lazy proxy
# the first time the attribute is actually *used* at runtime, not at import.
# ---------------------------------------------------------------------------


class _LazyEngineProxy:
    """Transparent proxy so ``engine.begin()`` etc. still work."""

    def __getattr__(self, name):
        return getattr(get_engine(), name)


class _LazySessionFactoryProxy:
    """Transparent proxy so ``async_session_factory()`` still works."""

    def __call__(self, *args, **kwargs):
        return get_session_factory()(*args, **kwargs)

    def __getattr__(self, name):
        return getattr(get_session_factory(), name)


engine = _LazyEngineProxy()  # type: ignore[assignment]
async_session_factory = _LazySessionFactoryProxy()  # type: ignore[assignment]


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass


async def get_db() -> AsyncSession:
    """FastAPI dependency: yields a database session per request."""
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables. Called once at startup."""
    real_engine = get_engine()
    async with real_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Dispose engine connections. Called at shutdown."""
    global _engine, _session_factory
    real_engine = get_engine()
    await real_engine.dispose()
    _engine = None
    _session_factory = None
