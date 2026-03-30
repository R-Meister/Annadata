import { API_PREFIXES } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown,
  ) {
    super(`API error ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Token helper — reads JWT from Zustand persisted localStorage
// ---------------------------------------------------------------------------

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("annadata-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Typed fetch wrapper with automatic JSON parsing, error handling,
 * and automatic Authorization header injection.
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let body: unknown;
    const bodyText = await res.text();
    if (bodyText) {
      try {
        body = JSON.parse(bodyText);
      } catch {
        body = bodyText;
      }
    } else {
      body = bodyText;
    }
    throw new ApiError(res.status, res.statusText, body);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Service API factory
// ---------------------------------------------------------------------------

function createServiceApi(baseUrl: string) {
  return {
    get<T>(path: string, options?: RequestInit) {
      return apiFetch<T>(`${baseUrl}${path}`, {
        method: "GET",
        ...options,
      });
    },
    post<T>(path: string, body?: unknown, options?: RequestInit) {
      return apiFetch<T>(`${baseUrl}${path}`, {
        method: "POST",
        body: body != null ? JSON.stringify(body) : undefined,
        ...options,
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Per-service API clients (use Next.js rewrite prefixes)
// ---------------------------------------------------------------------------

export const mspMitraApi = createServiceApi(API_PREFIXES.mspMitra);
export const soilscanApi = createServiceApi(API_PREFIXES.soilscan);
export const fasalRakshakApi = createServiceApi(API_PREFIXES.fasalRakshak);
export const jalShaktiApi = createServiceApi(API_PREFIXES.jalShakti);
export const harvestShaktiApi = createServiceApi(API_PREFIXES.harvestShakti);
export const kisaanSahayakApi = createServiceApi(API_PREFIXES.kisaanSahayak);
export const proteinEngineeringApi = createServiceApi(API_PREFIXES.proteinEngineering);
export const kisanCreditApi = createServiceApi(API_PREFIXES.kisanCredit);
export const harvestToCartApi = createServiceApi(API_PREFIXES.harvestToCart);
export const beejSurakshaApi = createServiceApi(API_PREFIXES.beejSuraksha);
export const mausamChakraApi = createServiceApi(API_PREFIXES.mausamChakra);

// ---------------------------------------------------------------------------
// Auth API — aligned with backend services/shared/auth/router.py
// ---------------------------------------------------------------------------

/** Backend returns this from POST /auth/login and POST /auth/register */
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

/** Backend register request body */
export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: string;
  state?: string;
  district?: string;
}

/** Backend GET /auth/me response */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  state: string | null;
  district: string | null;
  is_active: boolean;
}

export const authApi = {
  login(email: string, password: string) {
    return apiFetch<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(data: RegisterData) {
    return apiFetch<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getProfile(token: string) {
    return apiFetch<UserProfile>("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// ---------------------------------------------------------------------------
// Gamification API Types
// ---------------------------------------------------------------------------

export interface UserProgressResponse {
  user_id: string;
  current_xp: number;
  current_level: number;
  xp_to_next_level: number;
  progress_pct: number;
  level_title: string;
  level_title_hi: string;
  level_badge: string;
  current_streak: number;
  longest_streak: number;
  subscription_tier: string;
  next_level: number | null;
}

export interface EarnXPResponse {
  xp_earned: number;
  total_xp: number;
  level_up: boolean;
  new_level?: number;
  new_title?: string;
  new_badge?: string;
}

export interface CheckinResponse {
  message: string;
  xp_earned: number;
  streak: number;
  streak_bonus: number;
  already_checked_in: boolean;
}

export interface QuestResponse {
  id: string;
  title: string;
  title_hi: string;
  description: string;
  description_hi: string;
  xp_reward: number;
  status: string;
  action_required: string;
}

export interface SubscriptionResponse {
  tier: string;
  free_services: string[];
  premium_services: string[];
  enterprise_services: string[];
  accessible_services: string[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  total_xp: number;
  level: number;
  title: string;
  badge: string;
  streak: number;
}

// ---------------------------------------------------------------------------
// Gamification API Client
// ---------------------------------------------------------------------------

const gamificationApi = createServiceApi(API_PREFIXES.gamification);

export const gamificationService = {
  /** Get user progress (XP, level, streak, tier) */
  getProgress(userId: string) {
    return gamificationApi.get<UserProgressResponse>(`/progress/${userId}`);
  },

  /** Earn XP for an action */
  earnXP(userId: string, action: string, metadata?: Record<string, unknown>) {
    return gamificationApi.post<EarnXPResponse>(
      `/xp/earn?user_id=${userId}`,
      { action, metadata }
    );
  },

  /** Daily check-in */
  checkin(userId: string) {
    return gamificationApi.post<CheckinResponse>(`/checkin/${userId}`);
  },

  /** Get daily quests */
  getDailyQuests(userId: string) {
    return gamificationApi.get<QuestResponse[]>(`/quests/daily/${userId}`);
  },

  /** Complete a quest */
  completeQuest(userId: string, questId: string) {
    return gamificationApi.post<{ message: string; xp_earned: number; quest_id: string }>(
      `/quests/${questId}/complete?user_id=${userId}`
    );
  },

  /** Get subscription info */
  getSubscription(userId: string) {
    return gamificationApi.get<SubscriptionResponse>(`/subscription/${userId}`);
  },

  /** Upgrade subscription */
  upgradeSubscription(userId: string, tier: "premium" | "enterprise") {
    return gamificationApi.post<{ message: string; tier: string; bonus_xp: number }>(
      `/subscription/upgrade?user_id=${userId}&new_tier=${tier}`
    );
  },

  /** Get leaderboard */
  getLeaderboard(limit = 10) {
    return gamificationApi.get<{ leaderboard: LeaderboardEntry[]; count: number }>(
      `/leaderboard?limit=${limit}`
    );
  },

  /** Get XP history */
  getXPHistory(userId: string, limit = 20) {
    return gamificationApi.get<{ events: unknown[]; total_count: number }>(
      `/xp/history/${userId}?limit=${limit}`
    );
  },

  /** Get levels config */
  getLevelsConfig() {
    return gamificationApi.get<{ levels: unknown[] }>("/config/levels");
  },

  /** Get XP rewards config */
  getRewardsConfig() {
    return gamificationApi.get<{ rewards: Record<string, number> }>("/config/rewards");
  },
};
