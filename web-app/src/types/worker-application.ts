export interface WorkerApplicationRequest {
  // Basic information
  experience_years: number;

  // JSON fields as strings (will be parsed by backend)
  skills: string; // JSON array string
  contact_info: string; // JSON object string
  address: string; // JSON object string
  banking_info: string; // JSON object string

  // Document files
  aadhar_card: File;
  pan_card: File;
  profile_pic: File;
  police_verification: File;
}

export interface WorkerApplicationResponse {
  success: boolean;
  message: string;
  data: WorkerApplicationDetail;
  timestamp: string;
}

export interface WorkerApplicationDetail {
  ID: number;
  user_id: number;
  requested_role: "worker";
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  CreatedAt: string;
  UpdatedAt: string;
  user?: UserDetail;
  worker?: EnhancedWorker;
}

export interface UserDetail {
  ID: number;
  name: string;
  email?: string;
  phone: string;
  user_type: string;
  avatar: string;
  is_active: boolean;
  role_application_status: string;
  application_date?: string;
  approval_date?: string;
  CreatedAt: string;
}

// Enhanced Worker with parsed JSON data
export interface EnhancedWorker {
  ID: number;
  user_id: number;
  role_application_id?: number;
  worker_type: "normal" | "treesindia_worker";

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

  CreatedAt: string;
  UpdatedAt: string;
}

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

export interface WorkerApplicationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  application: WorkerApplicationDetail | null;
}
