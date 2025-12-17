import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Worker Assignment types
export interface WorkerAssignment {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  booking_id: number;
  worker_id: number;
  assigned_by: number;
  status: string;
  assigned_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  assignment_notes: string;
  acceptance_notes: string;
  rejection_notes: string;
  rejection_reason: string;

  // Relationships
  booking?: {
    ID: number;
    booking_reference: string;
    status: string;
    scheduled_date: string | null;
    scheduled_time: string | null;
    contact_person: string;
    contact_phone: string;
    address: string;
    description: string;
    service?: {
      id: number;
      name: string;
      price: number | null;
      duration: string | null;
    };
    user?: {
      ID: number;
      name: string;
      phone: string;
    };
  };
  worker?: {
    ID: number;
    name: string;
    phone: string;
  };
  assigned_by_user?: {
    ID: number;
    name: string;
    phone: string;
  };
}

export interface WorkerAssignmentFilters {
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface WorkerAssignmentResponse {
  success: boolean;
  message: string;
  data: {
    assignments: WorkerAssignment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
  timestamp: string;
}

export interface AcceptAssignmentRequest {
  notes?: string;
}

export interface RejectAssignmentRequest {
  reason: string;
  notes?: string;
}

export interface StartAssignmentRequest {
  notes?: string;
}

export interface CompleteAssignmentRequest {
  notes?: string;
  materials_used?: string[];
  photos?: string[];
}

// Helper function to handle API responses for single item responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        errorData.error ||
        `HTTP error! status: ${response.status}`
    );
  }
  const data = await response.json();
  // Extract data from response if it's wrapped in a response object
  return data.data || data;
};

export const workerAssignmentApi = {
  // Get worker assignments
  getWorkerAssignments: async (
    filters?: WorkerAssignmentFilters
  ): Promise<WorkerAssignmentResponse> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.date) params.append("date", filters.date);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const url = `${API_BASE_URL}/worker/assignments${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await authenticatedFetch(url);
    const fullResponse = await response.json();
    // Backend returns { success, message, data: { assignments, pagination }, timestamp }
    // Frontend expects the same structure
    return fullResponse as WorkerAssignmentResponse;
  },

  // Get specific worker assignment
  getWorkerAssignment: async (
    assignmentId: number
  ): Promise<{ assignment: WorkerAssignment }> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/worker/assignments/${assignmentId}`
    );
    const result = await handleApiResponse(response);
    // Backend returns assignment directly in data, wrap it
    return { assignment: result as WorkerAssignment };
  },

  // Accept assignment
  acceptAssignment: async (
    assignmentId: number,
    data: AcceptAssignmentRequest
  ): Promise<{ assignment: WorkerAssignment }> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/worker/assignments/${assignmentId}/accept`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await handleApiResponse(response);
    // Backend returns assignment directly in data, wrap it
    return { assignment: result as WorkerAssignment };
  },

  // Reject assignment
  rejectAssignment: async (
    assignmentId: number,
    data: RejectAssignmentRequest
  ): Promise<{ assignment: WorkerAssignment }> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/worker/assignments/${assignmentId}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await handleApiResponse(response);
    // Backend returns assignment directly in data, wrap it
    return { assignment: result as WorkerAssignment };
  },

  // Start assignment
  startAssignment: async (
    assignmentId: number,
    data: StartAssignmentRequest
  ): Promise<{ assignment: WorkerAssignment }> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/worker/assignments/${assignmentId}/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await handleApiResponse(response);
    // Backend returns assignment directly in data, wrap it
    return { assignment: result as WorkerAssignment };
  },

  // Complete assignment
  completeAssignment: async (
    assignmentId: number,
    data: CompleteAssignmentRequest
  ): Promise<{ assignment: WorkerAssignment }> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/worker/assignments/${assignmentId}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await handleApiResponse(response);
    // Backend returns assignment directly in data, wrap it
    return { assignment: result as WorkerAssignment };
  },
};
