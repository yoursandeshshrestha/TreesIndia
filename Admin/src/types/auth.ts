export interface AuthUser {
  id: number;
  phone: string;
  name?: string;
  email?: string;
  user_type: "normal" | "worker" | "broker" | "contractor" | "admin";
  is_active: boolean;
  credits_remaining: number;
  wallet_balance: number;
  wallet_limit: number;
  created_at: string;
  last_login_at?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    is_new_user: boolean;
  };
}

export interface RequestOTPRequest {
  phone: string;
}

export interface RequestOTPResponse {
  success: boolean;
  message: string;
  data: {
    phone: string;
    expires_in: number;
  };
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: TokenResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  requestOTP: (phone: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}
