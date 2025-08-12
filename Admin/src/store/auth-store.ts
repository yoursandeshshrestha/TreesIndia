import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCookie, deleteCookie } from "@/lib/cookies";
import { api, ApiError } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  name?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  phone: string | null;
}

export interface AuthActions {
  // Login actions
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setUser: (user: User) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      otpSent: false,
      phone: null,

      // Actions
      sendOtp: async (phone: string) => {
        set({ isLoading: true, error: null });

        try {
          await api.auth.login(phone);

          set({
            otpSent: true,
            phone,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof ApiError ? error.message : "Failed to send OTP",
          });
        }
      },

      verifyOtp: async (phone: string, otp: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.auth.verifyOtp(phone, otp);

          // Store tokens in cookies
          if (typeof window !== "undefined") {
            setCookie("treesindia_access_token", response.data.access_token, {
              maxAge: response.data.expires_in,
            });
            setCookie("treesindia_refresh_token", response.data.refresh_token, {
              maxAge: 30 * 24 * 60 * 60, // 30 days
            });
          }

          // Create user object
          const user: User = {
            id: "1",
            phone: phone,
            email: "",
            role: "admin",
            permissions: [],
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            otpSent: false,
            phone: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof ApiError
                ? error.message
                : "Failed to verify OTP",
          });
        }
      },

      logout: () => {
        // Remove cookies
        if (typeof window !== "undefined") {
          deleteCookie("treesindia_access_token");
          deleteCookie("treesindia_refresh_token");
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          otpSent: false,
          phone: null,
        });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      setUser: (user: User) => set({ user, isAuthenticated: true }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
