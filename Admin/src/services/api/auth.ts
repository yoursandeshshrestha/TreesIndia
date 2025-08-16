import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/types/api";

// Auth response types
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
    user: {
      id: number;
      phone: string;
      name: string | null;
      role: string;
      wallet_balance: number;
      wallet_limit: number;
      created_at: string;
    };
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
    user: {
      id: number;
      phone: string;
      name: string | null;
      role: string;
      wallet_balance: number;
      wallet_limit: number;
      created_at: string;
    };
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
  me: "/auth/me",
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
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
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
        1
      ); // 1 day
      cookieUtils.setCookie(
        COOKIE_NAMES.refreshToken,
        response.data.refresh_token,
        7
      ); // 7 days
      cookieUtils.setCookie(
        COOKIE_NAMES.user,
        JSON.stringify(response.data.user),
        7
      );
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
        1
      );
      cookieUtils.setCookie(
        COOKIE_NAMES.refreshToken,
        response.data.refresh_token,
        7
      );
      cookieUtils.setCookie(
        COOKIE_NAMES.user,
        JSON.stringify(response.data.user),
        7
      );
    }

    return response;
  },

  // Get current user
  getCurrentUser: async () => {
    return api.get(AUTH_ENDPOINTS.me);
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
    cookieUtils.deleteCookie(COOKIE_NAMES.accessToken);
    cookieUtils.deleteCookie(COOKIE_NAMES.refreshToken);
    cookieUtils.deleteCookie(COOKIE_NAMES.user);
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
        queryClient.setQueryData(queryKeys.profile, data.data.user);
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
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Still clear cache even if API call fails
      queryClient.clear();
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
        queryClient.setQueryData(queryKeys.profile, data.data.user);
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
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: authApi.getCurrentUser,
    enabled: authUtils.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
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
  });
};
