"""Tests for scoring engine."""

import pytest
from services.scoring_engine import LEVEL_THRESHOLDS
from utils.xp_calculator import calculate_bonus_xp, xp_for_level, level_progress_percent


def test_level_thresholds_are_ascending():
    prev = -1
    for level in sorted(LEVEL_THRESHOLDS.keys()):
        assert LEVEL_THRESHOLDS[level] > prev
        prev = LEVEL_THRESHOLDS[level]


def test_xp_for_level():
    assert xp_for_level(1) == 0
    assert xp_for_level(2) == 500
    assert xp_for_level(10) == 100000


def test_bonus_xp_no_streak():
    assert calculate_bonus_xp(100, 0, 1) == 100


def test_bonus_xp_7_day_streak():
    assert calculate_bonus_xp(100, 7, 1) == 110


def test_bonus_xp_30_day_streak():
    # 1.0 + 0.1 + 0.1 + 0.2 = 1.4
    assert calculate_bonus_xp(100, 30, 1) == 140


def test_level_progress_level_1():
    progress = level_progress_percent(250, 1)
    assert 0.49 < progress < 0.51  # 250/500 = 0.5


def test_level_progress_max_level():
    assert level_progress_percent(200000, 10) == 1.0


def test_level_progress_zero():
    assert level_progress_percent(0, 1) == 0.0
