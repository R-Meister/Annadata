'use client';

import { useEffect } from 'react';
import { Flame, TrendingUp, Trophy, Target, Lightbulb } from 'lucide-react';
import { useFarmerStore } from '@/store/farmerStore';
import { useQuestStore } from '@/store/questStore';
import Link from 'next/link';

const CATEGORY_COLORS: Record<string, string> = {
    water: 'border-[var(--color-cat-water)]',
    soil: 'border-[var(--color-cat-soil)]',
    organic: 'border-[var(--color-cat-organic)]',
    biodiversity: 'border-[var(--color-cat-biodiversity)]',
    pest: 'border-[var(--color-cat-pest)]',
    rotation: 'border-[var(--color-cat-rotation)]',
    energy: 'border-[var(--color-cat-energy)]',
    community: 'border-[var(--color-cat-community)]',
};

const CATEGORY_BG: Record<string, string> = {
    water: 'gradient-card-water',
    soil: 'gradient-card-soil',
    organic: 'gradient-card-organic',
    biodiversity: 'gradient-card-biodiversity',
    pest: 'gradient-card-pest',
    rotation: 'gradient-card-rotation',
    energy: 'gradient-card-energy',
    community: 'gradient-card-community',
};

const CATEGORY_EMOJI: Record<string, string> = {
    water: '💧', soil: '🧪', organic: '🌿', biodiversity: '🦋',
    pest: '🐛', rotation: '🔄', energy: '⚡', community: '🤝',
};

export default function DashboardPage() {
    const { profile, stats, loadDemoProfile } = useFarmerStore();
    const { activeQuests, loadDemoData } = useQuestStore();

    useEffect(() => {
        if (!profile) loadDemoProfile();
        if (activeQuests.length === 0) loadDemoData();
    }, [profile, activeQuests.length, loadDemoProfile, loadDemoData]);

    if (!profile || !stats) return null;

    const levelProgress = stats.xp_to_next_level > 0
        ? ((stats.total_xp) / (stats.total_xp + stats.xp_to_next_level)) * 100
        : 100;

    return (
        <div className="space-y-6 animate-count-up">
            {/* Greeting + Level */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm">Namaste 🙏</p>
                    <h1 className="text-2xl font-bold text-white">{profile.display_name}</h1>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/15 border border-primary-500/30">
                    <span className="text-sm">🌱</span>
                    <span className="text-sm font-semibold text-primary-400">Lv.{profile.current_level}</span>
                    <span className="text-xs text-slate-400">{profile.level_name}</span>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div className="glass-card">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">XP Progress</span>
                    <span className="text-sm font-semibold text-xp-400">{stats.total_xp.toLocaleString()} XP</span>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full gradient-xp transition-all duration-1000 ease-out"
                        style={{ width: `${levelProgress}%` }}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-1">{stats.xp_to_next_level} XP to Level {profile.current_level + 1}</p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { icon: <TrendingUp size={18} />, label: 'Score', value: stats.sustainability_score, color: 'text-primary-400' },
                    { icon: <Flame size={18} />, label: 'Streak', value: `${stats.current_streak}d`, color: 'text-orange-400' },
                    { icon: <Trophy size={18} />, label: 'Rank', value: `#${stats.rank_village ?? '-'}`, color: 'text-xp-400' },
                    { icon: <Target size={18} />, label: 'Quests', value: stats.quests_completed, color: 'text-cyan-400' },
                ].map(({ icon, label, value, color }) => (
                    <div key={label} className="glass-card flex flex-col items-center gap-1 !p-3">
                        <span className={color}>{icon}</span>
                        <span className="text-lg font-bold text-white">{value}</span>
                        <span className="text-[10px] text-slate-500">{label}</span>
                    </div>
                ))}
            </div>

            {/* Sustainability Score Donut */}
            <div className="glass-card">
                <h2 className="text-sm font-semibold text-slate-300 mb-4">Sustainability Score</h2>
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border-dark)" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="42"
                                fill="none" stroke="var(--color-primary-500)" strokeWidth="8"
                                strokeDasharray={`${(stats.sustainability_score / 1000) * 264} 264`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-white">{stats.sustainability_score}</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        {[
                            { label: 'Water', pct: 65, color: 'bg-blue-500' },
                            { label: 'Soil', pct: 45, color: 'bg-amber-700' },
                            { label: 'Organic', pct: 70, color: 'bg-green-500' },
                            { label: 'Biodiversity', pct: 30, color: 'bg-purple-500' },
                        ].map(({ label, pct, color }) => (
                            <div key={label}>
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>{label}</span><span>{pct}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-700 rounded-full">
                                    <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Quests */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-300">Active Quests</h2>
                    <Link href="/gamification/quests" className="text-xs text-primary-400 hover:underline">View All</Link>
                </div>
                <div className="space-y-3">
                    {activeQuests.slice(0, 3).map((fq) => {
                        const stepsTotal = fq.steps_completed ? Object.keys(fq.steps_completed).length : 0;
                        const stepsDone = fq.steps_completed ? Object.values(fq.steps_completed).filter(Boolean).length : 0;
                        const progress = stepsTotal > 0 ? (stepsDone / stepsTotal) * 100 : 0;

                        return (
                            <Link key={fq.id} href={`/gamification/quests/${fq.quest.id}`}>
                                <div className={`glass-card border-l-4 ${CATEGORY_COLORS[fq.quest.category] || 'border-slate-500'} ${CATEGORY_BG[fq.quest.category] || ''} hover:scale-[1.01] transition-transform cursor-pointer`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{CATEGORY_EMOJI[fq.quest.category] || '📋'}</span>
                                                <span className="text-sm font-semibold text-white">{fq.quest.title}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                <span className="px-2 py-0.5 rounded-full bg-slate-700/50">{fq.quest.quest_type}</span>
                                                <span className="text-xp-400 font-medium">+{fq.quest.xp_reward} XP</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                            <span>{stepsDone}/{stepsTotal} steps</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-700 rounded-full">
                                            <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Daily Tip */}
            <div className="glass-card border border-primary-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-primary-500/15">
                        <Lightbulb size={20} className="text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-primary-300 mb-1">Daily Tip 💡</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Apply neem cake at 250kg/acre during land preparation. It enriches the soil,
                            controls nematodes, and acts as a natural pest repellent. Your wheat crop will thank you!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
