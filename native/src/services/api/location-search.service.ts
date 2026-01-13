import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export interface LocationPrediction {
  place_id: string;
  description: string;
  formatted_address?: string;
  city?: string;
  state?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
  latitude: number;
  longitude: number;
  address_line1?: string;
  address_line2?: string;
}

export interface AutocompleteResponse {
  success: boolean;
  message: string;
  data: LocationPrediction[];
}

class LocationSearchService {
  async searchLocations(query: string, latitude?: number, longitude?: number): Promise<LocationPrediction[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        input: query.trim(),
      });

      if (latitude && longitude) {
        params.append('latitude', latitude.toString());
        params.append('longitude', longitude.toString());
        params.append('radius', '5000'); // 5km radius
      }

      const response = await authenticatedFetch(`${API_BASE_URL}/places/autocomplete?${params.toString()}`);

      if (!response.ok) {
        return [];
      }

      const rawData = await response.json();

      // Backend returns: { success: true, message: "...", data: { status: "OK", predictions: [...] } }
      let results: LocationPrediction[] = [];

      if (rawData && typeof rawData === 'object') {
        // Check for predictions array in data.predictions
        if (rawData.data) {
          if (rawData.data.predictions && Array.isArray(rawData.data.predictions)) {
            results = rawData.data.predictions;
          } else if (Array.isArray(rawData.data)) {
            // Fallback: check if data is directly an array
            results = rawData.data;
          }
        } else if (Array.isArray(rawData)) {
          results = rawData;
        }
      }

      return results;
    } catch (error) {
      return [];
    }
  }
}

export const locationSearchService = new LocationSearchService();

