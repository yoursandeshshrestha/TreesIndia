import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export interface EarningsSummary {
  total_earnings: number;
  hours_worked: number;
  fixed_services_count: number;
  inquiry_services_count: number;
  total_services: number;
  period: '30_days' | '90_days' | 'all_time';
}

export interface WithdrawalSummary {
  total_earnings: number;
  total_withdrawals: number;
  pending_withdrawals: number;
  available_balance: number;
  hours_worked: number;
  fixed_services_count: number;
  inquiry_services_count: number;
  total_services: number;
  period: '30_days' | '90_days' | 'all_time';
}

export interface RecentAssignment {
  id: number;
  service_name: string;
  completed_at: string;
  earnings: number;
  duration_minutes?: number;
  duration_hours?: number;
  booking_reference: string;
  service_type: 'fixed' | 'inquiry';
}

export interface WorkerEarningsDashboard {
  summary: EarningsSummary;
  recent_assignments: RecentAssignment[];
  withdrawal_summary?: WithdrawalSummary;
}

export interface WorkerEarningsDashboardResponse {
  success: boolean;
  message: string;
  data: {
    dashboard: WorkerEarningsDashboard;
  };
}

export type PeriodFilter = '30_days' | '90_days' | 'all_time';

class WorkerEarningsService {
  /**
   * Get worker earnings dashboard with optional time period filter
   */
  async getEarningsDashboard(
    period: PeriodFilter = '30_days'
  ): Promise<WorkerEarningsDashboard> {
    const url = `${API_BASE_URL}/worker/earnings/dashboard?period=${period}`;
    const response = await authenticatedFetch(url);
    const result: WorkerEarningsDashboardResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch earnings dashboard');
    }

    return result.data.dashboard;
  }
}

export const workerEarningsService = new WorkerEarningsService();
