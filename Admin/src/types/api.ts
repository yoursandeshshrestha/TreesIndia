// Common API response wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error response type
export interface ApiErrorResponse {
  message: string;
  status: number;
  statusText: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error: ApiErrorResponse | null;
}

// User types (example)
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "user" | "moderator";
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Generic CRUD operations
export interface CreateRequest<T> {
  data: Partial<T>;
}

export interface UpdateRequest<T> {
  id: string;
  data: Partial<T>;
}

export interface DeleteRequest {
  id: string;
}

// Query keys for TanStack Query
export const queryKeys = {
  users: ["users"] as const,
  user: (id: string) => ["users", id] as const,
  auth: ["auth"] as const,
  profile: ["profile"] as const,
} as const;
