'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useQuestStore } from '@/store/questStore';
import Link from 'next/link';

const CATEGORIES = [
    { key: null, label: 'All', emoji: '📋' },
    { key: 'water', label: 'Water', emoji: '💧' },
    { key: 'soil', label: 'Soil', emoji: '🧪' },
    { key: 'organic', label: 'Organic', emoji: '🌿' },
    { key: 'biodiversity', label: 'Biodiversity', emoji: '🦋' },
    { key: 'pest', label: 'Pest', emoji: '🐛' },
    { key: 'rotation', label: 'Rotation', emoji: '🔄' },
    { key: 'community', label: 'Community', emoji: '🤝' },
];

const CATEGORY_BORDER: Record<string, string> = {
    water: 'border-l-blue-500', soil: 'border-l-amber-700', organic: 'border-l-green-500',
    biodiversity: 'border-l-purple-500', pest: 'border-l-red-500', rotation: 'border-l-orange-500',
    energy: 'border-l-yellow-500', community: 'border-l-cyan-500',
};

const DIFFICULTY_STARS = (d: number) => '★'.repeat(d) + '☆'.repeat(5 - d);

const QUEST_TYPE_BADGE: Record<string, { label: string; color: string }> = {
    daily: { label: 'Daily', color: 'bg-blue-500/20 text-blue-300' },
    weekly: { label: 'Weekly', color: 'bg-green-500/20 text-green-300' },
    seasonal: { label: 'Seasonal', color: 'bg-orange-500/20 text-orange-300' },
    epic: { label: 'Epic', color: 'bg-purple-500/20 text-purple-300' },
    community: { label: 'Community', color: 'bg-cyan-500/20 text-cyan-300' },
};

export default function QuestsPage() {
    const { quests, selectedCategory, setCategory, loadDemoData } = useQuestStore();
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (quests.length === 0) loadDemoData();
    }, [quests.length, loadDemoData]);

    const filtered = quests.filter((q) => {
        if (selectedCategory && q.category !== selectedCategory) return false;
        if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-5 animate-count-up">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Quests</h1>
                <span className="text-xs text-slate-400">{filtered.length} available</span>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search quests..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--color-card-dark)] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map(({ key, label, emoji }) => (
                    <button
                        key={label}
                        onClick={() => setCategory(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === key
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        <span>{emoji}</span> {label}
                    </button>
                ))}
            </div>

            {/* AI Recommended Section */}
            <div>
                <h2 className="text-sm font-semibold text-primary-400 mb-3 flex items-center gap-2">
                    <span>✨</span> Recommended for You
                </h2>
                <div className="space-y-3">
                    {filtered.slice(0, 2).map((quest) => (
                        <Link key={quest.id} href={`/gamification/quests/${quest.id}`}>
                            <QuestCard quest={quest} recommended />
                        </Link>
                    ))}
                </div>
            </div>

            {/* All Quests */}
            <div>
                <h2 className="text-sm font-semibold text-slate-300 mb-3">All Quests</h2>
                <div className="space-y-3">
                    {filtered.map((quest) => (
                        <Link key={quest.id} href={`/gamification/quests/${quest.id}`}>
                            <QuestCard quest={quest} />
                        </Link>
                    ))}
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        {/* Placeholder for empty_quests.svg */}
                        <span className="text-4xl mb-3 block">🌾</span>
                        <p className="text-slate-400 text-sm">No quests found. Try a different filter!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function QuestCard({ quest, recommended = false }: { quest: { id: string; title: string; description: string; category: string; quest_type: string; difficulty: number; xp_reward: number; duration_days: number }; recommended?: boolean }) {
    const typeBadge = QUEST_TYPE_BADGE[quest.quest_type] || { label: quest.quest_type, color: 'bg-slate-500/20 text-slate-300' };
    return (
        <div className={`glass-card border-l-4 ${CATEGORY_BORDER[quest.category] || 'border-l-slate-500'} hover:scale-[1.01] transition-all cursor-pointer ${recommended ? 'ring-1 ring-primary-500/20' : ''}`}>
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-white flex-1 pr-2">{quest.title}</h3>
                <span className="text-sm font-bold text-xp-400 whitespace-nowrap">+{quest.xp_reward} XP</span>
            </div>
            <p className="text-xs text-slate-400 mb-3 line-clamp-2">{quest.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeBadge.color}`}>{typeBadge.label}</span>
                <span className="text-[10px] text-amber-400">{DIFFICULTY_STARS(quest.difficulty)}</span>
                <span className="text-[10px] text-slate-500">{quest.duration_days}d</span>
                {recommended && <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-500/20 text-primary-300">✨ AI Pick</span>}
            </div>
        </div>
    );
}
