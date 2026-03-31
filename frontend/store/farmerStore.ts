/**
 * Zustand store for farmer profile and gamification state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FarmerProfile, FarmerStats } from '@/lib/api';

interface FarmerStore {
    // State
    profile: FarmerProfile | null;
    stats: FarmerStats | null;
    isLoading: boolean;

    // Actions
    setProfile: (profile: FarmerProfile) => void;
    setStats: (stats: FarmerStats) => void;
    setLoading: (loading: boolean) => void;
    clearProfile: () => void;

    // Demo mode (for testing without backend)
    loadDemoProfile: () => void;
}

// Demo profile for testing
const DEMO_PROFILE: FarmerProfile = {
    id: 'demo-farmer-001',
    display_name: 'Rajesh Kumar',
    phone: '9876543210',
    village: 'Sundarpur',
    block: 'Sadar',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    primary_crop: 'Wheat',
    farm_size_acres: 3.5,
    total_xp: 2750,
    current_level: 3,
    level_name: 'Sapling',
    sustainability_score: 420,
    current_streak: 12,
    longest_streak: 18,
    last_active_date: new Date().toISOString().split('T')[0],
    preferred_language: 'hi',
    avatar_url: '',
    is_onboarded: true,
    created_at: '2025-06-15T10:00:00Z',
};

const DEMO_STATS: FarmerStats = {
    total_xp: 2750,
    current_level: 3,
    level_name: 'Sapling',
    sustainability_score: 420,
    current_streak: 12,
    longest_streak: 18,
    quests_completed: 14,
    quests_active: 3,
    badges_earned: 4,
    rank_village: 3,
    rank_district: 47,
    rank_state: null,
    xp_to_next_level: 750,
};

export const useFarmerStore = create<FarmerStore>()(
    persist(
        (set) => ({
            profile: null,
            stats: null,
            isLoading: false,

            setProfile: (profile) => set({ profile }),
            setStats: (stats) => set({ stats }),
            setLoading: (isLoading) => set({ isLoading }),
            clearProfile: () => set({ profile: null, stats: null }),

            loadDemoProfile: () =>
                set({
                    profile: DEMO_PROFILE,
                    stats: DEMO_STATS,
                }),
        }),
        { name: 'gamified-farmer-store' }
    )
);
