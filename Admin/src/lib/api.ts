import axios, { AxiosInstance, AxiosResponse } from "axios";
import type {
  RequestOTPRequest,
  RequestOTPResponse,
  VerifyOTPRequest,
  AuthResponse,
} from "@/types/auth";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

// Cookie utility function
const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${BACKEND_URL}`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          // Try to get token from localStorage first, then cookies
          let token = localStorage.getItem("treesindia_access_token");
          if (!token) {
            token = getCookie("treesindia_access_token");
          }

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            if (typeof window !== "undefined") {
              // Try to get refresh token from localStorage first, then cookies
              let refreshToken = localStorage.getItem(
                "treesindia_refresh_token"
              );
              if (!refreshToken) {
                refreshToken = getCookie("treesindia_refresh_token");
              }

              if (refreshToken) {
                const response = await this.refreshToken(refreshToken);
                const { access_token } = response.data.data;

                // Update both localStorage and cookies
                localStorage.setItem("treesindia_access_token", access_token);
                document.cookie = `treesindia_access_token=${access_token};path=/;samesite=lax${
                  process.env.NODE_ENV === "production" ? ";secure" : ""
                }`;

                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            if (typeof window !== "undefined") {
              localStorage.removeItem("treesindia_access_token");
              localStorage.removeItem("treesindia_refresh_token");
              document.cookie =
                "treesindia_access_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
              document.cookie =
                "treesindia_refresh_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
              window.location.href = "/auth/sign-in";
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async requestOTP(
    data: RequestOTPRequest
  ): Promise<AxiosResponse<RequestOTPResponse>> {
    return this.client.post("/auth/request-otp", data);
  }

  async verifyOTP(
    data: VerifyOTPRequest
  ): Promise<AxiosResponse<AuthResponse>> {
    return this.client.post("/auth/verify-otp", data);
  }

  async refreshToken(
    refreshToken: string
  ): Promise<AxiosResponse<{ data: { access_token: string } }>> {
    return this.client.post("/auth/refresh-token", {
      refresh_token: refreshToken,
    });
  }

  // Health check
  async healthCheck(): Promise<AxiosResponse> {
    return this.client.get("/health");
  }

  // Generic HTTP methods
  async get<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url);
  }

  async post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data);
  }

  async delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url);
  }
}

export const apiClient = new ApiClient();
