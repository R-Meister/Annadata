import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/lib/api";

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

      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),

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
          state.isAuthenticated = state.token !== null && state.user !== null;
        }
      },
    },
  ),
);
