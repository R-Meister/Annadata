"use client";

import { useGameStore } from "@/store/game-store";
import { useDemo, DEMO_FARMERS } from "@/hooks/use-demo";
import { getLevelInfo, formatXP, LEVELS } from "@/lib/gamification";
import { LevelBadge, StreakFire, ProgressRing } from "@/components/gamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MapPin,
  Wheat,
  Trophy,
  Zap,
  Calendar,
  RefreshCw,
  Crown,
  Settings,
} from "lucide-react";

/**
 * Profile Page - Farmer profile, achievements, stats
 */
export default function ProfilePage() {
  const { userId, resetDemoUser } = useDemo();
  const {
    xp,
    streak,
    longestStreak,
    tier,
    reset,
  } = useGameStore();

  const levelInfo = getLevelInfo(xp);

  // Use first demo farmer for profile
  const farmer = DEMO_FARMERS[0];

  // Calculate achievements
  const achievements = [
    {
      id: "first_checkin",
      title: "First Steps",
      description: "Complete your first check-in",
      icon: "🌱",
      unlocked: xp > 0,
    },
    {
      id: "streak_3",
      title: "Getting Started",
      description: "Maintain a 3-day streak",
      icon: "🔥",
      unlocked: longestStreak >= 3,
    },
    {
      id: "streak_7",
      title: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "⚡",
      unlocked: longestStreak >= 7,
    },
    {
      id: "level_5",
      title: "Rising Farmer",
      description: "Reach Level 5",
      icon: "🌿",
      unlocked: levelInfo.level.number >= 5,
    },
    {
      id: "level_10",
      title: "Smart Farmer",
      description: "Reach Level 10",
      icon: "🌾",
      unlocked: levelInfo.level.number >= 10,
    },
    {
      id: "xp_1000",
      title: "XP Hunter",
      description: "Earn 1,000 XP",
      icon: "💫",
      unlocked: xp >= 1000,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
              👨‍🌾
            </div>
            <div className="flex-grow">
              <h1 className="text-xl font-bold">{farmer.name}</h1>
              <div className="flex items-center gap-1 text-green-100 text-sm">
                <MapPin className="w-4 h-4" />
                <span>
                  {farmer.village}, {farmer.district}
                </span>
              </div>
            </div>
            <LevelBadge xp={xp} size="md" showTitle={false} />
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Wheat className="w-4 h-4 text-yellow-600" />
              <span className="text-gray-600">
                {farmer.land} acres • {farmer.crops.join(", ")}
              </span>
            </div>
            <Badge variant="secondary" className="capitalize">
              {tier} Plan
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* XP Card */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-16 h-16 mx-auto mb-2">
              <ProgressRing
                progress={levelInfo.progressPercent}
                size={64}
                strokeWidth={6}
              >
                <Zap className="w-6 h-6 text-yellow-500" />
              </ProgressRing>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{formatXP(xp)}</p>
            <p className="text-xs text-gray-500">Total XP</p>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card>
          <CardContent className="p-4 text-center">
            <StreakFire streak={streak} className="justify-center mb-2" />
            <p className="text-xs text-gray-500 mt-2">
              Best: {longestStreak} days
            </p>
          </CardContent>
        </Card>

        {/* Level Card */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-4xl mb-2">{levelInfo.level.badge}</div>
            <p className="font-semibold text-gray-800">
              Level {levelInfo.level.number}
            </p>
            <p className="text-xs text-gray-500">{levelInfo.level.title}</p>
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <p className="font-semibold text-gray-800">
              {unlockedCount}/{achievements.length}
            </p>
            <p className="text-xs text-gray-500">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Level progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{levelInfo.level.badge}</span>
            <div className="flex-grow">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
            <span className="text-2xl">
              {levelInfo.nextLevel?.badge || "✨"}
            </span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            {levelInfo.xpToNextLevel > 0
              ? `${formatXP(levelInfo.xpToNextLevel)} XP to ${levelInfo.nextLevel?.title}`
              : "Max level reached!"}
          </p>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`text-center p-3 rounded-xl transition-all ${
                  achievement.unlocked
                    ? "bg-yellow-50 border-2 border-yellow-200"
                    : "bg-gray-100 opacity-50"
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <p className="text-xs font-medium text-gray-700 truncate">
                  {achievement.title}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {tier === "free" && (
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <Crown className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
            <h3 className="font-bold mb-1">Unlock Premium</h3>
            <p className="text-purple-100 text-sm mb-4">
              Access all 11+ services & advanced features
            </p>
            <Button className="bg-white text-purple-600 hover:bg-purple-50">
              Upgrade - ₹49/month
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Demo controls */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gray-500">
            <Settings className="w-4 h-4" />
            Demo Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-gray-400">
            Demo ID: {userId?.substring(0, 20)}...
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Progress
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetDemoUser}
              className="flex-1"
            >
              New Demo User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
