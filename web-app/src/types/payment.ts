export type PaymentMethod = "wallet" | "razorpay";

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface Payment {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  payment_reference: string;
  user_id: number;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  type: string;
  method: string;
  related_entity_type: string;
  related_entity_id: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  initiated_at: string;
  completed_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  balance_after: number | null;
  refund_amount: number | null;
  refund_reason: string | null;
  refund_method: string | null;
  description: string;
  notes: string;
  metadata: Record<string, unknown>;
  user?: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
    email: string | null;
    phone: string;
    user_type: string;
    avatar: string;
    gender: string;
    is_active: boolean;
    last_login_at: string | null;
    role_application_status: string;
    application_date: string | null;
    approval_date: string | null;
    wallet_balance: number;
    subscription_id: number | null;
    subscription: unknown | null;
    has_active_subscription: boolean;
    subscription_expiry_date: string | null;
    notification_settings: unknown | null;
  };
}

export interface RechargeResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface RechargeRequest {
  amount: number;
  payment_method: string;
}
