import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/types/api";
import { useProfile } from "./users";

// Admin role codes should match backend AdminRoleCode values
export type AdminRole =
  | "super_admin"
  | "booking_manager"
  | "vendor_manager"
  | "finance_manager"
  | "support_agent"
  | "content_manager"
  | "properties_manager";

// Auth response types
interface AuthUser {
  id: number;
  phone: string;
  name: string | null;
  role: string;
  wallet_balance: number;
  created_at: string;
  admin_roles?: AdminRole[];
}

interface RequestOTPResponse {
  success: boolean;
  message: string;
  data: {
    phone: string;
    expires_in: number;
    is_new_user: boolean;
  };
}

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    is_new_user: boolean;
  };
}

interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

// Auth endpoints
const AUTH_ENDPOINTS = {
  requestOTP: "/auth/request-otp",
  verifyOTP: "/auth/verify-otp",
  logout: "/auth/logout",
  refresh: "/auth/refresh-token",
} as const;

// Cookie names (matching middleware)
const COOKIE_NAMES = {
  accessToken: "treesindia_access_token",
  refreshToken: "treesindia_refresh_token",
  user: "treesindia_user",
} as const;

// Cookie utility functions
const cookieUtils = {
  setCookie: (name: string, value: string, days = 7) => {
    if (typeof document === "undefined") return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  getCookie: (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  },

  deleteCookie: (name: string) => {
    if (typeof document === "undefined") return;
    // Delete cookie with all possible attribute combinations to ensure removal
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    document.cookie = `${name}=;max-age=0;path=/;SameSite=Lax`;
    document.cookie = `${name}=;max-age=0;path=/;`;
  },
};

// Auth API functions
export const authApi = {
  // Request OTP
  requestOTP: async (phone: string): Promise<RequestOTPResponse> => {
    return api.post<RequestOTPResponse>(AUTH_ENDPOINTS.requestOTP, { phone });
  },

  // Verify OTP and login
  verifyOTP: async (phone: string, otp: string): Promise<VerifyOTPResponse> => {
    const response = await api.post<VerifyOTPResponse>(
      AUTH_ENDPOINTS.verifyOTP,
      { phone, otp }
    );

    // Store tokens in cookies
    if (response.data?.access_token) {
      cookieUtils.setCookie(
        COOKIE_NAMES.accessToken,
        response.data.access_token,
        1 / 24
      ); // 1 hour (1/24 of a day)
      cookieUtils.setCookie(
        COOKIE_NAMES.refreshToken,
        response.data.refresh_token,
        30
      ); // 30 days
      cookieUtils.setCookie(
        COOKIE_NAMES.user,
        JSON.stringify(response.data.user),
        30
      ); // 30 days
    }

    return response;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post(AUTH_ENDPOINTS.logout);
    } finally {
      // Clear cookies regardless of API call success
      cookieUtils.deleteCookie(COOKIE_NAMES.accessToken);
      cookieUtils.deleteCookie(COOKIE_NAMES.refreshToken);
      cookieUtils.deleteCookie(COOKIE_NAMES.user);
    }
  },

  // Refresh token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = cookieUtils.getCookie(COOKIE_NAMES.refreshToken);
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post<RefreshTokenResponse>(
      AUTH_ENDPOINTS.refresh,
      {
        refresh_token: refreshToken,
      }
    );

    // Update stored tokens in cookies
    if (response.data?.access_token) {
      cookieUtils.setCookie(
        COOKIE_NAMES.accessToken,
        response.data.access_token,
        1 / 24
      ); // 1 hour (1/24 of a day)
      cookieUtils.setCookie(
        COOKIE_NAMES.refreshToken,
        response.data.refresh_token,
        30
      ); // 30 days
      cookieUtils.setCookie(
        COOKIE_NAMES.user,
        JSON.stringify(response.data.user),
        30
      ); // 30 days
    }

    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    return api.get("/users/profile");
  },
};

// Utility functions
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!cookieUtils.getCookie(COOKIE_NAMES.accessToken);
  },

  // Get stored token
  getToken: (): string | null => {
    return cookieUtils.getCookie(COOKIE_NAMES.accessToken);
  },

  // Get stored user
  getUser: () => {
    const userStr = cookieUtils.getCookie(COOKIE_NAMES.user);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Clear all auth data
  clearAuth: (): void => {
    // Delete all auth cookies
    cookieUtils.deleteCookie(COOKIE_NAMES.accessToken);
    cookieUtils.deleteCookie(COOKIE_NAMES.refreshToken);
    cookieUtils.deleteCookie(COOKIE_NAMES.user);

    // Clear localStorage and sessionStorage as backup
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("treesindia_auth");
        sessionStorage.removeItem("treesindia_auth");
      } catch (error) {
        console.error("Error clearing storage:", error);
      }
    }
  },
};

// TanStack Query hooks
export const useRequestOTP = () => {
  return useMutation({
    mutationFn: authApi.requestOTP,
    onError: (error) => {
      console.error("Request OTP failed:", error);
    },
  });
};

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      authApi.verifyOTP(phone, otp),
    onSuccess: (data) => {
      // Set user data in cache
      if (data.data?.user) {
        // Transform the user data to match the expected structure
        const transformedUser = {
          ...data.data.user,
          user_type: data.data.user.role, // Map role to user_type
          wallet: {
            balance: data.data.user.wallet_balance || 0,
          },
          subscription: {
            has_active_subscription: false,
          },
        };

        queryClient.setQueryData(queryKeys.profile, transformedUser);
        queryClient.setQueryData(queryKeys.auth, data.data);
      }
    },
    onError: (error) => {
      console.error("Verify OTP failed:", error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Clear auth data from cookies
      authUtils.clearAuth();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Still clear cache and auth data even if API call fails
      queryClient.clear();
      authUtils.clearAuth();
    },
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (data) => {
      // Update user data in cache
      if (data.data?.user) {
        // Transform the user data to match the expected structure
        const transformedUser = {
          ...data.data.user,
          user_type: data.data.user.role, // Map role to user_type
          wallet: {
            balance: data.data.user.wallet_balance || 0,
          },
          subscription: {
            has_active_subscription: false,
          },
        };

        queryClient.setQueryData(queryKeys.profile, transformedUser);
        queryClient.setQueryData(queryKeys.auth, data.data);
      }
    },
    onError: (error) => {
      console.error("Refresh token failed:", error);
      // Clear auth data if refresh fails
      authUtils.clearAuth();
    },
  });
};

// Hook to get current user
export const useCurrentUser = () => {
  return useProfile();
};

// Hook to check authentication status
export const useAuth = () => {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: () => {
      const token = authUtils.getToken();
      const user = authUtils.getUser();

      if (!token || !user) {
        throw new Error("No authentication data");
      }

      return {
        isAuthenticated: true,
        token,
        user,
      };
    },
    enabled: authUtils.isAuthenticated(),
    staleTime: Infinity, // Auth state doesn't change frequently
    retry: false, // Don't retry auth checks - fail immediately
  });
};
