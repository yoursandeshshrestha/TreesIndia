import {
  AuthResponse,
  RequestOTPRequest,
  RequestOTPResponse,
  VerifyOTPRequest,
} from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Cookie names with environment prefix to avoid conflicts
const COOKIE_PREFIX =
  process.env.NODE_ENV === "production" ? "treesindia_" : "dev_treesindia_";
export const COOKIE_NAMES = {
  ACCESS_TOKEN: `${COOKIE_PREFIX}access_token`,
  REFRESH_TOKEN: `${COOKIE_PREFIX}refresh_token`,
  CSRF_TOKEN: `${COOKIE_PREFIX}csrf_token`,
} as const;

class AuthAPIError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "AuthAPIError";
  }
}

// Helper function to set cookies
export const setCookie = (
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {}
) => {
  const {
    maxAge = 7 * 24 * 60 * 60, // 7 days default
    path = "/",
    secure = process.env.NODE_ENV === "production",
    sameSite = "strict",
  } = options;

  const cookieValue = `${name}=${value}; Max-Age=${maxAge}; Path=${path}; ${
    secure ? "Secure; " : ""
  }SameSite=${sameSite}`;

  document.cookie = cookieValue;
};

// Helper function to get cookies
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

// Helper function to remove cookies
export const removeCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; Path=/; ${
    process.env.NODE_ENV === "production" ? "Secure; " : ""
  }SameSite=strict`;
};

// Helper function to make authenticated requests
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
  const refreshToken = getCookie(COOKIE_NAMES.REFRESH_TOKEN);

  // If no access token but we have refresh token, try to refresh first
  if (!accessToken && refreshToken) {
    try {
      const authAPI = AuthAPI.getInstance();
      await authAPI.refreshToken();
      accessToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    } catch {
      removeCookie(COOKIE_NAMES.ACCESS_TOKEN);
      removeCookie(COOKIE_NAMES.REFRESH_TOKEN);
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get a 401, try to refresh the token and retry the request
  if (response.status === 401 && (accessToken || refreshToken)) {
    try {
      const authAPI = AuthAPI.getInstance();
      await authAPI.refreshToken();

      // Retry the request with the new token
      const newAccessToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
      if (newAccessToken) {
        (
          headers as Record<string, string>
        ).Authorization = `Bearer ${newAccessToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });
        return retryResponse;
      }
    } catch {
      removeCookie(COOKIE_NAMES.ACCESS_TOKEN);
      removeCookie(COOKIE_NAMES.REFRESH_TOKEN);
    }
  }

  return response;
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    let errorCode: string | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorCode = errorData.code;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new AuthAPIError(errorMessage, response.status, errorCode);
  }

  const data = await response.json();
  return data.data || data; // Handle both wrapped and unwrapped responses
};

export class AuthAPI {
  private static instance: AuthAPI;

  private constructor() {}

  static getInstance(): AuthAPI {
    if (!AuthAPI.instance) {
      AuthAPI.instance = new AuthAPI();
    }
    return AuthAPI.instance;
  }

  async requestOTP(phone: string): Promise<RequestOTPResponse> {
    const requestData: RequestOTPRequest = { phone };

    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    return handleResponse<RequestOTPResponse>(response);
  }

  async verifyOTP(phone: string, otp: string): Promise<AuthResponse> {
    const requestData: VerifyOTPRequest = { phone, otp };

    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const authData = await handleResponse<AuthResponse>(response);

    // Store tokens in cookies (in production, backend should set HTTP-only cookies)
    if (authData.access_token) {
      setCookie(COOKIE_NAMES.ACCESS_TOKEN, authData.access_token, {
        maxAge: authData.expires_in,
        secure: process.env.NODE_ENV === "production",
      });
    }

    if (authData.refresh_token) {
      setCookie(COOKIE_NAMES.REFRESH_TOKEN, authData.refresh_token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        secure: process.env.NODE_ENV === "production",
      });
    }

    return authData;
  }

  async logout(): Promise<void> {
    try {
      await authenticatedFetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
      });
    } catch (error) {
      // Even if logout fails, clear local cookies
      console.warn("Logout request failed, clearing local cookies:", error);
    } finally {
      // Always clear cookies locally
      removeCookie(COOKIE_NAMES.ACCESS_TOKEN);
      removeCookie(COOKIE_NAMES.REFRESH_TOKEN);
      removeCookie(COOKIE_NAMES.CSRF_TOKEN);
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = getCookie(COOKIE_NAMES.REFRESH_TOKEN);

    if (!refreshToken) {
      throw new AuthAPIError("No refresh token available", 401);
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const authData = await handleResponse<AuthResponse>(response);

    // Update cookies with new tokens
    if (authData.access_token) {
      setCookie(COOKIE_NAMES.ACCESS_TOKEN, authData.access_token, {
        maxAge: authData.expires_in,
        secure: process.env.NODE_ENV === "production",
      });
    }

    if (authData.refresh_token) {
      setCookie(COOKIE_NAMES.REFRESH_TOKEN, authData.refresh_token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        secure: process.env.NODE_ENV === "production",
      });
    }

    return authData;
  }

  async getCurrentUser(): Promise<AuthResponse["user"]> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
      return handleResponse<AuthResponse["user"]>(response);
    } catch (error) {
      // If access token is invalid, try to refresh it
      if (error instanceof AuthAPIError && error.status === 401) {
        try {
          const retryResponse = await authenticatedFetch(
            `${API_BASE_URL}/auth/me`
          );
          return handleResponse<AuthResponse["user"]>(retryResponse);
        } catch (refreshError) {
          throw refreshError;
        }
      }
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const accessToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    const refreshToken = getCookie(COOKIE_NAMES.REFRESH_TOKEN);

    // If no tokens at all, user is not authenticated
    if (!accessToken && !refreshToken) {
      return false;
    }

    // If we have access token, try to validate it
    if (accessToken) {
      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
        if (response.ok) {
          return true;
        }
      } catch {
        // Access token validation failed
      }
    }

    // If access token is missing or invalid, but we have refresh token, try to refresh
    if (refreshToken) {
      try {
        await this.refreshToken();
        return true;
      } catch {
        // Clear invalid tokens
        removeCookie(COOKIE_NAMES.ACCESS_TOKEN);
        removeCookie(COOKIE_NAMES.REFRESH_TOKEN);
        return false;
      }
    }

    return false;
  }

  // Get current access token
  getAccessToken(): string | null {
    return getCookie(COOKIE_NAMES.ACCESS_TOKEN);
  }

  // Check if tokens exist (synchronous, doesn't validate)
  hasTokens(): boolean {
    const accessToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    const refreshToken = getCookie(COOKIE_NAMES.REFRESH_TOKEN);
    return !!(accessToken || refreshToken);
  }
}

export const authAPI = AuthAPI.getInstance();
