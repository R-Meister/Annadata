/**
 * API client for the Gamified Platform backend.
 */

const API_BASE = '/api/gamification';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `API error: ${res.status}`);
    }
    return res.json();
}

// ========================
// Profile
// ========================

export interface FarmerProfile {
    id: string;
    display_name: string;
    phone: string;
    village: string;
    block: string;
    district: string;
    state: string;
    primary_crop: string;
    farm_size_acres: number;
    total_xp: number;
    current_level: number;
    level_name: string;
    sustainability_score: number;
    current_streak: number;
    longest_streak: number;
    last_active_date: string | null;
    preferred_language: string;
    avatar_url: string;
    is_onboarded: boolean;
    created_at: string;
}

export interface FarmerStats {
    total_xp: number;
    current_level: number;
    level_name: string;
    sustainability_score: number;
    current_streak: number;
    longest_streak: number;
    quests_completed: number;
    quests_active: number;
    badges_earned: number;
    rank_village: number | null;
    rank_district: number | null;
    rank_state: number | null;
    xp_to_next_level: number;
}

export const profileApi = {
    register: (data: Record<string, unknown>) =>
        request<FarmerProfile>('/profile/register', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) =>
        request<FarmerProfile>(`/profile/${id}`),
    update: (id: string, data: Record<string, unknown>) =>
        request<FarmerProfile>(`/profile/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onboard: (id: string) =>
        request<FarmerProfile>(`/profile/${id}/onboard`, { method: 'POST' }),
};

// ========================
// Quests
// ========================

export interface Quest {
    id: string;
    title: string;
    title_hi: string;
    description: string;
    category: string;
    quest_type: string;
    difficulty: number;
    xp_reward: number;
    duration_days: number;
    verification_type: string;
    icon_url: string;
    is_active: boolean;
}

export interface QuestDetail extends Quest {
    description_hi: string;
    required_crops: string[] | null;
    steps: { steps: { step: number; action: string }[] } | null;
    tutorial_content: Record<string, unknown> | null;
    created_at: string;
}

export interface FarmerQuest {
    id: string;
    quest: Quest;
    status: string;
    accepted_at: string;
    deadline: string | null;
    completed_at: string | null;
    proof_urls: string[] | null;
    steps_completed: Record<string, unknown> | null;
    xp_awarded: number;
}

export const questsApi = {
    list: (params?: { category?: string; quest_type?: string; difficulty?: number; limit?: number; offset?: number }) => {
        const qs = new URLSearchParams();
        if (params) Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)));
        return request<Quest[]>(`/quests?${qs}`);
    },
    recommended: (farmerId: string, limit = 5) =>
        request<Quest[]>(`/quests/recommended?farmer_id=${farmerId}&limit=${limit}`),
    active: (farmerId: string) =>
        request<FarmerQuest[]>(`/quests/active?farmer_id=${farmerId}`),
    history: (farmerId: string) =>
        request<FarmerQuest[]>(`/quests/history?farmer_id=${farmerId}`),
    detail: (id: string) =>
        request<QuestDetail>(`/quests/${id}`),
    accept: (questId: string, farmerId: string) =>
        request<FarmerQuest>(`/quests/${questId}/accept?farmer_id=${farmerId}`, { method: 'POST' }),
    submit: (questId: string, farmerId: string, data: { proof_urls?: string[]; steps_completed?: Record<string, unknown> }) =>
        request<FarmerQuest>(`/quests/${questId}/submit?farmer_id=${farmerId}`, { method: 'POST', body: JSON.stringify(data) }),
};

// ========================
// Gamification Stats
// ========================

export interface Badge {
    badge_type: string;
    badge_name: string;
    badge_description: string;
    icon_url: string;
    earned: boolean;
    earned_at: string | null;
}

export interface AllBadges {
    earned: Badge[];
    locked: Badge[];
    total_earned: number;
    total_available: number;
}

export const statsApi = {
    get: (farmerId: string) =>
        request<FarmerStats>(`/stats/${farmerId}`),
    badges: (farmerId: string) =>
        request<AllBadges>(`/stats/${farmerId}/badges`),
    streaks: (farmerId: string) =>
        request<{ current_streak: number; longest_streak: number; last_active_date: string | null }>(`/stats/${farmerId}/streaks`),
    xpHistory: (farmerId: string) =>
        request<{ timeline: { date: string; xp_earned: number; cumulative_xp: number }[]; total_xp: number }>(`/stats/${farmerId}/xp-history`),
};

// ========================
// Leaderboard
// ========================

export interface LeaderboardEntry {
    rank: number;
    farmer_id: string;
    display_name: string;
    village: string;
    district: string;
    total_xp: number;
    sustainability_score: number;
    current_level: number;
    level_name: string;
    avatar_url: string;
    is_self: boolean;
}

export interface Leaderboard {
    scope: string;
    scope_value: string;
    entries: LeaderboardEntry[];
    total_count: number;
    farmer_rank: number | null;
}

export const leaderboardApi = {
    get: (scope: string, scopeValue: string, farmerId?: string) => {
        const qs = new URLSearchParams({ scope_value: scopeValue });
        if (farmerId) qs.set('farmer_id', farmerId);
        return request<Leaderboard>(`/leaderboard/${scope}?${qs}`);
    },
    myRanks: (farmerId: string) =>
        request<Record<string, { scope_value: string; rank: number }>>(`/leaderboard/rank/me?farmer_id=${farmerId}`),
};

// ========================
// Community
// ========================

export interface ActivityItem {
    id: string;
    farmer_id: string;
    farmer_name: string;
    farmer_avatar: string;
    farmer_level: number;
    activity_type: string;
    content: Record<string, unknown>;
    created_at: string;
}

export const communityApi = {
    feed: (farmerId: string, limit = 20) =>
        request<{ feed: ActivityItem[]; total: number }>(`/community/feed?farmer_id=${farmerId}&limit=${limit}`),
    postStory: (farmerId: string, title: string, description: string, imageUrls: string[]) =>
        request<{ message: string }>(`/community/story?farmer_id=${farmerId}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`, { method: 'POST' }),
    shoutout: (fromId: string, toId: string, message: string) =>
        request<{ message: string }>(`/community/shoutout?from_farmer_id=${fromId}&to_farmer_id=${toId}&message=${encodeURIComponent(message)}`, { method: 'POST' }),
};

// ========================
// Rewards
// ========================

export interface Reward {
    reward_type: string;
    reward_name: string;
    reward_description: string;
    reward_tier: string;
    xp_cost: number;
    is_available: boolean;
}

export interface Redemption {
    id: string;
    reward_type: string;
    reward_name: string;
    reward_tier: string;
    xp_cost: number;
    redeemed_at: string;
    status: string;
}

export const rewardsApi = {
    list: (farmerId: string) =>
        request<Reward[]>(`/rewards?farmer_id=${farmerId}`),
    redeem: (farmerId: string, data: { reward_type: string; reward_tier: string }) =>
        request<Redemption>(`/rewards/redeem?farmer_id=${farmerId}`, { method: 'POST', body: JSON.stringify(data) }),
    history: (farmerId: string) =>
        request<Redemption[]>(`/rewards/history?farmer_id=${farmerId}`),
};
