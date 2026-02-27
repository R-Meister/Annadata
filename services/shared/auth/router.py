"""
Auth API router - handles registration, login, and user profile.
Mount this router in any service that needs auth endpoints.
"""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.auth.dependencies import get_current_user
from services.shared.auth.jwt import (
    TokenData,
    create_access_token,
    get_password_hash,
    verify_password,
)
from services.shared.config import settings
from services.shared.db.models import User, UserRole
from services.shared.db.session import get_db


router = APIRouter(prefix="/auth", tags=["auth"])


# ============================================================
# Request / Response Schemas
# ============================================================


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str | None = None
    role: UserRole = UserRole.FARMER
    state: str | None = None
    district: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    phone: str | None
    role: str
    state: str | None
    district: str | None
    is_active: bool

    class Config:
        from_attributes = True


# ============================================================
# Endpoints
# ============================================================


@router.post("/register", response_model=TokenData, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user and return access token."""
    # Check for existing user
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=body.email,
        hashed_password=get_password_hash(body.password),
        full_name=body.full_name,
        phone=body.phone,
        role=body.role,
        state=body.state,
        district=body.district,
    )
    db.add(user)
    await db.flush()

    token = create_access_token(
        user_id=user.id,
        role=user.role.value,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenData(access_token=token)


@router.post("/login", response_model=TokenData)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return access token."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    token = create_access_token(
        user_id=user.id,
        role=user.role.value,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenData(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role.value,
        state=current_user.state,
        district=current_user.district,
        is_active=current_user.is_active,
    )
