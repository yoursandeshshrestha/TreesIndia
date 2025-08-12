import { getCookie } from "./cookies";
import { apiClient } from "./api-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return apiClient.request<ApiResponse<T>>(endpoint, options);
  },

  // Auth endpoints
  auth: {
    login: (phone: string) =>
      api.request<null>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),

    verifyOtp: (phone: string, otp: string) =>
      api.request<LoginResponse>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      }),

    refreshToken: (refreshToken: string) =>
      api.request<LoginResponse>("/auth/refresh-token", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      }),
  },
};
