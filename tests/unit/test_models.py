"""
Unit tests for services.shared.db.models — SQLAlchemy ORM models.
"""

import uuid
from datetime import datetime, timezone

import pytest


class TestUserRole:
    """Tests for the UserRole enum."""

    def test_role_values(self):
        from services.shared.db.models import UserRole

        assert UserRole.FARMER.value == "farmer"
        assert UserRole.TRADER.value == "trader"
        assert UserRole.RESEARCHER.value == "researcher"
        assert UserRole.ADMIN.value == "admin"

    def test_role_is_str_enum(self):
        from services.shared.db.models import UserRole

        assert isinstance(UserRole.FARMER, str)
        assert UserRole.FARMER == "farmer"

    def test_role_from_string(self):
        from services.shared.db.models import UserRole

        role = UserRole("farmer")
        assert role is UserRole.FARMER

    def test_invalid_role_raises(self):
        from services.shared.db.models import UserRole

        with pytest.raises(ValueError):
            UserRole("invalid_role")


class TestUserModel:
    """Tests for the User SQLAlchemy model (schema only — no DB connection)."""

    def test_user_table_name(self):
        from services.shared.db.models import User

        assert User.__tablename__ == "users"

    def test_user_has_expected_columns(self):
        from services.shared.db.models import User

        column_names = {c.name for c in User.__table__.columns}
        expected = {
            "id",
            "email",
            "hashed_password",
            "full_name",
            "phone",
            "role",
            "is_active",
            "is_superuser",
            "state",
            "district",
            "created_at",
            "updated_at",
        }
        assert expected.issubset(column_names)

    def test_user_email_is_unique(self):
        from services.shared.db.models import User

        email_col = User.__table__.columns["email"]
        assert email_col.unique is True

    def test_user_email_is_indexed(self):
        from services.shared.db.models import User

        email_col = User.__table__.columns["email"]
        assert email_col.index is True

    def test_user_repr(self):
        from services.shared.db.models import User, UserRole

        # Use the proper constructor so SQLAlchemy sets up _sa_instance_state
        user = User(email="test@example.com", role=UserRole.FARMER, hashed_password="x")
        result = repr(user)
        assert "test@example.com" in result
        # repr uses UserRole enum which may show as 'farmer' or 'UserRole.FARMER'
        assert "FARMER" in result.upper()


class TestServiceLogModel:
    """Tests for the ServiceLog SQLAlchemy model (schema only — no DB connection)."""

    def test_servicelog_table_name(self):
        from services.shared.db.models import ServiceLog

        assert ServiceLog.__tablename__ == "service_logs"

    def test_servicelog_has_expected_columns(self):
        from services.shared.db.models import ServiceLog

        column_names = {c.name for c in ServiceLog.__table__.columns}
        expected = {
            "id",
            "service_name",
            "endpoint",
            "user_id",
            "request_method",
            "status_code",
            "response_time_ms",
            "created_at",
        }
        assert expected.issubset(column_names)

    def test_servicelog_service_name_is_indexed(self):
        from services.shared.db.models import ServiceLog

        sn_col = ServiceLog.__table__.columns["service_name"]
        assert sn_col.index is True

    def test_servicelog_user_id_is_nullable(self):
        from services.shared.db.models import ServiceLog

        uid_col = ServiceLog.__table__.columns["user_id"]
        assert uid_col.nullable is True


class TestBaseDeclarativeBase:
    """Tests for the Base declarative base."""

    def test_base_exists(self):
        from services.shared.db.session import Base

        assert Base is not None
        assert hasattr(Base, "metadata")

    def test_models_registered_on_base(self):
        from services.shared.db.session import Base

        table_names = set(Base.metadata.tables.keys())
        assert "users" in table_names
        assert "service_logs" in table_names
