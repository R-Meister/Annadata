"""
JWT authentication utilities for Annadata OS.
All services use this for token creation and verification.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from services.shared.config import settings


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============================================================
# Schemas
# ============================================================


class TokenPayload(BaseModel):
    sub: str  # user id
    exp: datetime
    role: str


class TokenData(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ============================================================
# Password utilities
# ============================================================


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# ============================================================
# Token utilities
# ============================================================


def create_access_token(
    user_id: UUID,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
    }
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[TokenPayload]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return TokenPayload(**payload)
    except JWTError:
        return None
