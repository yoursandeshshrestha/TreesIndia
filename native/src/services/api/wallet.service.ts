import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export interface WalletSummary {
  current_balance: number;
  total_recharge: number;
  total_spent: number;
  total_transactions: number;
}

export interface WalletTransaction {
  ID?: number; // Backend may return capital ID
  id?: number; // Also support lowercase for compatibility
  payment_reference: string;
  amount: number;
  status: string;
  type: string;
  method: string;
  CreatedAt?: string; // Backend returns capital CreatedAt from GORM
  created_at?: string; // Also support lowercase for compatibility
  initiated_at?: string; // Payment model has initiated_at field
  completed_at?: string | null;
  CompletedAt?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface InitiateRechargeRequest {
  amount: number;
  payment_method: string;
}

export interface PaymentOrder {
  id: string;
  amount: number; // Amount in paise
  currency: string;
  receipt: string;
  key_id?: string;
}

export interface Payment {
  ID: number; // Backend returns capital ID
  id?: number; // Also support lowercase for compatibility
  payment_reference: string;
  amount: number;
  status: string;
  type: string;
  method: string;
  razorpay_order_id?: string;
}

export interface InitiateRechargeResponse {
  payment: Payment;
  payment_order: PaymentOrder;
  message?: string;
}

class WalletService {
  async getWalletSummary(): Promise<WalletSummary> {
    const response = await authenticatedFetch(`${API_BASE_URL}/wallet/summary`);
    return handleResponse<WalletSummary>(response);
  }

  async getWalletTransactions(
    page: number = 1,
    limit: number = 10
  ): Promise<WalletTransactionsResponse> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/wallet/transactions?page=${page}&limit=${limit}`
    );
    return handleResponse<WalletTransactionsResponse>(response);
  }

  async initiateRecharge(data: InitiateRechargeRequest): Promise<InitiateRechargeResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/wallet/recharge`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse<InitiateRechargeResponse>(response);
  }

  async completeRecharge(
    rechargeId: number,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<void> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/wallet/recharge/${rechargeId}/complete`,
      {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        }),
      }
    );
    return handleResponse<void>(response);
  }

  async cancelRecharge(rechargeId: number): Promise<void> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/wallet/recharge/${rechargeId}/cancel`,
      {
        method: 'POST',
      }
    );
    return handleResponse<void>(response);
  }
}

export const walletService = new WalletService();
