import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export interface WorkerAssignment {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string;
  booking_id: number;
  worker_id: number;
  assigned_by: number;
  status: 'assigned' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'reserved';
  assigned_at: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  rejected_at?: string;
  assignment_notes?: string;
  acceptance_notes?: string;
  rejection_notes?: string;
  rejection_reason?: string;
  booking: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    booking_reference: string;
    user_id: number;
    service_id: number;
    status: string;
    payment_status: string;
    booking_type: string;
    completion_type?: string;
    scheduled_date?: string;
    scheduled_time?: string;
    scheduled_end_time?: string;
    actual_start_time?: string;
    actual_end_time?: string;
    actual_duration_minutes?: number;
    address?: string;
    description: string;
    contact_person: string;
    contact_phone: string;
    special_instructions: string;
    hold_expires_at?: string;
    quote_amount?: number;
    quote_notes: string;
    quote_provided_by?: number;
    quote_provided_at?: string;
    quote_accepted_at?: string;
    quote_expires_at?: string;
    user: {
      ID: number;
      name: string;
      email?: string;
      user_type: string;
      avatar: string;
      gender: string;
      is_active: boolean;
      last_login_at?: string;
      role_application_status: string;
      application_date?: string;
      approval_date?: string;
      wallet_balance: number;
      subscription_id?: number;
      subscription?: string;
      has_active_subscription: boolean;
      subscription_expiry_date?: string;
      notification_settings?: unknown;
    };
    service: {
      id: number;
      name: string;
      slug: string;
      description: string;
      images: string[];
      price_type: string;
      price?: number;
      duration?: string;
      category_id: number;
      category: {
        id: number;
        created_at: string;
        updated_at: string;
        name: string;
        slug: string;
        description: string;
        icon: string;
        parent_id: number;
        is_active: boolean;
      };
      is_active: boolean;
      created_at: string;
      updated_at: string;
      deleted_at?: string;
    };
  };
  worker: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    name: string;
    email?: string;
    phone: string;
    user_type: string;
    avatar: string;
    gender: string;
    is_active: boolean;
    last_login_at?: string;
    role_application_status: string;
    application_date?: string;
    approval_date?: string;
    wallet_balance: number;
    subscription_id?: number;
    subscription?: string;
    has_active_subscription: boolean;
    subscription_expiry_date?: string;
    notification_settings?: unknown;
  };
  assigned_by_user: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string;
    name: string;
    email?: string;
    phone: string;
    user_type: string;
    avatar: string;
    gender: string;
    is_active: boolean;
    last_login_at?: string;
    role_application_status: string;
    application_date?: string;
    approval_date?: string;
    wallet_balance: number;
    subscription_id?: number;
    subscription?: string;
    has_active_subscription: boolean;
    subscription_expiry_date?: string;
    notification_settings?: unknown;
  };
}

export interface WorkerAssignmentListResponse {
  assignments: WorkerAssignment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AcceptAssignmentRequest {
  notes?: string;
}

export interface RejectAssignmentRequest {
  reason: string;
  notes?: string;
}

class WorkerAssignmentService {
  /**
   * Get all assignments for the authenticated worker
   */
  async getWorkerAssignments(
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<WorkerAssignmentListResponse> {
    const params = new URLSearchParams();

    if (status) {
      params.append('status', status);
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const url = `${API_BASE_URL}/worker/assignments?${params.toString()}`;

    const response = await authenticatedFetch(url);
    const rawJson = await response.json();
    const result = rawJson.data || rawJson;
    return result;
  }

  /**
   * Get a specific assignment by ID
   */
  async getWorkerAssignment(assignmentId: number): Promise<WorkerAssignment> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/worker/assignments/${assignmentId}`
    );
    return handleResponse<WorkerAssignment>(response);
  }

  /**
   * Accept an assignment
   */
  async acceptAssignment(
    assignmentId: number,
    request: AcceptAssignmentRequest
  ): Promise<WorkerAssignment> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/worker/assignments/${assignmentId}/accept`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return handleResponse<WorkerAssignment>(response);
  }

  /**
   * Reject an assignment
   */
  async rejectAssignment(
    assignmentId: number,
    request: RejectAssignmentRequest
  ): Promise<WorkerAssignment> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/worker/assignments/${assignmentId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return handleResponse<WorkerAssignment>(response);
  }

  /**
   * Start work on an assignment
   */
  async startAssignment(assignmentId: number): Promise<WorkerAssignment> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/worker/assignments/${assignmentId}/start`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );
    return handleResponse<WorkerAssignment>(response);
  }

  /**
   * Complete an assignment
   */
  async completeAssignment(assignmentId: number): Promise<WorkerAssignment> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/worker/assignments/${assignmentId}/complete`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );
    return handleResponse<WorkerAssignment>(response);
  }
}

export const workerAssignmentService = new WorkerAssignmentService();
