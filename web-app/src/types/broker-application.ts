export interface BrokerApplicationRequest {
  // Basic information
  license: string;
  agency: string;

  // JSON fields as strings (will be parsed by backend)
  contact_info: string; // JSON object string
  address: string; // JSON object string

  // Document files
  aadhar_card: File;
  pan_card: File;
  profile_pic: File;
}

export interface BrokerApplicationResponse {
  success: boolean;
  message: string;
  data: BrokerApplicationDetail;
}

export interface BrokerApplicationDetail {
  id: number;
  user_id: number;
  requested_role: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  broker?: {
    id: number;
    user_id: number;
    license: string;
    agency: string;
    contact_info: string;
    address: string;
    documents: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role_application_status: string;
  };
}

export interface BrokerApplicationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  application: BrokerApplicationDetail | null;
}
