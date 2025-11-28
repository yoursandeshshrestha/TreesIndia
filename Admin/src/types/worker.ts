export interface User {
  ID: number;
  id?: number; // For compatibility with existing components
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  name: string;
  email?: string | null;
  phone: string;
  user_type: string;
  avatar: string;
  gender: string;
  is_active: boolean;
  last_login_at?: string | null;
  role_application_status: string;
  application_date?: string | null;
  approval_date?: string | null;
  wallet_balance: number;
  subscription_id?: number | null;
  subscription?: unknown | null;
  has_active_subscription: boolean;
  subscription_expiry_date?: string | null;

  // Worker and Broker relationships
  worker?: Worker | null;
  broker?: Broker | null;
}

// Worker interface for the backend response
export interface Worker {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  user_id: number;
  role_application_id?: number | null;
  worker_type: string;
  contact_info: string; // JSON string
  address: string; // JSON string
  banking_info: string; // JSON string
  documents: string; // JSON string
  skills: string; // JSON string
  experience_years: number;
  is_available: boolean;
  rating: number;
  total_bookings: number;
  earnings: number;
  total_jobs: number;
  is_active: boolean;
}

// Broker interface for the backend response
export interface Broker {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  user_id: number;
  role_application_id?: number | null;
  contact_info: string; // JSON string
  address: string; // JSON string
  documents: string; // JSON string
  license: string;
  agency: string;
  is_active: boolean;
}

// Enhanced JSON types for better frontend consumption
export interface ContactInfo {
  alternative_number: string;
}

export interface WorkerAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

export interface BankingInfo {
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  account_holder_name: string;
}

export interface Documents {
  aadhar_card: string;
  pan_card: string;
  profile_pic: string;
  police_verification?: string;
}

// Enhanced Worker with parsed JSON
export interface EnhancedWorker {
  ID: number;
  id?: number; // For compatibility with existing components
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  user_id: number;
  role_application_id?: number | null;
  worker_type: string;

  // Parsed JSON fields
  contact_info: ContactInfo;
  address: WorkerAddress;
  banking_info: BankingInfo;
  documents: Documents;
  skills: string[];

  // Regular fields
  experience_years: number;
  is_available: boolean;
  rating: number;
  total_bookings: number;
  earnings: number;
  total_jobs: number;
  is_active: boolean;

  // Relationships
  user: User;
}

export interface WorkerFilterState {
  search: string;
  is_active: string;
  worker_type: string;
  user_type: string;
  date_from: string;
  date_to: string;
}

export interface WorkersApiResponse {
  users: EnhancedWorker[];
  pagination: {
    current_page: number;
    total_pages: number;
    total: number;
    limit: number;
  };
}

export interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
