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
  id: number;
  user_id: number;
  role_application_id?: number;
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
  created_at: string;
  updated_at: string;
}

// Enhanced Broker with parsed JSON
export interface EnhancedBroker {
  id: number;
  user_id: number;
  role_application_id?: number;

  // Parsed JSON fields
  contact_info: ContactInfo;
  address: WorkerAddress;
  documents: Documents;

  // Broker specific
  license: string;
  agency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced RoleApplication with parsed JSON data
export interface EnhancedRoleApplication {
  ID: number;
  id?: number; // For compatibility with existing components
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  user_id: number;
  requested_role: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: number | null;

  // Relationships
  user: User;
  reviewed_by_user?: User | null;
  worker?: EnhancedWorker;
  broker?: EnhancedBroker;
}

// Legacy interface for backward compatibility
export interface RoleApplication {
  id: number;
  user_id: number;
  requested_role: string;
  status: string;
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: number;

  // Worker-specific fields
  worker_type?: string;
  skills?: string[];
  experience_years?: number;
  bank_details?: {
    account_holder: string;
    account_number: string;
    ifsc_code: string;
    bank_name: string;
    bank_branch: string;
  };

  // Broker-specific fields
  broker_license?: string;
  broker_agency?: string;

  // Common fields
  address: {
    city: string;
    state: string;
    country: string;
    address: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
  };
  documents: {
    aadhaar_card: string;
    pan_card: string;
    police_verification?: string;
    profile_pic: string;
  };

  created_at: string;
  updated_at: string;

  // Relationships
  user?: User;
}

export interface RoleApplicationFilterState {
  search: string;
  status: string;
  requested_role: string;
  date_from: string;
  date_to: string;
}

export interface RoleApplicationsApiResponse {
  applications: EnhancedRoleApplication[];
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
