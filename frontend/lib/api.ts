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
