import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Profile types
export interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  user_type: string;
  avatar: string | null;
  gender: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  wallet: {
    balance: number;
  };
  subscription: {
    has_active_subscription: boolean;
    subscription_id: number | null;
    expiry_date: string | null;
    current_plan: any | null;
  };
  role_application: {
    status: string | null;
    application_date: string | null;
    approval_date: string | null;
  };
  notification_settings?: {
    email_notifications: boolean;
    sms_notifications: boolean;
    marketing_emails: boolean;
    booking_reminders: boolean;
    service_updates: boolean;
  };
  subscription_history?: Array<{
    id: number;
    plan_id: number;
    start_date: string;
    end_date: string;
    status: string;
    amount: number;
    payment_method: string;
    created_at: string;
  }>;
  subscription_warnings?: Array<{
    id: number;
    days_left: number;
    warning_date: string;
    sent_via: string;
    created_at: string;
  }>;
}

export interface ProfileUpdateRequest {
  name: string;
  email?: string;
  gender?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  booking_reminders: boolean;
  service_updates: boolean;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface NotificationSettingsResponse {
  success: boolean;
  message: string;
  data: NotificationSettings;
}

export interface AvatarUploadResponse {
  success: boolean;
  message: string;
  data: {
    avatar_url: string;
  };
}

// Get user profile
export async function getUserProfile(): Promise<ProfileResponse> {
  try {
    const url = `${API_BASE_URL}/users/profile`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(
  profileData: ProfileUpdateRequest
): Promise<ProfileResponse> {
  try {
    const url = `${API_BASE_URL}/users/profile`;
    const response = await authenticatedFetch(url, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Upload avatar
export async function uploadAvatar(file: File): Promise<AvatarUploadResponse> {
  try {
    const url = `${API_BASE_URL}/users/upload-avatar`;

    const formData = new FormData();
    formData.append("avatar", file);

    const accessToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    const refreshToken = getCookie(COOKIE_NAMES.REFRESH_TOKEN);

    // If no access token but we have refresh token, try to refresh first
    if (!accessToken && refreshToken) {
      try {
        const authAPI = AuthAPI.getInstance();
        await authAPI.refreshToken();
      } catch {
        removeCookie(COOKIE_NAMES.ACCESS_TOKEN);
        removeCookie(COOKIE_NAMES.REFRESH_TOKEN);
      }
    }

    const newAccessToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    const headers: HeadersInit = {};

    if (newAccessToken) {
      headers.Authorization = `Bearer ${newAccessToken}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Get notification settings
export async function getNotificationSettings(): Promise<NotificationSettingsResponse> {
  try {
    const url = `${API_BASE_URL}/users/notifications`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Update notification settings
export async function updateNotificationSettings(
  settings: NotificationSettings
): Promise<NotificationSettingsResponse> {
  try {
    const url = `${API_BASE_URL}/users/notifications`;
    const response = await authenticatedFetch(url, {
      method: "PUT",
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Request OTP for account deletion
export async function requestDeleteOTP(): Promise<NotificationSettingsResponse> {
  try {
    const url = `${API_BASE_URL}/users/request-delete-otp`;
    const response = await authenticatedFetch(url, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Delete account with OTP verification
export async function deleteAccount(
  otp: string
): Promise<NotificationSettingsResponse> {
  try {
    const url = `${API_BASE_URL}/users/account`;
    const response = await authenticatedFetch(url, {
      method: "DELETE",
      body: JSON.stringify({ otp }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Import necessary functions from auth-api
import { getCookie, removeCookie, COOKIE_NAMES, AuthAPI } from "./auth-api";
