import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiClient } from "@/lib/api";
import type {
  AuthState,
  AuthActions,
  AuthUser,
  TokenResponse,
} from "@/types/auth";

interface AuthStore extends AuthState, AuthActions {}

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;samesite=lax${
    process.env.NODE_ENV === "production" ? ";secure" : ""
  }`;
};

const deleteCookie = (name: string) => {
  if (typeof window === "undefined") return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      clearError: () => set({ error: null }),

      requestOTP: async (phone: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiClient.requestOTP({ phone });

          if (response.data.success) {
            set({ error: null });
          } else {
            set({ error: response.data.message || "Failed to send OTP" });
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to send OTP";
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (phone: string, otp: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiClient.verifyOTP({ phone, otp });

          if (response.data.success) {
            const { user, access_token, refresh_token, expires_in } =
              response.data.data;

            // Create token response object
            const tokenResponse: TokenResponse = {
              access_token,
              refresh_token,
              expires_in,
            };

            // Store tokens in cookies for middleware access
            setCookie("treesindia_access_token", access_token, 7);
            setCookie("treesindia_refresh_token", refresh_token, 30);

            // Also store in localStorage for client-side access
            if (typeof window !== "undefined") {
              localStorage.setItem("treesindia_access_token", access_token);
              localStorage.setItem("treesindia_refresh_token", refresh_token);
            }

            set({
              user,
              tokens: tokenResponse,
              isAuthenticated: true,
              error: null,
            });
          } else {
            set({ error: response.data.message || "Login failed" });
            throw new Error(response.data.message || "Login failed");
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || error.message || "Login failed";
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        // Clear tokens from cookies
        deleteCookie("treesindia_access_token");
        deleteCookie("treesindia_refresh_token");

        // Clear tokens from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("treesindia_access_token");
          localStorage.removeItem("treesindia_refresh_token");
        }

        // Reset state
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
