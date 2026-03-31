"""XP calculation utilities."""


def calculate_bonus_xp(base_xp: int, streak_days: int, level: int) -> int:
    """Calculate bonus XP based on streak and level."""
    multiplier = 1.0

    # Streak bonuses
    if streak_days >= 7:
        multiplier += 0.1
    if streak_days >= 14:
        multiplier += 0.1
    if streak_days >= 30:
        multiplier += 0.2

    # No level penalty — higher levels don't earn less
    return int(base_xp * multiplier)


def xp_for_level(level: int) -> int:
    """Get the total XP required to reach a specific level."""
    thresholds = {
        1: 0, 2: 500, 3: 1500, 4: 3500,
        5: 7000, 6: 12000, 7: 20000, 8: 35000,
        9: 55000, 10: 100000,
    }
    return thresholds.get(level, 0)


def level_progress_percent(current_xp: int, current_level: int) -> float:
    """Get percentage progress towards next level (0.0 to 1.0)."""
    if current_level >= 10:
        return 1.0

    current_threshold = xp_for_level(current_level)
    next_threshold = xp_for_level(current_level + 1)
    range_xp = next_threshold - current_threshold

    if range_xp <= 0:
        return 1.0

    progress = (current_xp - current_threshold) / range_xp
    return max(0.0, min(1.0, progress))
