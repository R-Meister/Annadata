"use client";

import { useMemo } from "react";
import { useGameStore, selectCompletedQuests, getQuestsWithStatus } from "@/store/game-store";
import { useGameSync } from "@/hooks/use-game-sync";
import { getLevelInfo, formatXP, DAILY_QUESTS } from "@/lib/gamification";
import {
  LevelBadge,
  StreakFire,
  ProgressRing,
  QuestCard,
} from "@/components/gamification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Sun, TrendingUp, Leaf } from "lucide-react";
import Link from "next/link";

/**
 * Home Page - Main dashboard for Krishi Quest
 * Shows level, XP, streak, daily check-in, and quick actions
 */
export default function HomePage() {
  const xp = useGameStore((state) => state.xp);
  const streak = useGameStore((state) => state.streak);
  const lastActiveDate = useGameStore((state) => state.lastActiveDate);
  const dailyCheckin = useGameStore((state) => state.dailyCheckin);
  const completedQuests = useGameStore(selectCompletedQuests);
  
  // Use backend sync for XP and check-in
  const { earnXP, checkin } = useGameSync();

  const quests = useMemo(() => getQuestsWithStatus(completedQuests), [completedQuests]);
  const levelInfo = getLevelInfo(xp);

  // Check if already checked in today
  const today = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = lastActiveDate === today;

  // Count completed quests
  const completedQuestsCount = quests.filter((q) => q.completed).length;

  const handleCheckin = async () => {
    if (!hasCheckedInToday) {
      const result = await checkin();
      if (result) {
        dailyCheckin(); // Also update local state
      }
    }
  };

  // Quick actions for demo
  const quickActions = [
    {
      icon: Sun,
      label: "Weather",
      labelHi: "मौसम",
      color: "bg-blue-100 text-blue-600",
      action: () => earnXP("weather_check"),
      href: "/game/service/mausam-chakra",
    },
    {
      icon: TrendingUp,
      label: "Prices",
      labelHi: "भाव",
      color: "bg-green-100 text-green-600",
      action: () => earnXP("market_check"),
      href: "/game/service/msp-mitra",
    },
    {
      icon: Leaf,
      label: "Crop Scan",
      labelHi: "फसल स्कैन",
      color: "bg-red-100 text-red-600",
      action: () => earnXP("disease_scan"),
      href: "/game/service/fasal-rakshak",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1">Welcome back!</h1>
            <p className="text-green-100 text-sm">
              Continue your farming journey
            </p>
          </div>
          <LevelBadge xp={xp} size="lg" showTitle={false} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Level card */}
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-3xl mb-1">{levelInfo.level.badge}</div>
            <p className="text-xs text-gray-500">Level {levelInfo.level.number}</p>
            <p className="text-xs font-medium text-gray-700 truncate">
              {levelInfo.level.title}
            </p>
          </CardContent>
        </Card>

        {/* XP card */}
        <Card className="text-center">
          <CardContent className="p-4">
            <ProgressRing
              progress={levelInfo.progressPercent}
              size={48}
              strokeWidth={4}
              className="mx-auto mb-1"
            >
              <Zap className="w-5 h-5 text-yellow-500" />
            </ProgressRing>
            <p className="text-sm font-bold text-yellow-600">{formatXP(xp)}</p>
            <p className="text-xs text-gray-500">XP</p>
          </CardContent>
        </Card>

        {/* Streak card */}
        <Card className="text-center">
          <CardContent className="p-4 flex flex-col items-center">
            <StreakFire streak={streak} className="scale-75" />
            <p className="text-xs text-gray-500 mt-1">Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily check-in */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Daily Check-in</h2>
              <p className="text-yellow-100 text-sm">
                {hasCheckedInToday
                  ? "You've checked in today!"
                  : "Check in to earn +10 XP"}
              </p>
            </div>
            <Button
              onClick={handleCheckin}
              disabled={hasCheckedInToday}
              variant={hasCheckedInToday ? "secondary" : "default"}
              className={
                hasCheckedInToday
                  ? "bg-white/20 text-white"
                  : "bg-white text-orange-600 hover:bg-orange-50"
              }
            >
              {hasCheckedInToday ? "Done ✓" : "Check In"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <button
                  onClick={action.action}
                  className={`w-full ${action.color} rounded-xl p-4 flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
                >
                  <Icon className="w-8 h-8" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Daily quests preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Today's Quests</h2>
          <Link
            href="/game/quests"
            className="text-sm text-green-600 font-medium"
          >
            See all →
          </Link>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
              style={{
                width: `${(completedQuestsCount / DAILY_QUESTS.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {completedQuestsCount}/{DAILY_QUESTS.length}
          </span>
        </div>

        {/* Quest list (first 3) */}
        <div className="space-y-2">
          {quests.slice(0, 3).map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      </div>
    </div>
  );
}
