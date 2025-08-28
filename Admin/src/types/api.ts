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

// User types
export interface User {
  id: number;
  name: string;
  email?: string;
  phone: string;
  user_type: "normal" | "worker" | "broker" | "admin";
  avatar?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;

  // Wallet Information
  wallet: {
    balance: number;
  };

  // Subscription Information
  subscription: {
    has_active_subscription: boolean;
    subscription_id?: number;
    expiry_date?: string;
    current_plan?: UserSubscription;
  };



  // Notification Settings
  notification_settings?: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    marketing_emails: boolean;
    booking_reminders: boolean;
    service_updates: boolean;
  };

  // Subscription History (last 5)
  subscription_history?: UserSubscriptionHistory[];

  // Subscription Warnings
  subscription_warnings?: SubscriptionWarning[];
}

// User Subscription
export interface UserSubscription {
  id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: "active" | "expired";
  amount: number;
  payment_method: "wallet" | "razorpay";
  payment_id?: string;
  created_at: string;
}

// User Subscription History
export interface UserSubscriptionHistory {
  id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: "active" | "expired";
  amount: number;
  payment_method: "wallet" | "razorpay";
  created_at: string;
}

// Subscription Warning
export interface SubscriptionWarning {
  id: number;
  days_left: number;
  warning_date: string;
  sent_via: "email" | "sms" | "both";
  created_at: string;
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

// Available Workers API Types
export interface AvailableWorkersRequest {
  scheduled_time: string; // ISO format: 2024-01-15T14:00:00Z
  service_duration?: number; // Optional, default 120 minutes
}

export interface AvailableWorkersResponse {
  success: boolean;
  message: string;
  data: {
    available_workers: Worker[];
    scheduled_time: string;
    service_duration: number;
  };
}

export interface Worker {
  ID: number;
  name: string;
  phone: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  worker?: {
    id: number;
    user_id: number;
    service_id: number;
    hourly_rate: number;
    is_available: boolean;
    rating: number;
    total_bookings: number;
    worker_type: "treesindia" | "independent";
    skills?: string;
    experience_years?: number;
    service_areas?: string;
    earnings: number;
    total_jobs: number;
    service?: {
      id: number;
      name: string;
      price?: number;
      category_id: number;
    };
  };
}
