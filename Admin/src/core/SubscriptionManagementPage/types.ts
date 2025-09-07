export interface SubscriptionPlan {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  name: string;
  duration_days: number;
  price: number;
  description?: string;
  is_active: boolean;
  features?: Record<string, any> | null;
  user_subscriptions?: UserSubscription[];
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: "active" | "expired";
  payment_method: "wallet" | "razorpay";
  payment_id?: string;
  amount: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email?: string;
    phone: string;
  };
  plan?: SubscriptionPlan;
}

export interface CreateSubscriptionRequest {
  name: string;
  duration: "monthly" | "yearly" | "one_time";
  price: number;
  description?: string;
  features?: string[];
}

export interface UpdateSubscriptionRequest {
  name?: string;
  duration?: "monthly" | "yearly" | "one_time";
  price?: number;
  description?: string;
  features?: string[];
}

export interface SubscriptionFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
  duration?: "monthly" | "yearly" | "one_time" | "all";
  sortBy?: "name" | "duration" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  oneTimeRevenue: number;
}

export interface SubscriptionApiResponse {
  data: SubscriptionPlan[];
  message?: string;
  success: boolean;
  timestamp?: string;
}

export interface UserSubscriptionApiResponse {
  data: UserSubscription[];
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  message?: string;
  success: boolean;
  timestamp?: string;
}

// Duration options for forms
export const DURATION_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "one_time", label: "One Time" },
] as const;

// Status options for filters
export const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

// Duration options for filters
export const DURATION_FILTER_OPTIONS = [
  { value: "all", label: "All Durations" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "one_time", label: "One Time" },
] as const;

// Sort options
export const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "duration", label: "Duration" },
  { value: "price", label: "Price" },
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
] as const;
