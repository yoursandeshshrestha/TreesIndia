import { api } from '@/lib/api-client';

export interface WorkerWithdrawal {
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
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

export interface WorkerWithdrawalFilters {
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | '';
  search?: string;
  page?: number;
  limit?: number;
}

export interface WithdrawalListResponse {
  success: boolean;
  message: string;
  data: {
    withdrawals: WorkerWithdrawal[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface ApproveRejectRequest {
  notes?: string;
  reason?: string;
}

class WorkerWithdrawalService {
  /**
   * Get all withdrawal requests
   */
  async getAllWithdrawals(
    filters: WorkerWithdrawalFilters = {}
  ): Promise<WithdrawalListResponse['data']> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<WithdrawalListResponse>(
      `/admin/withdrawals?${params.toString()}`
    );

    return response.data;
  }

  /**
   * Get pending withdrawal requests
   */
  async getPendingWithdrawals(): Promise<WorkerWithdrawal[]> {
    const response = await api.get<WithdrawalListResponse>(
      '/admin/withdrawals/pending'
    );

    return response.data.withdrawals;
  }

  /**
   * Approve a withdrawal request
   */
  async approveWithdrawal(
    withdrawalId: number,
    data?: ApproveRejectRequest
  ): Promise<void> {
    await api.post(`/admin/withdrawals/${withdrawalId}/approve`, data || {});
  }

  /**
   * Reject a withdrawal request
   */
  async rejectWithdrawal(
    withdrawalId: number,
    reason: string
  ): Promise<void> {
    await api.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason });
  }
}

export const workerWithdrawalService = new WorkerWithdrawalService();
