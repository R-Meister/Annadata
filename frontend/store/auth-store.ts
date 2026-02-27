import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/lib/api";

// ---------------------------------------------------------------------------
// Cookie helpers — used by Next.js middleware for route protection
// ---------------------------------------------------------------------------

function setAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "annadata-authed=1; path=/; SameSite=Lax";
  }
}

function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie =
      "annadata-authed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token, user) => {
        setAuthCookie();
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        clearAuthCookie();
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "annadata-auth",
      // Only persist token and user; isAuthenticated is derived on rehydrate.
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const authenticated =
            state.token !== null && state.user !== null;
          state.isAuthenticated = authenticated;
          // Sync cookie with persisted state
          if (authenticated) {
            setAuthCookie();
          } else {
            clearAuthCookie();
          }
        }
      },
    },
  ),
);
