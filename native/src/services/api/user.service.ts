import { API_BASE_URL, authenticatedFetch, handleResponse, tokenStorage, APIError } from './base';

export interface UserProfile {
  id: number;
  name: string;
  email?: string | null;
  phone: string;
  gender?: string;
  avatar?: string | null;
  user_type: string;
  wallet?: {
    balance: number;
  };
  subscription?: {
    start_date: string;
    end_date: string;
    status: string;
  };
  role_application?: {
    status: string;
    application_date?: string;
    approval_date?: string;
  };
}

export interface UpdateProfileRequest {
  name: string;
  email?: string;
  gender?: string;
}

export interface UpdateProfileResponse {
  name: string;
  email?: string | null;
  gender?: string;
}

export interface UploadAvatarResponse {
  avatar: string;
}

class UserService {
  async getUserProfile(): Promise<UserProfile> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/profile`);
    return handleResponse<UserProfile>(response);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse<UpdateProfileResponse>(response);
  }

  async uploadAvatar(imageUri: string, imageName: string): Promise<UploadAvatarResponse> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: imageName || 'avatar.jpg',
    } as any);

    // Get access token for manual header setting
    let accessToken = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();

    // If no access token but we have refresh token, try to refresh first
    if (!accessToken && refreshToken) {
      try {
        const { authService } = await import('./auth.service');
        await authService.refreshToken();
        accessToken = await tokenStorage.getAccessToken();
      } catch {
        throw new APIError('Authentication required', 401);
      }
    }

    if (!accessToken) {
      throw new APIError('Authentication required', 401);
    }

    const response = await fetch(`${API_BASE_URL}/users/upload-avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type, let FormData handle it
      },
      body: formData,
    });

    return handleResponse<UploadAvatarResponse>(response);
  }

  async requestDeleteOTP(): Promise<{ phone: string; expires_in: number }> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/request-delete-otp`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const data = await handleResponse<{ phone: string; expires_in: number; message: string }>(response);
    return {
      phone: data.phone,
      expires_in: data.expires_in || 300,
    };
  }

  async deleteAccount(): Promise<void> {
    const response = await authenticatedFetch(`${API_BASE_URL}/users/account`, {
      method: 'DELETE',
    });

    return handleResponse<void>(response);
  }
}

export const userService = new UserService();

