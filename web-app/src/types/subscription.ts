import { PaymentMethod } from "./payment";

export interface SubscriptionPlan {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  name: string;
  duration_type: "monthly" | "yearly";
  duration_days: number;
  price: number;
  is_active: boolean;
  description: string;
  features: Record<string, unknown>;
}

export interface GroupedSubscriptionPlan {
  name: string;
  description: string;
  features: Record<string, unknown>;
  is_active: boolean;
  monthly?: SubscriptionPlan;
  yearly?: SubscriptionPlan;
}

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

export interface SubscriptionHistoryResponse {
  success: boolean;
  message: string;
  data: UserSubscription[];
  timestamp: string;
}
