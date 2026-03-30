"use client";

import { cn } from "@/lib/utils";
import { type Quest } from "@/lib/gamification";
import { useGameStore, selectIsQuestCompleted } from "@/store/game-store";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

interface QuestCardProps {
  quest: Quest;
  onComplete?: () => void;
  className?: string;
}

/**
 * Quest Card Component - Shows a single quest with progress
 */
export function QuestCard({ quest, onComplete, className }: QuestCardProps) {
  const isCompleted = useGameStore(selectIsQuestCompleted(quest.id));

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
        isCompleted
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200 hover:border-green-300 hover:shadow-md cursor-pointer",
        className
      )}
      onClick={() => !isCompleted && onComplete?.()}
    >
      {/* Status icon */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        ) : (
          <Circle className="w-8 h-8 text-gray-300" />
        )}
      </div>

      {/* Quest info */}
      <div className="flex-grow min-w-0">
        <h3
          className={cn(
            "font-semibold truncate",
            isCompleted ? "text-green-700" : "text-gray-800"
          )}
        >
          {quest.title}
        </h3>
        <p
          className={cn(
            "text-sm truncate",
            isCompleted ? "text-green-600" : "text-gray-500"
          )}
        >
          {quest.description}
        </p>
      </div>

      {/* XP reward */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold",
          isCompleted
            ? "bg-green-200 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        )}
      >
        <Sparkles className="w-4 h-4" />
        <span>{quest.xpReward} XP</span>
      </div>
    </div>
  );
}
