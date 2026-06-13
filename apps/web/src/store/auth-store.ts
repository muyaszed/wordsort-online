import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, type AuthUser } from "@/lib/api-client";

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  // Modal state
  authModal: "closed" | "login" | "register";
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;

  // Auth actions
  setTokens: (
    accessToken: string,
    refreshToken: string,
    user: AuthUser
  ) => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      authModal: "closed",

      openLogin: () => set({ authModal: "login" }),
      openRegister: () => set({ authModal: "register" }),
      closeAuthModal: () => set({ authModal: "closed" }),

      setTokens: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch {}
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const data = await authApi.refresh(refreshToken);
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          });
          return true;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
          return false;
        }
      },
    }),
    {
      name: "wordsort-auth",
      // Only persist the refresh token and user info; access token stays ephemeral
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
