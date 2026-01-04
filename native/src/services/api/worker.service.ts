import { API_BASE_URL, authenticatedFetch } from './base';

export interface Worker {
  id: number;
  user_id: number;
  name: string;
  email?: string;
  phone: string;
  alternative_number?: string;
  profile_pic?: string;
  experience_years: number;
  skills: string[];
  contact_info: {
    name: string;
    email: string;
    phone: string;
    alternative_number: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  banking_info?: {
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    bank_name: string;
  };
  rating?: number;
  total_jobs?: number;
  total_bookings?: number;
  earnings?: number;
  is_active: boolean;
  is_available?: boolean;
  is_verified: boolean;
  worker_type?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkerListResponse {
  success: boolean;
  message: string;
  data?: {
    workers: Worker[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      totalPages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    user_subscription?: {
      has_active_subscription: boolean;
      subscription_expiry_date: string | null;
    };
  };
}

export interface WorkerResponse {
  success: boolean;
  message: string;
  data?: {
    worker: Worker;
  };
}

export interface WorkerFilters {
  page?: number;
  limit?: number;
  skills?: string[];
  experience_min?: number;
  experience_max?: number;
  city?: string;
  state?: string;
  rating_min?: number;
  is_verified?: boolean;
  is_active?: boolean;
  is_available?: boolean;
  worker_type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

class WorkerService {
  /**
   * Get all workers with filters
   */
  async getWorkersWithFilters(filters: WorkerFilters = {}): Promise<WorkerListResponse> {
    const params = new URLSearchParams({
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 20).toString(),
    });

    // Only add is_active if explicitly provided, otherwise backend defaults to true
    if (filters.is_active !== undefined) {
      params.append('is_active', filters.is_active.toString());
    }

    if (filters.is_available !== undefined) {
      params.append('is_available', filters.is_available.toString());
    }

    // Worker type filtering is now enforced in the backend
    // Backend automatically shows only "normal" workers to non-admin users
    if (filters.worker_type) {
      params.append('worker_type', filters.worker_type);
    }

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.skills && filters.skills.length > 0) {
      params.append('skills', filters.skills.join(','));
    }

    // Backend uses min_experience and max_experience (not experience_min/max)
    if (filters.experience_min !== undefined) {
      params.append('min_experience', filters.experience_min.toString());
    }
    if (filters.experience_max !== undefined) {
      params.append('max_experience', filters.experience_max.toString());
    }

    if (filters.city) {
      params.append('city', filters.city);
    }
    if (filters.state) {
      params.append('state', filters.state);
    }

    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }

    // Note: rating_min and is_verified are not supported by the backend yet
    // They are kept in the interface for future compatibility

    const url = `${API_BASE_URL}/workers?${params.toString()}`;
    const response = await authenticatedFetch(url);
    const jsonData = await response.json();

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        errorMessage = jsonData.message || jsonData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Backend returns data in format: { success, message, data: { workers: [], pagination: {} } }
    let workers: Worker[] = [];
    if (jsonData.data && jsonData.data.workers && Array.isArray(jsonData.data.workers)) {
      workers = jsonData.data.workers.map((worker: Worker) => this.normalizeWorker(worker));
    }

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Workers retrieved successfully',
      data: {
        workers: workers,
        pagination: jsonData.data?.pagination || {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: workers.length,
          total_pages: 1,
          totalPages: 1,
          has_next: false,
          has_prev: false,
        },
      },
    };
  }

  /**
   * Get worker by ID
   */
  async getWorkerById(id: number): Promise<WorkerResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/workers/${id}`);
    const jsonData = await response.json();

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        errorMessage = jsonData.message || jsonData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Worker retrieved successfully',
      data: jsonData.data ? {
        worker: this.normalizeWorker(jsonData.data.worker),
      } : undefined,
    };
  }

  /**
   * Get workers by skill
   */
  async getWorkersBySkill(skill: string, limit: number = 10): Promise<Worker[]> {
    const response = await this.getWorkersWithFilters({
      skills: [skill],
      page: 1,
      limit: limit,
      is_active: true,
    });

    return response.data?.workers || [];
  }

  /**
   * Get top rated workers
   */
  async getTopRatedWorkers(limit: number = 10): Promise<Worker[]> {
    const response = await this.getWorkersWithFilters({
      page: 1,
      limit: limit,
      is_active: true,
      sortBy: 'rating',
      sortOrder: 'desc',
    });

    return response.data?.workers || [];
  }

  /**
   * Search workers
   */
  async searchWorkers(query: string, page: number = 1, limit: number = 20): Promise<WorkerListResponse> {
    return this.getWorkersWithFilters({
      search: query.trim(),
      page: page,
      limit: limit,
      is_active: true,
    });
  }

  /**
   * Get worker statistics
   */
  async getWorkerStats(): Promise<{
    total_workers: number;
    active_workers: number;
    available_workers: number;
    treesindia_workers: number;
    normal_workers: number;
  }> {
    const response = await authenticatedFetch(`${API_BASE_URL}/workers/stats`);
    const jsonData = await response.json();

    if (!response.ok) {
      throw new Error(jsonData.message || 'Failed to get worker statistics');
    }

    return jsonData.data;
  }

  /**
   * Normalize worker data to handle different formats
   */
  private normalizeWorker(worker: Record<string, never>): Worker {
    // Parse skills if it's a string
    let skills: string[] = [];
    if (worker.skills) {
      if (Array.isArray(worker.skills)) {
        skills = worker.skills;
      } else if (typeof worker.skills === 'string') {
        try {
          skills = JSON.parse(worker.skills);
        } catch {
          skills = [worker.skills];
        }
      }
    }

    // Parse contact_info if it's a string
    let contactInfo = worker.contact_info;
    if (typeof contactInfo === 'string') {
      try {
        contactInfo = JSON.parse(contactInfo);
      } catch {
        contactInfo = {
          name: worker.name || '',
          email: worker.email || '',
          phone: worker.phone || '',
          alternative_number: worker.alternative_number || '',
        };
      }
    }

    // Parse address if it's a string
    let address = worker.address;
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address);
      } catch {
        address = {
          street: '',
          city: '',
          state: '',
          pincode: '',
        };
      }
    }

    // Parse banking_info if it's a string
    let bankingInfo = worker.banking_info;
    if (typeof bankingInfo === 'string') {
      try {
        bankingInfo = JSON.parse(bankingInfo);
      } catch {
        bankingInfo = undefined;
      }
    }

    // Parse documents to extract profile_pic
    let profilePic = worker.profile_pic || worker.ProfilePic;
    if (!profilePic && worker.documents) {
      try {
        const documents = typeof worker.documents === 'string'
          ? JSON.parse(worker.documents)
          : worker.documents;
        profilePic = documents.profile_pic;
      } catch {
        // If parsing fails, profile_pic remains undefined
      }
    }

    // Get name from various sources with proper fallbacks
    const workerName = worker.name?.trim() ||
                       contactInfo?.name?.trim() ||
                       worker.contact_person_name?.trim() ||
                       'Worker';

    // Get phone from various sources
    const workerPhone = worker.phone?.trim() ||
                        contactInfo?.phone?.trim() ||
                        worker.contact_person_phone?.trim() ||
                        '';

    // Get email from various sources
    const workerEmail = worker.email?.trim() ||
                        contactInfo?.email?.trim() ||
                        worker.contact_person_email?.trim();

    // Get alternative number
    const altNumber = worker.alternative_number?.trim() ||
                      contactInfo?.alternative_number?.trim();

    return {
      id: worker.id || worker.ID || 0,
      user_id: worker.user_id || worker.UserID || 0,
      name: workerName,
      email: workerEmail,
      phone: workerPhone,
      alternative_number: altNumber,
      profile_pic: profilePic,
      experience_years: worker.experience_years || worker.ExperienceYears || 0,
      skills: skills,
      contact_info: {
        name: workerName,
        email: workerEmail || '',
        phone: workerPhone,
        alternative_number: altNumber || '',
      },
      address: address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
      banking_info: bankingInfo,
      rating: worker.rating || worker.Rating || 0,
      total_jobs: worker.total_jobs || worker.TotalJobs || worker.total_bookings || 0,
      total_bookings: worker.total_bookings || worker.total_jobs || 0,
      earnings: worker.earnings || 0,
      is_active: worker.is_active ?? worker.IsActive ?? true,
      is_available: worker.is_available ?? worker.IsAvailable ?? true,
      is_verified: worker.is_verified ?? worker.IsVerified ?? false,
      worker_type: worker.worker_type || worker.WorkerType,
      created_at: worker.created_at || worker.CreatedAt || '',
      updated_at: worker.updated_at || worker.UpdatedAt || '',
    };
  }
}

export const workerService = new WorkerService();
