"use client";

import { useEffect, useCallback } from "react";
import { useGameStore } from "@/store/game-store";
import { gamificationService, type EarnXPResponse } from "@/lib/api";
import { useDemo } from "./use-demo";

/**
 * Hook to sync game state with backend API.
 * Fetches initial progress and provides methods to update backend.
 */
export function useGameSync() {
  const { userId, isLoading: isDemoLoading } = useDemo();
  const updateProgress = useGameStore((state) => state.updateProgress);
  const addXP = useGameStore((state) => state.addXP);

  // Fetch and sync progress from backend on mount
  useEffect(() => {
    if (!userId || isDemoLoading) return;

    const syncProgress = async () => {
      try {
        const progress = await gamificationService.getProgress(userId);
        updateProgress({
          xp: progress.current_xp,
          level: progress.current_level,
          levelTitle: progress.level_title,
          levelBadge: progress.level_badge,
          streak: progress.current_streak,
          longestStreak: progress.longest_streak,
          tier: progress.subscription_tier as "free" | "premium" | "enterprise",
        });
      } catch (error) {
        console.error("Failed to sync progress:", error);
        // Continue with local state if backend fails
      }
    };

    syncProgress();
  }, [userId, isDemoLoading, updateProgress]);

  // Award XP via backend API
  const earnXPFromBackend = useCallback(
    async (action: string, metadata?: Record<string, any>): Promise<EarnXPResponse | null> => {
      if (!userId) return null;

      try {
        const result = await gamificationService.earnXP(userId, action, metadata);
        
        // Update local state with backend response
        if (result.xp_earned > 0) {
          addXP(action, result.xp_earned);
        }

        return result;
      } catch (error) {
        console.error("Failed to earn XP:", error);
        // Fall back to local XP award
        addXP(action);
        return null;
      }
    },
    [userId, addXP]
  );

  // Daily check-in via backend
  const checkinFromBackend = useCallback(async () => {
    if (!userId) return null;

    try {
      const result = await gamificationService.checkin(userId);
      return result;
    } catch (error) {
      console.error("Failed to check in:", error);
      return null;
    }
  }, [userId]);

  return {
    userId,
    isLoading: isDemoLoading,
    earnXP: earnXPFromBackend,
    checkin: checkinFromBackend,
  };
}
