import { API_BASE_URL, authenticatedFetch } from './base';

export interface WorkerWithdrawalRequest {
  amount: number;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
  notes?: string;
}

export interface WorkerWithdrawalResponse {
  id: number;
  payment_reference: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  account_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  requested_at: string;
  processed_at?: string;
  processed_by?: number;
  processed_by_name?: string;
  rejection_reason?: string;
  notes: string;
}

export interface WithdrawalListResponse {
  success: boolean;
  message: string;
  data: {
    withdrawals: WorkerWithdrawalResponse[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface WithdrawalRequestResponse {
  success: boolean;
  message: string;
  data: {
    payment_reference: string;
    amount: number;
    status: string;
  };
}

class WorkerWithdrawalService {
  /**
   * Request a withdrawal
   */
  async requestWithdrawal(
    request: WorkerWithdrawalRequest
  ): Promise<{ payment_reference: string; amount: number; status: string }> {
    const url = `${API_BASE_URL}/worker/withdrawals/request`;
    const response = await authenticatedFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result: WithdrawalRequestResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to request withdrawal');
    }

    return result.data;
  }

  /**
   * Get withdrawal history with pagination
   */
  async getWithdrawals(
    page: number = 1,
    limit: number = 10
  ): Promise<WithdrawalListResponse['data']> {
    const url = `${API_BASE_URL}/worker/withdrawals?page=${page}&limit=${limit}`;
    const response = await authenticatedFetch(url);
    const result: WithdrawalListResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch withdrawals');
    }

    return result.data;
  }

  /**
   * Get pending withdrawal requests
   */
  async getPendingWithdrawals(): Promise<WorkerWithdrawalResponse[]> {
    const url = `${API_BASE_URL}/worker/withdrawals/pending`;
    const response = await authenticatedFetch(url);
    const result: WithdrawalListResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch pending withdrawals');
    }

    return result.data.withdrawals;
  }
}

export const workerWithdrawalService = new WorkerWithdrawalService();
