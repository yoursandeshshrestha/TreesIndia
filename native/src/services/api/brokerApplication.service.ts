import { API_BASE_URL, authenticatedFetch, handleResponse, APIError } from './base';

export interface BrokerApplicationRequest {
  license: string;
  agency: string;
  contact_info: string; // JSON object string
  address: string; // JSON object string
  aadhar_card: any; // File
  pan_card: any; // File
  profile_pic: any; // File
}

export interface BrokerApplicationResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    submitted_at: string;
  };
}

export interface UserApplicationResponse {
  success: boolean;
  data?: {
    id: number;
    status: string;
    requested_role: string;
    submitted_at?: string;
    approval_date?: string;
    rejection_reason?: string;
  };
}

class BrokerApplicationService {
  async submitApplication(data: BrokerApplicationRequest): Promise<BrokerApplicationResponse> {
    const formData = new FormData();

    // Add basic fields
    formData.append('license', data.license);
    formData.append('agency', data.agency);
    formData.append('contact_info', data.contact_info);
    formData.append('address', data.address);

    // Add files
    formData.append('aadhar_card', {
      uri: data.aadhar_card.uri,
      type: data.aadhar_card.type || 'image/jpeg',
      name: data.aadhar_card.name || 'aadhar_card.jpg',
    } as any);
    formData.append('pan_card', {
      uri: data.pan_card.uri,
      type: data.pan_card.type || 'image/jpeg',
      name: data.pan_card.name || 'pan_card.jpg',
    } as any);
    formData.append('profile_pic', {
      uri: data.profile_pic.uri,
      type: data.profile_pic.type || 'image/jpeg',
      name: data.profile_pic.name || 'profile_pic.jpg',
    } as any);

    // Get access token for manual header setting (similar to avatar upload)
    const { tokenStorage } = await import('./base');
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

    const response = await fetch(`${API_BASE_URL}/role-applications/broker`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type, let FormData handle it
      },
      body: formData,
    });

    return handleResponse<BrokerApplicationResponse>(response);
  }

  async getUserApplication(): Promise<UserApplicationResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/role-applications/me`);
    return handleResponse<UserApplicationResponse>(response);
  }
}

export const brokerApplicationService = new BrokerApplicationService();
