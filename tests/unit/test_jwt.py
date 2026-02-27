"""
Unit tests for services.shared.auth.jwt — JWT token and password utilities.
"""

import uuid
from datetime import timedelta

import pytest


class TestPasswordHashing:
    """Tests for bcrypt password hashing and verification."""

    def test_hash_password_returns_bcrypt_hash(self):
        from services.shared.auth.jwt import get_password_hash

        hashed = get_password_hash("my_secure_password")
        assert hashed is not None
        assert hashed != "my_secure_password"
        # bcrypt hashes start with $2b$
        assert hashed.startswith("$2b$")

    def test_verify_correct_password(self):
        from services.shared.auth.jwt import get_password_hash, verify_password

        password = "test_password_123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_wrong_password(self):
        from services.shared.auth.jwt import get_password_hash, verify_password

        hashed = get_password_hash("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_different_passwords_produce_different_hashes(self):
        from services.shared.auth.jwt import get_password_hash

        hash1 = get_password_hash("password_one")
        hash2 = get_password_hash("password_two")
        assert hash1 != hash2

    def test_same_password_produces_different_hashes(self):
        """bcrypt uses random salts, so same input -> different hashes."""
        from services.shared.auth.jwt import get_password_hash

        hash1 = get_password_hash("same_password")
        hash2 = get_password_hash("same_password")
        assert hash1 != hash2

    def test_empty_password(self):
        from services.shared.auth.jwt import get_password_hash, verify_password

        hashed = get_password_hash("")
        assert verify_password("", hashed) is True
        assert verify_password("not_empty", hashed) is False


class TestTokenCreation:
    """Tests for JWT access token creation."""

    def test_create_access_token_returns_string(self):
        from services.shared.auth.jwt import create_access_token

        user_id = uuid.uuid4()
        token = create_access_token(user_id=user_id, role="farmer")
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_custom_expiry(self):
        from services.shared.auth.jwt import create_access_token

        user_id = uuid.uuid4()
        token = create_access_token(
            user_id=user_id,
            role="admin",
            expires_delta=timedelta(minutes=5),
        )
        assert isinstance(token, str)

    def test_create_access_token_encodes_user_id_and_role(self):
        from services.shared.auth.jwt import create_access_token, decode_access_token

        user_id = uuid.uuid4()
        token = create_access_token(user_id=user_id, role="researcher")

        payload = decode_access_token(token)
        assert payload is not None
        assert payload.sub == str(user_id)
        assert payload.role == "researcher"


class TestTokenDecoding:
    """Tests for JWT access token decoding and validation."""

    def test_decode_valid_token(self):
        from services.shared.auth.jwt import create_access_token, decode_access_token

        user_id = uuid.uuid4()
        token = create_access_token(user_id=user_id, role="farmer")
        payload = decode_access_token(token)

        assert payload is not None
        assert payload.sub == str(user_id)
        assert payload.role == "farmer"
        assert payload.exp is not None

    def test_decode_invalid_token_returns_none(self):
        from services.shared.auth.jwt import decode_access_token

        result = decode_access_token("this-is-not-a-valid-jwt-token")
        assert result is None

    def test_decode_tampered_token_returns_none(self):
        from services.shared.auth.jwt import create_access_token, decode_access_token

        user_id = uuid.uuid4()
        token = create_access_token(user_id=user_id, role="farmer")
        # Tamper with the token
        tampered = token[:-5] + "XXXXX"
        result = decode_access_token(tampered)
        assert result is None

    def test_decode_expired_token_returns_none(self):
        from services.shared.auth.jwt import create_access_token, decode_access_token

        user_id = uuid.uuid4()
        # Create a token that expires immediately (negative delta)
        token = create_access_token(
            user_id=user_id,
            role="farmer",
            expires_delta=timedelta(seconds=-10),
        )
        result = decode_access_token(token)
        assert result is None

    def test_decode_empty_string_returns_none(self):
        from services.shared.auth.jwt import decode_access_token

        result = decode_access_token("")
        assert result is None


class TestTokenSchemas:
    """Tests for TokenPayload and TokenData Pydantic models."""

    def test_token_data_default_type(self):
        from services.shared.auth.jwt import TokenData

        td = TokenData(access_token="some-token")
        assert td.token_type == "bearer"
        assert td.access_token == "some-token"

    def test_token_payload_fields(self):
        from datetime import datetime, timezone

        from services.shared.auth.jwt import TokenPayload

        now = datetime.now(timezone.utc)
        tp = TokenPayload(sub="some-uuid", exp=now, role="admin")
        assert tp.sub == "some-uuid"
        assert tp.role == "admin"
        assert tp.exp == now
