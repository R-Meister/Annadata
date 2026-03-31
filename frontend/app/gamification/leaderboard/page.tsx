'use client';

import { useState } from 'react';
import { Trophy, MapPin, TrendingUp } from 'lucide-react';

const SCOPES = [
    { key: 'village', label: 'Village' },
    { key: 'block', label: 'Block' },
    { key: 'district', label: 'District' },
    { key: 'state', label: 'State' },
    { key: 'national', label: 'National' },
];

const DEMO_ENTRIES = [
    { rank: 1, name: 'Vijay Sharma', village: 'Rampur', xp: 8450, level: 5, level_name: 'Mature Tree', isSelf: false },
    { rank: 2, name: 'Anita Devi', village: 'Sundarpur', xp: 6200, level: 4, level_name: 'Young Tree', isSelf: false },
    { rank: 3, name: 'Rajesh Kumar', village: 'Sundarpur', xp: 2750, level: 3, level_name: 'Sapling', isSelf: true },
    { rank: 4, name: 'Mahesh Singh', village: 'Kamalpur', xp: 2100, level: 3, level_name: 'Sapling', isSelf: false },
    { rank: 5, name: 'Sunita Kumari', village: 'Rampur', xp: 1800, level: 2, level_name: 'Sprout', isSelf: false },
    { rank: 6, name: 'Ravi Verma', village: 'Sundarpur', xp: 1450, level: 2, level_name: 'Sprout', isSelf: false },
    { rank: 7, name: 'Lakshmi Bai', village: 'Kamalpur', xp: 900, level: 2, level_name: 'Sprout', isSelf: false },
    { rank: 8, name: 'Dinesh Patel', village: 'Gopalnagar', xp: 650, level: 1, level_name: 'Seedling', isSelf: false },
];

const PODIUM_COLORS = ['from-yellow-500/20 to-yellow-600/5', 'from-slate-400/20 to-slate-500/5', 'from-amber-700/20 to-amber-800/5'];
const PODIUM_BORDER = ['border-yellow-500/50', 'border-slate-400/50', 'border-amber-700/50'];
const CROWN = ['👑', '🥈', '🥉'];

export default function LeaderboardPage() {
    const [scope, setScope] = useState('village');

    return (
        <div className="space-y-6 animate-count-up">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy size={22} className="text-xp-400" /> Leaderboard
            </h1>

            {/* Scope Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-card-dark)]">
                {SCOPES.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setScope(key)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${scope === key ? 'bg-primary-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Podium — Top 3 */}
            <div className="grid grid-cols-3 gap-2 items-end">
                {[1, 0, 2].map((podiumIdx) => {
                    const entry = DEMO_ENTRIES[podiumIdx];
                    if (!entry) return null;
                    const isFirst = podiumIdx === 0;
                    return (
                        <div
                            key={entry.rank}
                            className={`flex flex-col items-center glass-card bg-gradient-to-b ${PODIUM_COLORS[podiumIdx]} border ${PODIUM_BORDER[podiumIdx]} ${isFirst ? 'pb-6' : 'pb-4'}`}
                        >
                            <span className="text-2xl mb-1">{CROWN[podiumIdx]}</span>
                            <div className={`w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-white mb-1 ${isFirst ? 'ring-2 ring-yellow-500/50' : ''}`}>
                                {entry.name.charAt(0)}
                            </div>
                            <span className={`text-xs font-semibold text-white ${isFirst ? 'text-sm' : ''}`}>{entry.name.split(' ')[0]}</span>
                            <span className="text-[10px] text-slate-400">{entry.village}</span>
                            <span className="text-xs font-bold text-xp-400 mt-1">{entry.xp.toLocaleString()} XP</span>
                        </div>
                    );
                })}
            </div>

            {/* Rankings List */}
            <div className="space-y-2">
                {DEMO_ENTRIES.slice(3).map((entry) => (
                    <div
                        key={entry.rank}
                        className={`glass-card flex items-center gap-3 !py-3 ${entry.isSelf ? 'ring-1 ring-primary-500/30 bg-primary-500/5' : ''}`}
                    >
                        <span className={`w-8 text-center text-sm font-bold ${entry.isSelf ? 'text-primary-400' : 'text-slate-400'}`}>
                            #{entry.rank}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                            {entry.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${entry.isSelf ? 'text-primary-300' : 'text-white'}`}>{entry.name}</span>
                                {entry.isSelf && <span className="text-[10px] bg-primary-500/20 text-primary-300 px-1.5 py-0.5 rounded">You</span>}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <MapPin size={10} /> {entry.village}
                                <span className="text-primary-400/60">Lv.{entry.level} {entry.level_name}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-xp-400">{entry.xp.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500 block">XP</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
