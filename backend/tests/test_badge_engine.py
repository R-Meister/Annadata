"""Tests for badge engine condition evaluation."""

from services.badge_engine import BadgeEngine


class MockDB:
    pass


def test_condition_gte_true():
    engine = BadgeEngine(MockDB())
    assert engine._check_condition("completed_quests >= 1", {"completed_quests": 5}) is True


def test_condition_gte_false():
    engine = BadgeEngine(MockDB())
    assert engine._check_condition("completed_quests >= 10", {"completed_quests": 5}) is False


def test_condition_gte_exact():
    engine = BadgeEngine(MockDB())
    assert engine._check_condition("water_quests >= 5", {"water_quests": 5}) is True


def test_condition_missing_key():
    engine = BadgeEngine(MockDB())
    assert engine._check_condition("nonexistent >= 1", {"completed_quests": 5}) is False


def test_condition_invalid_format():
    engine = BadgeEngine(MockDB())
    assert engine._check_condition("invalid", {}) is False
