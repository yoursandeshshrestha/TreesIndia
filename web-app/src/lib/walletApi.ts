import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface WalletSummary {
  current_balance: number;
  total_recharge: number;
  total_spent: number;
  total_transactions: number;
  recent_transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id?: number;
  ID?: number;
  payment_reference?: string;
  user_id: number;
  amount: number;
  currency: string;
  type: string;
  method: string;
  status: string;
  description: string;
  reference_id?: string;
  related_entity_type?: string;
  related_entity_id?: number;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  initiated_at?: string;
  completed_at?: string;
  CompletedAt?: string;
  failed_at?: string | null;
  refunded_at?: string | null;
  balance_after?: number;
  refund_amount?: number | null;
  refund_reason?: string | null;
  refund_method?: string | null;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  user?: {
    ID: number;
    name: string;
    email: string | null;
    phone: string;
    user_type: string;
    avatar: string;
    gender: string;
    is_active: boolean;
    wallet_balance: number;
    subscription_id: number | null;
    has_active_subscription: boolean;
    subscription_expiry_date: string | null;
  };
}

export interface RechargeRequest {
  amount: number;
  payment_method: string;
}

export interface RechargeResponse {
  payment: {
    id?: number;
    ID?: number;
    amount: number;
    currency: string;
    razorpay_order_id: string;
  };
  payment_order: {
    key_id: string;
    amount: number;
    currency: string;
  };
  message: string;
}

// Get wallet summary
export async function getWalletSummary(): Promise<{ data: WalletSummary }> {
  try {
    const url = `${API_BASE_URL}/wallet/summary`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Get wallet transactions
export async function getWalletTransactions(
  page: number = 1,
  limit: number = 10
): Promise<{ data: { transactions: WalletTransaction[]; total: number } }> {
  try {
    const url = `${API_BASE_URL}/wallet/transactions?page=${page}&limit=${limit}`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Create wallet recharge
export async function createWalletRecharge(
  rechargeData: RechargeRequest
): Promise<{ data: RechargeResponse }> {
  try {
    const url = `${API_BASE_URL}/wallet/recharge`;
    const response = await authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify(rechargeData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Complete wallet recharge
export async function completeWalletRecharge(
  paymentId: number,
  paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }
): Promise<{ data: { message: string } }> {
  try {
    const url = `${API_BASE_URL}/wallet/recharge/${paymentId}/complete`;
    const response = await authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Refresh wallet recharge order
export async function refreshWalletRechargeOrder(
  paymentId: number
): Promise<{ data: RechargeResponse }> {
  try {
    const url = `${API_BASE_URL}/wallet/recharge/${paymentId}/refresh`;
    const response = await authenticatedFetch(url, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Cancel wallet recharge
export async function cancelWalletRecharge(
  paymentId: number
): Promise<{ data: { message: string } }> {
  try {
    const url = `${API_BASE_URL}/wallet/recharge/${paymentId}/cancel`;
    const response = await authenticatedFetch(url, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
