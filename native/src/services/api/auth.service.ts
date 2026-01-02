import { API_BASE_URL, authenticatedFetch, handleResponse, tokenStorage, APIError } from './base';

export interface AuthResponse {
  user: any;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  is_new_user: boolean;
}

export interface RequestOTPResponse {
  phone: string;
  expires_in: number;
  is_new_user: boolean;
}

class AuthService {
  async requestOTP(phone: string): Promise<RequestOTPResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    return handleResponse<RequestOTPResponse>(response);
  }

  async verifyOTP(phone: string, otp: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });

    const authData = await handleResponse<AuthResponse>(response);

    // Store tokens
    if (authData.access_token && authData.refresh_token) {
      await tokenStorage.setTokens(
        authData.access_token,
        authData.refresh_token
      );
    }

    return authData;
  }

  async logout(): Promise<void> {
    try {
      await authenticatedFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      await tokenStorage.clearTokens();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = await tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new APIError('No refresh token available', 401);
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const authData = await handleResponse<AuthResponse>(response);

    // Update tokens
    if (authData.access_token && authData.refresh_token) {
      await tokenStorage.setTokens(
        authData.access_token,
        authData.refresh_token
      );
    }

    return authData;
  }

  async getCurrentUser() {
    const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
    return handleResponse(response);
  }

  async isAuthenticated(): Promise<boolean> {
    const accessToken = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();

    if (!accessToken && !refreshToken) {
      return false;
    }

    if (accessToken) {
      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
        if (response.ok) {
          return true;
        }
      } catch {
        // Access token validation failed
      }
    }

    if (refreshToken) {
      try {
        await this.refreshToken();
        return true;
      } catch {
        await tokenStorage.clearTokens();
        return false;
      }
    }

    return false;
  }
}

export const authService = new AuthService();


