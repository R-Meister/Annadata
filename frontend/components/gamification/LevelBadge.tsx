"use client";

import { cn } from "@/lib/utils";
import { getLevelInfo } from "@/lib/gamification";

interface LevelBadgeProps {
  xp: number;
  size?: "sm" | "md" | "lg";
  showTitle?: boolean;
  className?: string;
}

/**
 * Level Badge Component - Shows the farmer's current level badge
 * Displays emoji badge with optional level title
 */
export function LevelBadge({
  xp,
  size = "md",
  showTitle = true,
  className,
}: LevelBadgeProps) {
  const { level, progressPercent } = getLevelInfo(xp);

  const sizeClasses = {
    sm: "w-10 h-10 text-xl",
    md: "w-14 h-14 text-3xl",
    lg: "w-20 h-20 text-5xl",
  };

  const titleSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-yellow-100 to-yellow-200",
          "border-4 border-yellow-400 shadow-lg",
          sizeClasses[size]
        )}
        style={{
          boxShadow: `0 0 20px ${level.color}40`,
        }}
      >
        <span className="drop-shadow-md">{level.badge}</span>

        {/* Progress ring around badge */}
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={level.color}
            strokeWidth="4"
            strokeDasharray={`${progressPercent * 2.89} 289`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
      </div>

      {showTitle && (
        <div className="text-center">
          <p className={cn("font-semibold text-gray-800", titleSizes[size])}>
            Level {level.number}
          </p>
          <p className={cn("text-gray-600", titleSizes[size])}>
            {level.title}
          </p>
        </div>
      )}
    </div>
  );
}
