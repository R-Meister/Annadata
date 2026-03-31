/**
 * Zustand store for quest state management.
 */

import { create } from 'zustand';
import type { Quest, FarmerQuest } from '@/lib/api';

// Demo quests for testing
const DEMO_QUESTS: Quest[] = [
    {
        id: 'q1', title: 'Start Composting Farm Waste', title_hi: 'खेत के कचरे से खाद बनाना शुरू करें',
        description: 'Set up a compost pit and start converting crop residues into organic compost.',
        category: 'organic', quest_type: 'weekly', difficulty: 1, xp_reward: 150,
        duration_days: 14, verification_type: 'photo', icon_url: '', is_active: true,
    },
    {
        id: 'q2', title: 'Switch to Bio-Pesticides', title_hi: 'जैव कीटनाशकों पर स्विच करें',
        description: 'Replace chemical pesticides with neem-based or Trichoderma-based bio-pesticides.',
        category: 'pest', quest_type: 'seasonal', difficulty: 3, xp_reward: 250,
        duration_days: 90, verification_type: 'photo', icon_url: '', is_active: true,
    },
    {
        id: 'q3', title: 'Install Drip Irrigation', title_hi: 'ड्रिप सिंचाई स्थापित करें',
        description: 'Set up drip irrigation on at least 0.5 acres to reduce water usage.',
        category: 'water', quest_type: 'epic', difficulty: 4, xp_reward: 400,
        duration_days: 30, verification_type: 'photo', icon_url: '', is_active: true,
    },
    {
        id: 'q4', title: 'Conduct Soil Test', title_hi: 'मिट्टी परीक्षण कराएं',
        description: 'Collect soil samples and get them tested. Upload the report.',
        category: 'soil', quest_type: 'weekly', difficulty: 2, xp_reward: 100,
        duration_days: 14, verification_type: 'photo', icon_url: '', is_active: true,
    },
    {
        id: 'q5', title: 'Plant Hedgerow Along Field Boundary', title_hi: 'खेत की सीमा पर बाड़ लगाएं',
        description: 'Plant native shrubs along your field boundary to support pollinators.',
        category: 'biodiversity', quest_type: 'seasonal', difficulty: 3, xp_reward: 300,
        duration_days: 60, verification_type: 'photo', icon_url: '', is_active: true,
    },
    {
        id: 'q6', title: 'Log Daily Water Usage for 7 Days', title_hi: '7 दिनों तक दैनिक पानी उपयोग दर्ज करें',
        description: 'Track how much water you use for irrigation each day for one week.',
        category: 'water', quest_type: 'daily', difficulty: 1, xp_reward: 75,
        duration_days: 7, verification_type: 'self_report', icon_url: '', is_active: true,
    },
];

const DEMO_ACTIVE: FarmerQuest[] = [
    {
        id: 'fq1', quest: DEMO_QUESTS[0], status: 'active',
        accepted_at: '2026-03-05T10:00:00Z', deadline: '2026-03-19T10:00:00Z',
        completed_at: null, proof_urls: null, steps_completed: { '1': true, '2': true, '3': false, '4': false },
        xp_awarded: 0,
    },
    {
        id: 'fq2', quest: DEMO_QUESTS[3], status: 'active',
        accepted_at: '2026-03-08T10:00:00Z', deadline: '2026-03-22T10:00:00Z',
        completed_at: null, proof_urls: null, steps_completed: { '1': true, '2': false, '3': false, '4': false },
        xp_awarded: 0,
    },
    {
        id: 'fq3', quest: DEMO_QUESTS[5], status: 'active',
        accepted_at: '2026-03-10T10:00:00Z', deadline: '2026-03-17T10:00:00Z',
        completed_at: null, proof_urls: null, steps_completed: { '1': true, '2': true, '3': false },
        xp_awarded: 0,
    },
];

interface QuestStore {
    quests: Quest[];
    activeQuests: FarmerQuest[];
    selectedCategory: string | null;
    isLoading: boolean;

    setQuests: (quests: Quest[]) => void;
    setActiveQuests: (active: FarmerQuest[]) => void;
    setCategory: (category: string | null) => void;
    setLoading: (loading: boolean) => void;
    loadDemoData: () => void;
}

export const useQuestStore = create<QuestStore>()((set) => ({
    quests: [],
    activeQuests: [],
    selectedCategory: null,
    isLoading: false,

    setQuests: (quests) => set({ quests }),
    setActiveQuests: (activeQuests) => set({ activeQuests }),
    setCategory: (selectedCategory) => set({ selectedCategory }),
    setLoading: (isLoading) => set({ isLoading }),
    loadDemoData: () => set({ quests: DEMO_QUESTS, activeQuests: DEMO_ACTIVE }),
}));
