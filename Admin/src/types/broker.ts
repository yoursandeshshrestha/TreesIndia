import { User } from "./worker";

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

export interface BrokerAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

export interface Documents {
  aadhar_card: string;
  pan_card: string;
  profile_pic: string;
}

// Enhanced Broker with parsed JSON
export interface EnhancedBroker {
  ID: number;
  id?: number; // For compatibility with existing components
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  user_id: number;
  role_application_id?: number | null;

  // Parsed JSON fields
  contact_info: ContactInfo;
  address: BrokerAddress;
  documents: Documents;

  // Regular fields
  license: string;
  agency: string;
  is_active: boolean;

  // Relationships
  user: User;
}

export interface BrokerFilterState {
  search: string;
  is_active: string;
  date_from: string;
  date_to: string;
}

export interface BrokersApiResponse {
  users: EnhancedBroker[];
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
