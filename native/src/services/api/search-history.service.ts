import { API_BASE_URL, authenticatedFetch } from './base';

export interface SearchHistoryEntry {
  id: number;
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
  searched_at: string;
}

export interface SaveSearchHistoryRequest {
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

interface SearchHistoryResponse {
  success: boolean;
  message: string;
  data: SearchHistoryEntry;
}

interface SearchHistoriesResponse {
  success: boolean;
  message: string;
  data: SearchHistoryEntry[];
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

class SearchHistoryService {
  /**
   * Save a location search to user's search history
   */
  async saveSearchHistory(
    searchData: SaveSearchHistoryRequest
  ): Promise<SearchHistoryEntry> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/search-history`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchData),
        }
      );

      const result: SearchHistoryResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save search history');
      }

      return result.data;
    } catch (error) {
      console.error('Error saving search history:', error);
      throw error;
    }
  }

  /**
   * Get recent search history for the authenticated user
   */
  async getRecentSearches(limit: number = 10): Promise<SearchHistoryEntry[]> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/search-history?limit=${limit}`
      );

      const result: SearchHistoriesResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to get recent searches');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error getting recent searches:', error);
      // Return empty array on error instead of throwing
      // This ensures the UI doesn't break if search history fails
      return [];
    }
  }

  /**
   * Delete a specific search history entry
   */
  async deleteSearchHistory(id: number): Promise<void> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/search-history/${id}`,
        {
          method: 'DELETE',
        }
      );

      const result: DeleteResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete search history');
      }
    } catch (error) {
      console.error('Error deleting search history:', error);
      throw error;
    }
  }

  /**
   * Clear all search history for the authenticated user
   */
  async clearAllSearchHistory(): Promise<void> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/search-history/clear`,
        {
          method: 'DELETE',
        }
      );

      const result: DeleteResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to clear search history');
      }
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }
}

export const searchHistoryService = new SearchHistoryService();
