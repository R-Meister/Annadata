'use client';

import { useEffect } from 'react';
import { Settings, LogOut, Gift, MapPin, Wheat, Ruler } from 'lucide-react';
import { useFarmerStore } from '@/store/farmerStore';
import Link from 'next/link';

const ALL_BADGES = [
    { type: 'first_seed', name: 'First Seed', emoji: '🌱', earned: true },
    { type: 'water_warrior', name: 'Water Warrior', emoji: '💧', earned: true },
    { type: 'pest_prodigy', name: 'Pest Prodigy', emoji: '🐛', earned: false },
    { type: 'soil_scientist', name: 'Soil Scientist', emoji: '🧪', earned: true },
    { type: 'organic_pioneer', name: 'Organic Pioneer', emoji: '🌿', earned: false },
    { type: 'community_champion', name: 'Community Champion', emoji: '🤝', earned: true },
    { type: 'knowledge_keeper', name: 'Knowledge Keeper', emoji: '📚', earned: false },
    { type: 'streak_master', name: 'Streak Master', emoji: '🔥', earned: false },
    { type: 'panchayat_pride', name: 'Panchayat Pride', emoji: '🏅', earned: false },
    { type: 'eco_warrior', name: 'Eco Warrior', emoji: '🌍', earned: false },
];

export default function ProfilePage() {
    const { profile, stats, loadDemoProfile } = useFarmerStore();

    useEffect(() => {
        if (!profile) loadDemoProfile();
    }, [profile, loadDemoProfile]);

    if (!profile || !stats) return null;

    const earnedCount = ALL_BADGES.filter((b) => b.earned).length;

    return (
        <div className="space-y-6 animate-count-up">
            {/* Profile Card */}
            <div className="glass-card text-center">
                <div className="relative inline-block mb-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-3xl font-bold text-white">
                        {profile.display_name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-primary-500 text-[10px] font-bold text-white">
                        Lv.{profile.current_level}
                    </div>
                </div>
                <h2 className="text-xl font-bold text-white">{profile.display_name}</h2>
                <p className="text-sm text-primary-400">{profile.level_name}</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-400">
                    <MapPin size={12} /> {profile.village}, {profile.district}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Total XP', value: stats.total_xp.toLocaleString(), sub: 'experience points', gradient: 'from-xp-500/20 to-xp-600/5' },
                    { label: 'Quests Done', value: stats.quests_completed, sub: `${stats.quests_active} active`, gradient: 'from-green-500/20 to-green-600/5' },
                    { label: 'Streak', value: `${stats.current_streak} days`, sub: `Best: ${stats.longest_streak}d`, gradient: 'from-orange-500/20 to-orange-600/5' },
                    { label: 'Badges', value: `${earnedCount}/${ALL_BADGES.length}`, sub: 'collected', gradient: 'from-purple-500/20 to-purple-600/5' },
                ].map(({ label, value, sub, gradient }) => (
                    <div key={label} className={`glass-card bg-gradient-to-br ${gradient}`}>
                        <span className="text-xs text-slate-400">{label}</span>
                        <p className="text-lg font-bold text-white">{value}</p>
                        <span className="text-[10px] text-slate-500">{sub}</span>
                    </div>
                ))}
            </div>

            {/* Farm Info */}
            <div className="glass-card">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Farm Details</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                        <Wheat size={16} className="text-primary-400" />
                        <span className="text-slate-400">Primary Crop</span>
                        <span className="ml-auto text-white font-medium">{profile.primary_crop}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Ruler size={16} className="text-primary-400" />
                        <span className="text-slate-400">Farm Size</span>
                        <span className="ml-auto text-white font-medium">{profile.farm_size_acres} acres</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <MapPin size={16} className="text-primary-400" />
                        <span className="text-slate-400">Location</span>
                        <span className="ml-auto text-white font-medium">{profile.state}</span>
                    </div>
                </div>
            </div>

            {/* Badge Gallery */}
            <div className="glass-card">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    Badge Gallery <span className="text-xs text-slate-500">({earnedCount}/{ALL_BADGES.length})</span>
                </h3>
                <div className="grid grid-cols-5 gap-3">
                    {ALL_BADGES.map((badge) => (
                        <div
                            key={badge.type}
                            className={`flex flex-col items-center gap-1 ${badge.earned ? '' : 'opacity-30 grayscale'}`}
                            title={badge.name}
                        >
                            {/* Placeholder for badge SVG — will be replaced with actual badge icons */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${badge.earned ? 'bg-primary-500/20 ring-2 ring-primary-500/30' : 'bg-slate-700/50'
                                }`}>
                                {badge.emoji}
                            </div>
                            <span className="text-[8px] text-slate-400 text-center leading-tight">{badge.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
                <Link href="/gamification/rewards" className="glass-card flex items-center gap-3 !py-3 hover:bg-[var(--color-card-hover)] transition-colors">
                    <Gift size={18} className="text-xp-400" />
                    <span className="text-sm text-white">Rewards & Incentives</span>
                    <span className="ml-auto text-xs text-slate-500">→</span>
                </Link>
                <button className="w-full glass-card flex items-center gap-3 !py-3 hover:bg-[var(--color-card-hover)] transition-colors">
                    <Settings size={18} className="text-slate-400" />
                    <span className="text-sm text-white">Settings</span>
                    <span className="ml-auto text-xs text-slate-500">→</span>
                </button>
                <button className="w-full glass-card flex items-center gap-3 !py-3 hover:bg-red-500/10 transition-colors">
                    <LogOut size={18} className="text-red-400" />
                    <span className="text-sm text-red-400">Logout</span>
                </button>
            </div>
        </div>
    );
}
