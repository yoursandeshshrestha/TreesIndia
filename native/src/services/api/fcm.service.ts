import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';
import { Platform } from 'react-native';

interface FCMTokenRegistrationRequest {
  user_id?: number;
  token: string;
  platform: 'android' | 'ios';
  device_info?: {
    model?: string;
    os_version?: string;
    app_version?: string;
  };
}

interface FCMTokenResponse {
  success: boolean;
  message: string;
}

export const fcmService = {
  /**
   * Register FCM token with the backend
   */
  async registerToken(token: string, deviceInfo?: Record<string, string>): Promise<FCMTokenResponse> {
    const platform = Platform.OS === 'android' ? 'android' : 'ios';

    const requestBody: FCMTokenRegistrationRequest = {
      user_id: 0, // Will be overridden by backend from auth token
      token,
      platform,
      device_info: deviceInfo,
    };

    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/register-device`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    return handleResponse<FCMTokenResponse>(response);
  },

  /**
   * Unregister FCM token from the backend
   */
  async unregisterToken(token: string): Promise<FCMTokenResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/unregister-device?token=${encodeURIComponent(token)}`, {
      method: 'DELETE',
    });

    return handleResponse<FCMTokenResponse>(response);
  },

  /**
   * Get all devices for the authenticated user
   */
  async getUserDevices(): Promise<{ devices: Array<{ token: string; platform: string; is_active: boolean }> }> {
    const response = await authenticatedFetch(`${API_BASE_URL}/notifications/devices`, {
      method: 'GET',
    });

    return handleResponse<{ devices: Array<{ token: string; platform: string; is_active: boolean }> }>(response);
  },
};
