// Individual subscription plan (as stored in database)
export interface SubscriptionPlan {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  name: string;
  description?: string;
  is_active: boolean;
  features?: Record<string, unknown> | null;
  pricing: PricingOption[];
  user_subscriptions?: UserSubscription[];
}

// Pricing option for a subscription plan
export interface PricingOption {
  duration_type: "monthly" | "yearly";
  duration_days: number;
  price: number;
}

// Grouped subscription plan (logical grouping for UI) - DEPRECATED: Use SubscriptionPlan with pricing array instead
export interface GroupedSubscriptionPlan {
  name: string;
  description: string;
  is_active: boolean;
  features?: Record<string, unknown> | null;
  monthly?: SubscriptionPlan;
  yearly?: SubscriptionPlan;
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

// New structure for creating subscription plans (matches our backend seeding structure)
export interface CreateSubscriptionPlanRequest {
  name: string;
  description: string;
  is_active: boolean;
  features: string[];
  pricing: PricingOption[];
}

export interface UpdateSubscriptionPlanRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  features?: string[];
  pricing?: PricingOption[];
}

// Legacy types for backward compatibility (will be removed)
export interface CreateSubscriptionRequest {
  name: string;
  duration_type: "monthly" | "yearly";
  price: number;
  description?: string;
  features?: string[];
}

export interface CreateSubscriptionWithBothDurationsRequest {
  name: string;
  monthly_price: number;
  yearly_price: number;
  description?: string;
  features?: string[];
}

export interface UpdateSubscriptionRequest {
  name?: string;
  duration_type?: "monthly" | "yearly";
  price?: number;
  description?: string;
  features?: string[];
}

export interface SubscriptionFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
  duration?: "monthly" | "yearly" | "all";
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

export interface GroupedSubscriptionApiResponse {
  data: GroupedSubscriptionPlan;
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
] as const;

// Sort options
export const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "duration", label: "Duration" },
  { value: "price", label: "Price" },
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
] as const;
