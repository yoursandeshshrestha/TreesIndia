import { authenticatedFetch, handleResponse, API_BASE_URL } from './base';

export interface Service {
  id?: number;
  ID?: number;
  name: string;
  slug: string;
  description?: string;
  price_type: 'fixed' | 'inquiry';
  price?: number;
  duration?: string;
  category_id?: number;
  category?: {
    id?: number;
    ID?: number;
    name: string;
    slug: string;
  };
  images?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  rating?: number; // Optional rating (0-5)
  total_bookings?: number; // Optional total bookings count
}

export interface SearchSuggestion {
  keyword: string;
  search_count?: number;
  category?: string;
}

export interface SearchSuggestionsResponse {
  keywords: SearchSuggestion[];
  services: Service[];
}

export interface SearchResponse {
  results: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ServicesResponse {
  success: boolean;
  message?: string;
  data?: Service[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

class ServiceService {
  /**
   * Search services with a query
   */
  async searchServices(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query.trim(),
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await authenticatedFetch(
      `${API_BASE_URL}/services/search?${params.toString()}`
    );
    const data = await handleResponse<SearchResponse>(response);

    // Normalize service data
    if (data.results && Array.isArray(data.results)) {
      data.results = data.results.map((service) => this.normalizeService(service));
    }

    return data;
  }

  /**
   * Get popular services
   */
  async getPopularServices(city?: string, state?: string): Promise<Service[]> {
    const params = new URLSearchParams();
    if (city) {
      params.append('city', city);
    }
    if (state) {
      params.append('state', state);
    }

    const url = `${API_BASE_URL}/services/popular${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url); // Public endpoint
    const data = await handleResponse<Service[]>(response);

    // Normalize service data - handle null/undefined gracefully
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return data.map((service) => this.normalizeService(service));
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(categoryName: string, limit: number = 10): Promise<Service[]> {
    const params = new URLSearchParams({
      category: categoryName,
      page: '1',
      limit: limit.toString(),
      exclude_inactive: 'true',
    });

    const url = `${API_BASE_URL}/services?${params.toString()}`;
    const response = await fetch(url); // Public endpoint
    const jsonData = await response.json();

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        errorMessage = jsonData.message || jsonData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Backend returns: { success, message, data: { services: [...], pagination: {...} } }
    let services: Service[] = [];
    if (jsonData.data && jsonData.data.services && Array.isArray(jsonData.data.services)) {
      services = jsonData.data.services;
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      // Fallback: if data is directly an array
      services = jsonData.data;
    } else if (Array.isArray(jsonData)) {
      // Fallback: if response is directly an array
      services = jsonData;
    }

    return services.map((service) => this.normalizeService(service));
  }

  /**
   * Get search suggestions (popular keywords and services)
   */
  async getSearchSuggestions(): Promise<SearchSuggestionsResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/services/search/suggestions`);
    const data = await handleResponse<SearchSuggestionsResponse>(response);

    // Normalize service data
    if (data.services && Array.isArray(data.services)) {
      data.services = data.services.map((service) => this.normalizeService(service));
    }

    // Ensure keywords is an array of SearchSuggestion objects
    if (data.keywords && Array.isArray(data.keywords)) {
      data.keywords = data.keywords.map((keyword) => {
        // If it's already an object, return it
        if (typeof keyword === 'object' && keyword !== null && 'keyword' in keyword) {
          return keyword as SearchSuggestion;
        }
        // If it's a string, convert to object
        if (typeof keyword === 'string') {
          return { keyword } as SearchSuggestion;
        }
        return { keyword: String(keyword) } as SearchSuggestion;
      });
    }

    return data;
  }

  /**
   * Get services with filters and pagination
   */
  async getServicesWithFilters(
    filters: {
      page?: number;
      limit?: number;
      price_type?: string;
      price_min?: number;
      price_max?: number;
      category?: string;
      subcategory?: string;
      search?: string;
    } = {}
  ): Promise<ServicesResponse> {
    const params = new URLSearchParams();

    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.price_type) {
      // Backend expects "fixed-price" or "inquiry-based" as the 'type' parameter
      const serviceType = filters.price_type === 'fixed' ? 'fixed-price' : 'inquiry-based';
      params.append('type', serviceType);
    }
    if (filters.price_min) {
      params.append('price_min', filters.price_min.toString());
    }
    if (filters.price_max) {
      params.append('price_max', filters.price_max.toString());
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.subcategory) {
      params.append('subcategory', filters.subcategory);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    // Always exclude inactive services
    params.append('exclude_inactive', 'true');

    const url = `${API_BASE_URL}/services?${params.toString()}`;
    const response = await fetch(url); // Public endpoint
    const jsonData = await response.json();

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        errorMessage = jsonData.message || jsonData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Backend returns: { success, message, data: { services: [...], pagination: {...} } }
    let services: Service[] = [];
    let pagination = undefined;

    if (jsonData.data) {
      if (jsonData.data.services && Array.isArray(jsonData.data.services)) {
        services = jsonData.data.services;
        pagination = jsonData.data.pagination;
      } else if (Array.isArray(jsonData.data)) {
        services = jsonData.data;
      }
    } else if (Array.isArray(jsonData)) {
      services = jsonData;
    }

    return {
      success: jsonData.success ?? true,
      message: jsonData.message,
      data: services.map((service) => this.normalizeService(service)),
      pagination,
    };
  }

  /**
   * Normalize service data to handle both ID and id formats
   */
  private normalizeService(service: any): Service {
    return {
      ...service,
      id: service.id || service.ID || 0,
      ID: service.ID || service.id || 0,
      category: service.category
        ? {
            ...service.category,
            id: service.category.id || service.category.ID || 0,
            ID: service.category.ID || service.category.id || 0,
          }
        : undefined,
    };
  }
}

export const serviceService = new ServiceService();
