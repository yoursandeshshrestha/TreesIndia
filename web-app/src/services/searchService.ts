import { authenticatedFetch } from "@/lib/auth-api";

// Types for search API responses
export interface SearchSuggestion {
  keyword: string;
  search_count: number;
  category: string;
}

export interface SearchService {
  id: number;
  name: string;
  slug: string;
  description: string;
  images?: string[] | null;
  price_type: string;
  price?: number;
  duration?: string;
  category_id: number;
  subcategory_id: number;
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  subcategory: {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    parent_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service_areas?: Record<string, unknown>[];
}

export interface SearchSuggestionsResponse {
  keywords: SearchSuggestion[];
  services: SearchService[];
}

export interface SearchResult {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  price_type: string;
  price?: number;
  duration?: string;
  rating: number;
  total_bookings: number;
  images?: string[] | null;
  service_areas: string[];
  match_score: number;
  match_reason: string;
  highlighted_name?: string;
  highlighted_description?: string;
  highlighted_price?: string;
  created_at: string;
  updated_at: string;
}

export interface QueryAnalysis {
  original_query: string;
  detected_type:
    | "price_filter"
    | "service_type_filter"
    | "keyword_search"
    | "combined_filter"
    | "unknown";
  parsed_filters: Record<string, unknown>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SearchMetadata {
  query: string;
  search_time_ms: number;
  total_results: number;
  filter_applied?: string;
  suggestions?: string[];
}

export interface SearchResponse {
  query_analysis: QueryAnalysis;
  results: SearchResult[];
  pagination: PaginationInfo;
  search_metadata: SearchMetadata;
}

export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

// API service functions
export const searchService = {
  /**
   * Get search suggestions (5 keywords + 5 services)
   */
  getSuggestions: async (): Promise<SearchSuggestionsResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/services/search/suggestions`
    );
    const data = await handleApiResponse(response);
    return data.data;
  },

  /**
   * Search services with intelligent query parsing
   */
  searchServices: async (params: SearchParams): Promise<SearchResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("q", params.q);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await authenticatedFetch(
      `${API_BASE_URL}/services/search?${queryParams.toString()}`
    );
    const data = await handleApiResponse(response);
    return data.data;
  },

  /**
   * Advanced search with filters
   */
  searchServicesAdvanced: async (
    params: SearchParams & {
      category?: string;
      subcategory?: string;
      price_min?: number;
      price_max?: number;
      price_type?: string;
      city?: string;
      state?: string;
      sort_by?: string;
      sort_order?: string;
    }
  ): Promise<SearchResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("q", params.q);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.category) queryParams.append("category", params.category);
    if (params.subcategory)
      queryParams.append("subcategory", params.subcategory);
    if (params.price_min)
      queryParams.append("price_min", params.price_min.toString());
    if (params.price_max)
      queryParams.append("price_max", params.price_max.toString());
    if (params.price_type) queryParams.append("price_type", params.price_type);
    if (params.city) queryParams.append("city", params.city);
    if (params.state) queryParams.append("state", params.state);
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await authenticatedFetch(
      `${API_BASE_URL}/services/search/advanced?${queryParams.toString()}`
    );
    const data = await handleApiResponse(response);
    return data.data;
  },
};
