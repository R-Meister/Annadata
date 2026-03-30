"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getLevelInfo,
  type SubscriptionTier,
  type Quest,
  DAILY_QUESTS,
  XP_ACTIONS,
} from "@/lib/gamification";

// ============================================================
// Types
// ============================================================

interface GameProgress {
  userId: string | null;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  tier: SubscriptionTier;
  completedQuests: string[];
  dailyActions: Record<string, number>; // action -> count today
  lastActionReset: string | null; // Date string for when actions were last reset
}

interface GameState extends GameProgress {
  // Computed
  level: number;
  levelTitle: string;
  levelTitleHi: string;
  levelBadge: string;
  xpToNextLevel: number;
  progressPercent: number;

  // UI State
  showXPBurst: boolean;
  lastXPEarned: number;
  showLevelUp: boolean;
  newLevelInfo: { level: number; title: string; badge: string } | null;

  // Actions
  setUserId: (userId: string) => void;
  addXP: (action: string, amount?: number) => { earned: number; levelUp: boolean };
  dailyCheckin: () => { earned: number; newStreak: number };
  completeQuest: (questId: string) => void;
  upgradeTier: (tier: SubscriptionTier) => void;
  dismissXPBurst: () => void;
  dismissLevelUp: () => void;
  resetDaily: () => void;
  reset: () => void;
  updateProgress: (data: {
    xp: number;
    level: number;
    levelTitle: string;
    levelBadge: string;
    streak: number;
    longestStreak: number;
    tier: SubscriptionTier;
  }) => void;
}

// ============================================================
// Initial State
// ============================================================

const initialProgress: GameProgress = {
  userId: null,
  xp: 0,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  tier: "free",
  completedQuests: [],
  dailyActions: {},
  lastActionReset: null,
};

// ============================================================
// Store
// ============================================================

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => {
      // Helper to compute level info
      const computeLevelInfo = (xp: number) => {
        const info = getLevelInfo(xp);
        return {
          level: info.level.number,
          levelTitle: info.level.title,
          levelTitleHi: info.level.titleHi,
          levelBadge: info.level.badge,
          xpToNextLevel: info.xpToNextLevel,
          progressPercent: info.progressPercent,
        };
      };

      // Get today's date string
      const getToday = () => new Date().toISOString().split("T")[0];

      return {
        ...initialProgress,
        ...computeLevelInfo(0),

        // UI State
        showXPBurst: false,
        lastXPEarned: 0,
        showLevelUp: false,
        newLevelInfo: null,

        setUserId: (userId) => set({ userId }),

        addXP: (action, amount) => {
          const state = get();
          const today = getToday();

          // Check if we need to reset daily actions
          if (state.lastActionReset !== today) {
            set({ dailyActions: {}, lastActionReset: today });
          }

          // Get XP config for action
          const xpConfig = XP_ACTIONS[action];
          const xpAmount = amount ?? xpConfig?.xp ?? 5;
          const maxDaily = xpConfig?.maxDaily ?? 999;

          // Check daily limit
          const currentCount = get().dailyActions[action] || 0;
          if (currentCount >= maxDaily) {
            return { earned: 0, levelUp: false };
          }

          // Calculate new state
          const oldLevel = getLevelInfo(state.xp).level.number;
          const newXP = state.xp + xpAmount;
          const newLevelInfo = getLevelInfo(newXP);
          const levelUp = newLevelInfo.level.number > oldLevel;

          set({
            xp: newXP,
            ...computeLevelInfo(newXP),
            dailyActions: {
              ...get().dailyActions,
              [action]: currentCount + 1,
            },
            showXPBurst: true,
            lastXPEarned: xpAmount,
            ...(levelUp
              ? {
                  showLevelUp: true,
                  newLevelInfo: {
                    level: newLevelInfo.level.number,
                    title: newLevelInfo.level.title,
                    badge: newLevelInfo.level.badge,
                  },
                }
              : {}),
          });

          return { earned: xpAmount, levelUp };
        },

        dailyCheckin: () => {
          const state = get();
          const today = getToday();

          // Already checked in today
          if (state.lastActiveDate === today) {
            return { earned: 0, newStreak: state.streak };
          }

          // Calculate streak
          let newStreak = 1;
          if (state.lastActiveDate) {
            const lastDate = new Date(state.lastActiveDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor(
              (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays === 1) {
              newStreak = state.streak + 1;
            }
          }

          const longestStreak = Math.max(newStreak, state.longestStreak);

          // Award XP
          const { earned } = get().addXP("daily_checkin");

          // Check for streak bonuses
          if (newStreak === 7) {
            get().addXP("streak_7_day");
          } else if (newStreak === 30) {
            get().addXP("streak_30_day");
          }

          set({
            streak: newStreak,
            longestStreak,
            lastActiveDate: today,
          });

          return { earned, newStreak };
        },

        completeQuest: (questId) => {
          const state = get();
          if (state.completedQuests.includes(questId)) return;

          const quest = DAILY_QUESTS.find((q) => q.id === questId);
          if (quest) {
            get().addXP("quest_complete", quest.xpReward);
          }

          set({
            completedQuests: [...state.completedQuests, questId],
          });
        },

        upgradeTier: (tier) => {
          const state = get();
          if (state.tier !== tier) {
            set({ tier });
            get().addXP("upgrade_premium");
          }
        },

        dismissXPBurst: () => set({ showXPBurst: false }),

        dismissLevelUp: () => set({ showLevelUp: false, newLevelInfo: null }),

        resetDaily: () => {
          set({
            dailyActions: {},
            lastActionReset: new Date().toISOString().split("T")[0],
            completedQuests: [],
          });
        },

        reset: () => {
          set({
            ...initialProgress,
            ...computeLevelInfo(0),
            showXPBurst: false,
            lastXPEarned: 0,
            showLevelUp: false,
            newLevelInfo: null,
          });
        },

        updateProgress: (data) => {
          const levelInfo = getLevelInfo(data.xp);
          set({
            xp: data.xp,
            level: levelInfo.level.number,
            levelTitle: levelInfo.level.title,
            levelTitleHi: levelInfo.level.titleHi,
            levelBadge: levelInfo.level.badge,
            xpToNextLevel: levelInfo.xpToNextLevel,
            progressPercent: levelInfo.progressPercent,
            streak: data.streak,
            longestStreak: data.longestStreak,
            tier: data.tier,
          });
        },
      };
    },
    {
      name: "krishi-quest-game",
      partialize: (state) => ({
        userId: state.userId,
        xp: state.xp,
        streak: state.streak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
        tier: state.tier,
        completedQuests: state.completedQuests,
        dailyActions: state.dailyActions,
        lastActionReset: state.lastActionReset,
      }),
    }
  )
);

// ============================================================
// Selectors
// ============================================================

export const selectIsQuestCompleted = (questId: string) => (state: GameState) =>
  state.completedQuests.includes(questId);

export const selectCanDoAction = (action: string) => (state: GameState) => {
  const xpConfig = XP_ACTIONS[action];
  if (!xpConfig) return true;
  const count = state.dailyActions[action] || 0;
  return count < xpConfig.maxDaily;
};

// Selector that returns just the completed quest IDs (stable reference)
export const selectCompletedQuests = (state: GameState) => state.completedQuests;

// Helper function to compute quests with status (use in component with useMemo)
export function getQuestsWithStatus(completedQuests: string[]) {
  return DAILY_QUESTS.map((quest) => ({
    ...quest,
    completed: completedQuests.includes(quest.id),
  }));
}
