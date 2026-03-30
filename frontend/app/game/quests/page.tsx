"use client";

import { useMemo } from "react";
import { useGameStore, selectCompletedQuests, getQuestsWithStatus } from "@/store/game-store";
import { DAILY_QUESTS, WEEKLY_CHALLENGES } from "@/lib/gamification";
import { QuestCard } from "@/components/gamification";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Calendar, Star, Zap } from "lucide-react";

/**
 * Quests Page - Daily and weekly challenges
 */
export default function QuestsPage() {
  const completedQuestIds = useGameStore(selectCompletedQuests);
  const completeQuest = useGameStore((state) => state.completeQuest);

  const quests = useMemo(() => getQuestsWithStatus(completedQuestIds), [completedQuestIds]);

  // Count daily completed
  const dailyCompleted = quests.filter((q) => q.completed).length;
  const totalXPEarned = quests
    .filter((q) => q.completed)
    .reduce((sum, q) => sum + q.xpReward, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Quests</h1>
        <p className="text-gray-500">Complete tasks to earn XP rewards</p>
      </div>

      {/* Daily progress summary */}
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-yellow-100 text-sm">Today&apos;s Progress</p>
                <p className="text-2xl font-bold">
                  {dailyCompleted}/{DAILY_QUESTS.length} Quests
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-yellow-100 text-sm">XP Earned</p>
              <div className="flex items-center gap-1">
                <Zap className="w-5 h-5" />
                <span className="text-xl font-bold">{totalXPEarned}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{
                width: `${(dailyCompleted / DAILY_QUESTS.length) * 100}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Daily quests */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-green-500" />
          <h2 className="font-semibold text-gray-800">Daily Quests</h2>
          <Badge variant="secondary" className="text-xs">
            Resets at midnight
          </Badge>
        </div>
        <div className="space-y-3">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={() => completeQuest(quest.id)}
            />
          ))}
        </div>
      </section>

      {/* Weekly challenges */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-purple-500" />
          <h2 className="font-semibold text-gray-800">Weekly Challenges</h2>
          <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
            Bonus XP
          </Badge>
        </div>
        <div className="space-y-3">
          {WEEKLY_CHALLENGES.map((challenge) => {
            const isCompleted = completedQuestIds.includes(challenge.id);
            return (
              <QuestCard
                key={challenge.id}
                quest={{ ...challenge, completed: isCompleted } as any}
                onComplete={() => completeQuest(challenge.id)}
              />
            );
          })}
        </div>
      </section>

      {/* Tip card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <p className="font-medium text-blue-800 mb-1">Pro Tip</p>
            <p className="text-sm text-blue-600">
              Complete all daily quests to maximize your XP. Maintaining a 7-day
              streak earns you a 100 XP bonus!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
