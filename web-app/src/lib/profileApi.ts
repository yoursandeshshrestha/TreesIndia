import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Helper function to parse and format Go validation error messages
function formatValidationError(errorMessage: string): string {
  // Pattern: Key: 'ProfileUpdateRequest.Name' Error:Field validation for 'Name' failed on the 'required' tag
  // Handle variations with or without spaces after Error:
  const validationPattern = /Key:\s*'[^']*\.(\w+)'\s*Error:?\s*Field validation for\s*'(\w+)'\s*failed on the\s*'(\w+)'\s*tag/i;
  const match = errorMessage.match(validationPattern);

  if (match) {
    const fieldName = match[2] || match[1]; // Use the field name from the error message
    const validationTag = match[3];

    // Convert field names to user-friendly labels
    const fieldLabels: Record<string, string> = {
      Name: "Name",
      Email: "Email",
      Gender: "Gender",
      Phone: "Phone",
      name: "Name",
      email: "Email",
      gender: "Gender",
      phone: "Phone",
    };

    const friendlyFieldName = fieldLabels[fieldName] || fieldName;

    // Convert validation tags to user-friendly messages
    const validationMessages: Record<string, string> = {
      required: `${friendlyFieldName} is required`,
      email: `${friendlyFieldName} must be a valid email address`,
      min: `${friendlyFieldName} is too short`,
      max: `${friendlyFieldName} is too long`,
      alphanum: `${friendlyFieldName} must contain only letters and numbers`,
      numeric: `${friendlyFieldName} must be a number`,
    };

    return (
      validationMessages[validationTag] ||
      `${friendlyFieldName} validation failed (${validationTag})`
    );
  }

  // If it doesn't match the pattern, try to extract a simpler message
  // Handle cases like "Email already exists" or other direct messages
  if (errorMessage.includes("already exists")) {
    return errorMessage;
  }

  // Return a cleaned version if it's still a validation error format
  if (errorMessage.includes("Field validation")) {
    // Try to extract just the meaningful part
    const simpleMatch = errorMessage.match(/Field validation for '(\w+)' failed/);
    if (simpleMatch) {
      const fieldName = simpleMatch[1];
      const fieldLabels: Record<string, string> = {
        Name: "Name",
        Email: "Email",
        Gender: "Gender",
        name: "Name",
        email: "Email",
        gender: "Gender",
      };
      return `${fieldLabels[fieldName] || fieldName} is invalid`;
    }
  }

  // Return the original message if we can't parse it
  return errorMessage;
}

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
    start_date: string;
    end_date: string;
    status: "active" | "expired" | "cancelled";
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
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
      });

      // Extract the specific error message from the backend response
      let errorMessage = `HTTP error! status: ${response.status}`;

      if (errorData.error) {
        // Backend returns error in 'error' field - format validation errors
        errorMessage = formatValidationError(errorData.error);
      } else if (errorData.message) {
        // Backend returns error in 'message' field - format validation errors
        errorMessage = formatValidationError(errorData.message);
      }

      throw new Error(errorMessage);
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
