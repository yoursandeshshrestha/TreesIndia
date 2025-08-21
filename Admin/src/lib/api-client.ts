import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { autoSignOut } from "@/utils/authUtils";

// API base configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
const API_TIMEOUT = 10000; // 10 seconds

// Cookie utility function
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// API response types
interface ApiResponseData {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

interface ApiErrorData {
  message: string;
  status?: number;
  statusText?: string;
  errors?: Record<string, string[]>;
}

// Custom error class for API errors
export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data: ApiErrorData | null;

  constructor(
    message: string,
    status: number,
    statusText: string,
    data?: ApiErrorData
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data || null;
  }
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available (from cookies)
      const token = getCookie("treesindia_access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Handle Content-Type based on data type
      if (config.data instanceof FormData) {
        // For FormData, let axios set the Content-Type automatically
        delete config.headers["Content-Type"];
      } else {
        // For JSON data, set the Content-Type
        config.headers["Content-Type"] = "application/json";
      }

      return config;
    },
    (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const { status, statusText, data } = error.response;
        const apiError = new ApiError(
          data?.message || `HTTP ${status}: ${statusText}`,
          status,
          statusText,
          data as ApiErrorData
        );

        // Handle specific error cases
        if (status === 401) {
          // Unauthorized - redirect to login or refresh token
          autoSignOut();
        }

        if (status === 403) {
          // Forbidden - user doesn't have admin privileges
          autoSignOut();
        }

        console.error("API Error:", apiError);
        return Promise.reject(apiError);
      } else if (error.request) {
        // Network error
        const networkError = new ApiError(
          "Network error - please check your connection",
          0,
          "NETWORK_ERROR"
        );
        console.error("Network Error:", networkError);
        return Promise.reject(networkError);
      } else {
        // Other error
        console.error("Request Error:", error);
        return Promise.reject(error);
      }
    }
  );

  return client;
};

export const apiClient = createApiClient();

// Generic API methods
export const api = {
  get: <T = ApiResponseData>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((response) => response.data),

  post: <T = ApiResponseData>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => apiClient.post<T>(url, data, config).then((response) => response.data),

  put: <T = ApiResponseData>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => apiClient.put<T>(url, data, config).then((response) => response.data),

  patch: <T = ApiResponseData>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => apiClient.patch<T>(url, data, config).then((response) => response.data),

  delete: <T = ApiResponseData>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((response) => response.data),
};
