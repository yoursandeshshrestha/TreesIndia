import { API_BASE_URL, authenticatedFetch } from './base';

export interface UserLocation {
  id: number;
  user_id: number;
  city: string;
  state: string;
  country: string;
  address?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export interface CreateLocationRequest {
  city: string;
  state: string;
  country: string;
  address?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateLocationRequest {
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

class UserLocationService {
  async getUserLocation(): Promise<UserLocation | null> {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/locations/user/me`);

      if (!response.ok) {
        // Location doesn't exist yet or other error - handle gracefully
        return null;
      }

      const rawData = await response.json();

      // Backend returns: { success: true, message: "...", data: {...} }
      if (rawData && rawData.success && rawData.data) {
        return rawData.data;
      }

      return null;
    } catch (error) {
      // Handle gracefully - location is optional
      return null;
    }
  }

  async createOrUpdateLocation(
    data: CreateLocationRequest | UpdateLocationRequest
  ): Promise<UserLocation> {
    // Use PUT /locations/user/me which creates if doesn't exist, updates if exists
    const response = await authenticatedFetch(`${API_BASE_URL}/locations/user/me`, {
      method: 'PUT',
      body: JSON.stringify({
        city: data.city,
        state: data.state,
        country: data.country,
        address: data.address || '',
        postal_code: data.postal_code || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to save location');
    }

    const rawData = await response.json();

    // Backend returns: { success: true, message: "...", data: {...} }
    if (rawData && rawData.success && rawData.data) {
      return rawData.data;
    }

    throw new Error('Invalid response format');
  }
}

export const userLocationService = new UserLocationService();
