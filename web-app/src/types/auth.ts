export interface AuthUser {
  id: number;
  phone: string;
  name?: string;
  email?: string | null;
  user_type: "admin" | "user" | "worker" | "normal" | "broker";
  wallet_balance: number;
  is_active: boolean;
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

export interface LoginState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends LoginState {
  requestOTP: (phone: string) => Promise<RequestOTPResponse>;
  verifyOTP: (phone: string, otp: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}
