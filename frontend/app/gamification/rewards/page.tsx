'use client';

import { useEffect } from 'react';
import { Gift, Lock, CheckCircle2, Clock } from 'lucide-react';
import { useFarmerStore } from '@/store/farmerStore';

const REWARDS = [
    { type: 'soil_testing_voucher', name: 'Free Soil Testing Voucher', desc: 'Get one free soil test at any government lab', tier: 'bronze', xp_cost: 500, emoji: '🧪' },
    { type: 'training_credits', name: 'Training Workshop Credits', desc: 'Attend a sustainable farming workshop for free', tier: 'silver', xp_cost: 1500, emoji: '📚' },
    { type: 'scheme_eligibility', name: 'Scheme Eligibility Points', desc: 'Boost your points for PM-KISAN and other schemes', tier: 'gold', xp_cost: 3000, emoji: '📋' },
    { type: 'public_recognition', name: 'Gram Sabha Recognition', desc: 'Public recognition and certificate at Gram Sabha', tier: 'platinum', xp_cost: 6000, emoji: '🏛️' },
    { type: 'subsidized_access', name: 'Priority Equipment Access', desc: 'Priority access to subsidized seeds and equipment', tier: 'diamond', xp_cost: 10000, emoji: '🚜' },
    { type: 'featured_farmer', name: 'Featured Farmer Profile', desc: 'Featured profile with media coverage opportunity', tier: 'legend', xp_cost: 25000, emoji: '⭐' },
];

const TIER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    bronze: { bg: 'bg-amber-700/15', border: 'border-amber-700/30', text: 'text-amber-600' },
    silver: { bg: 'bg-slate-400/15', border: 'border-slate-400/30', text: 'text-slate-300' },
    gold: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    platinum: { bg: 'bg-cyan-400/15', border: 'border-cyan-400/30', text: 'text-cyan-300' },
    diamond: { bg: 'bg-blue-400/15', border: 'border-blue-400/30', text: 'text-blue-300' },
    legend: { bg: 'bg-purple-400/15', border: 'border-purple-400/30', text: 'text-purple-300' },
};

const DEMO_HISTORY = [
    { name: 'Free Soil Testing Voucher', tier: 'bronze', date: 'Feb 15, 2026', status: 'fulfilled' },
    { name: 'Training Workshop Credits', tier: 'silver', date: 'Jan 20, 2026', status: 'pending' },
];

export default function RewardsPage() {
    const { profile, loadDemoProfile } = useFarmerStore();

    useEffect(() => {
        if (!profile) loadDemoProfile();
    }, [profile, loadDemoProfile]);

    const totalXp = profile?.total_xp ?? 0;

    return (
        <div className="space-y-6 animate-count-up">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Gift size={22} className="text-xp-400" /> Rewards
                </h1>
                <div className="px-3 py-1 rounded-full gradient-xp text-xs font-bold text-slate-900">
                    {totalXp.toLocaleString()} XP
                </div>
            </div>

            {/* Rewards Catalog */}
            <div className="space-y-3">
                {REWARDS.map((reward) => {
                    const available = totalXp >= reward.xp_cost;
                    const colors = TIER_COLORS[reward.tier] || TIER_COLORS.bronze;
                    return (
                        <div
                            key={reward.type}
                            className={`glass-card border ${colors.border} ${available ? '' : 'opacity-60'}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-2xl shrink-0`}>
                                    {reward.emoji}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-semibold text-white">{reward.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} capitalize font-medium`}>
                                            {reward.tier}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2">{reward.desc}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-xp-400">{reward.xp_cost.toLocaleString()} XP</span>
                                        <button
                                            disabled={!available}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${available
                                                    ? 'gradient-primary text-white hover:opacity-90'
                                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {available ? 'Redeem' : <span className="flex items-center gap-1"><Lock size={10} /> Locked</span>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Progress to unlock */}
                            {!available && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                        <span>{totalXp.toLocaleString()} / {reward.xp_cost.toLocaleString()} XP</span>
                                        <span>{Math.round((totalXp / reward.xp_cost) * 100)}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-700 rounded-full">
                                        <div className="h-full rounded-full gradient-xp" style={{ width: `${Math.min((totalXp / reward.xp_cost) * 100, 100)}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Redemption History */}
            <div>
                <h2 className="text-sm font-semibold text-slate-300 mb-3">Redemption History</h2>
                {DEMO_HISTORY.length > 0 ? (
                    <div className="space-y-2">
                        {DEMO_HISTORY.map((item, i) => (
                            <div key={i} className="glass-card flex items-center gap-3 !py-3">
                                {item.status === 'fulfilled' ? (
                                    <CheckCircle2 size={18} className="text-green-400" />
                                ) : (
                                    <Clock size={18} className="text-yellow-400" />
                                )}
                                <div className="flex-1">
                                    <span className="text-sm text-white">{item.name}</span>
                                    <span className="text-[10px] text-slate-500 block">{item.date}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${item.status === 'fulfilled' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 text-center py-6">No redemptions yet</p>
                )}
            </div>
        </div>
    );
}
