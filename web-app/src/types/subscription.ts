import { PaymentMethod } from "./payment";

// Pricing option for a subscription plan
export interface PricingOption {
  duration_type: "monthly" | "yearly";
  duration_days: number;
  price: number;
}

export interface SubscriptionPlan {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  name: string;
  is_active: boolean;
  description: string;
  features: Record<string, unknown>;
  pricing: PricingOption[];
  // Legacy fields for backward compatibility (will be deprecated)
  duration_type?: "monthly" | "yearly";
  duration_days?: number;
  price?: number;
}

export interface GroupedSubscriptionPlan {
  name: string;
  description: string;
  features: Record<string, unknown>;
  is_active: boolean;
  monthly?: SubscriptionPlan;
  yearly?: SubscriptionPlan;
}

// Array of grouped subscription plans (for multiple plan types)
export type GroupedSubscriptionPlans = GroupedSubscriptionPlan[];

export interface UserSubscription {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  user_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "cancelled";
  payment_method: PaymentMethod;
  amount: number;
  payment_reference: string;
  plan?: SubscriptionPlan;
}

export interface PurchaseSubscriptionRequest {
  plan_id: number;
  payment_method: PaymentMethod;
  duration_type: "monthly" | "yearly";
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  data: UserSubscription;
  timestamp: string;
}

export interface SubscriptionPlansResponse {
  success: boolean;
  message: string;
  data: SubscriptionPlan[];
  timestamp: string;
}

export interface GroupedSubscriptionPlansResponse {
  success: boolean;
  message: string;
  data: GroupedSubscriptionPlan;
  timestamp: string;
}

export interface MultipleGroupedSubscriptionPlansResponse {
  success: boolean;
  message: string;
  data: GroupedSubscriptionPlans;
  timestamp: string;
}

export interface SubscriptionHistoryResponse {
  success: boolean;
  message: string;
  data: UserSubscription[];
  timestamp: string;
}
