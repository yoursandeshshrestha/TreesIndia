import { API_BASE_URL, authenticatedFetch, handleResponse, APIError } from './base';

export interface WorkerApplicationRequest {
  experience_years: number;
  skills: string; // JSON array string
  contact_info: string; // JSON object string
  address: string; // JSON object string
  banking_info: string; // JSON object string
  aadhar_card: any; // File
  pan_card: any; // File
  profile_pic: any; // File
  police_verification: any; // File
}

export interface WorkerApplicationResponse {
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

class WorkerApplicationService {
  async submitApplication(data: WorkerApplicationRequest): Promise<WorkerApplicationResponse> {
    const formData = new FormData();

    // Add basic fields
    formData.append('experience_years', data.experience_years.toString());
    formData.append('skills', data.skills);
    formData.append('contact_info', data.contact_info);
    formData.append('address', data.address);
    formData.append('banking_info', data.banking_info);

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
    formData.append('police_verification', {
      uri: data.police_verification.uri,
      type: data.police_verification.type || 'image/jpeg',
      name: data.police_verification.name || 'police_verification.jpg',
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

    const response = await fetch(`${API_BASE_URL}/role-applications/worker`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type, let FormData handle it
      },
      body: formData,
    });

    return handleResponse<WorkerApplicationResponse>(response);
  }

  async getUserApplication(): Promise<UserApplicationResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/role-applications/me`);
    return handleResponse<UserApplicationResponse>(response);
  }
}

export const workerApplicationService = new WorkerApplicationService();

