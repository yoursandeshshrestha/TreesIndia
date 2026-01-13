export interface AuthUser {
  id: number;
  phone: string;
  name?: string;
  email?: string | null;
  avatar?: string | null;
  user_type: 'admin' | 'user' | 'worker' | 'normal' | 'broker';
  worker_type?: 'normal' | 'treesindia_worker';
  wallet_balance: number;
  is_active: boolean;
  has_active_subscription?: boolean;
  subscription?: string; // Can be "active", "expired", "cancelled", etc.
  subscription_expiry_date?: string | null;
  created_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  is_new_user: boolean;
}

export interface RequestOTPRequest {
  phone: string;
}

export interface RequestOTPResponse {
  phone: string;
  expires_in: number;
  is_new_user: boolean;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasActiveSubscription: boolean;
  subscriptionExpiryDate: string | null;
  workerProfile: WorkerProfile | null;
  brokerProfile: BrokerProfile | null;
}

// Worker and Broker profile types (placeholder - to be imported from services)
export interface WorkerProfile {
  id: number;
  user_id: number;
  worker_type: 'normal' | 'treesindia_worker';
  contact_info: { alternative_number: string };
  address: Address;
  skills: string[];
  experience_years: number;
  banking_info: BankingInfo;
  is_active: boolean;
  is_available: boolean;
  rating: number;
  total_bookings: number;
}

export interface BrokerProfile {
  id: number;
  user_id: number;
  contact_info: { alternative_number: string };
  address: Address;
  license: string;
  agency: string;
  is_active: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export interface BankingInfo {
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  account_holder_name: string;
}

