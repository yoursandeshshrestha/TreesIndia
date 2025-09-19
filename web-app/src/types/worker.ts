import { UserSubscription } from "./subscription";

export interface Worker {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  user_id: number;
  role_application_id?: number;
  worker_type: "normal" | "treesindia_worker";

  // JSON fields as objects (parsed from backend)
  contact_info: {
    alternative_number: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
  };
  banking_info: {
    account_number: string;
    ifsc_code: string;
    bank_name: string;
    account_holder_name: string;
  };
  documents: {
    aadhar_card: string;
    pan_card: string;
    profile_pic: string;
    police_verification?: string;
  };
  skills: string[] | string;

  // Regular fields
  experience_years: number;
  is_available: boolean;
  rating: number;
  total_bookings: number;
  earnings: number;
  total_jobs: number;
  is_active: boolean;

  // User relationship
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
    last_login_at: string;
    role_application_status: string;
    application_date: string | null;
    approval_date: string | null;
    wallet_balance: number;
    subscription_id: number | null;
    subscription: UserSubscription | null;
    has_active_subscription: boolean;
    subscription_expiry_date: string | null;
    notification_settings: Record<string, unknown> | null;
  };

  // Legacy fields for backward compatibility
  id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkersResponse {
  success: boolean;
  message: string;
  data: {
    workers: Worker[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  timestamp: string;
}

export interface WorkerFilters {
  page?: number;
  limit?: number;
  search?: string;
  worker_type?: "normal" | "treesindia_worker";
  is_available?: boolean;
  is_active?: boolean;
  skills?: string;
  min_experience?: number;
  max_experience?: number;
  state?: string;
  city?: string;
  location?: string;
  min_rating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface WorkerStats {
  total: number;
  normal: number;
  treesindia_worker: number;
  available: number;
  unavailable: number;
  active: number;
  inactive: number;
}
