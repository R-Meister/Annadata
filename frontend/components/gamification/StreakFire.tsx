"use client";

import { cn } from "@/lib/utils";

interface StreakFireProps {
  streak: number;
  className?: string;
}

/**
 * Streak Fire Animation - Shows the current streak with animated fire
 * Fire size grows with streak length
 */
export function StreakFire({ streak, className }: StreakFireProps) {
  // Calculate fire intensity based on streak
  const intensity = Math.min(streak / 30, 1); // Max intensity at 30 days
  const fireSize = 32 + intensity * 24; // 32px to 56px

  if (streak === 0) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-2xl opacity-50">🔥</span>
        <span className="text-lg font-medium text-gray-400">No streak</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="relative"
        style={{ width: fireSize, height: fireSize }}
      >
        {/* Animated fire emoji with glow */}
        <span
          className="absolute inset-0 flex items-center justify-center animate-pulse"
          style={{
            fontSize: fireSize * 0.8,
            filter: `drop-shadow(0 0 ${8 + intensity * 12}px #f97316)`,
          }}
        >
          🔥
        </span>

        {/* Extra flames for high streaks */}
        {streak >= 7 && (
          <span
            className="absolute -top-1 -right-1 animate-bounce"
            style={{ fontSize: fireSize * 0.4 }}
          >
            ✨
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold",
            streak >= 30
              ? "text-orange-500 text-2xl"
              : streak >= 7
                ? "text-orange-400 text-xl"
                : "text-orange-300 text-lg"
          )}
        >
          {streak}
        </span>
        <span className="text-xs text-gray-500">
          {streak === 1 ? "day" : "days"}
        </span>
      </div>
    </div>
  );
}
