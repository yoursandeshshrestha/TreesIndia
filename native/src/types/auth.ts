export interface AuthUser {
  id: number;
  phone: string;
  name?: string;
  email?: string | null;
  avatar?: string | null;
  user_type: 'admin' | 'user' | 'worker' | 'normal' | 'broker';
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
}

