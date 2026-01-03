import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export interface Property {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  property_type: string;
  listing_type: string;
  slug?: string;
  sale_price?: number;
  monthly_rent?: number;
  price_negotiable: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  floor_number?: number;
  age?: string;
  furnishing_status?: string;
  state: string;
  city: string;
  address?: string;
  pincode?: string;
  images: string[];
  status: string;
  is_approved: boolean;
  uploaded_by_admin: boolean;
  treesindia_assured: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  approved_at?: string;
  approved_by?: number;
  priority_score: number;
  subscription_required: boolean;
  expires_at?: string;
  broker_id?: number;
  contact_number?: string;
  owner_name?: string;
}

export interface PropertyListResponse {
  success: boolean;
  message: string;
  data?: Property[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  data?: Property;
}

class PropertyService {
  async getUserProperties(page: number = 1, limit: number = 20): Promise<PropertyListResponse> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/user/properties?page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const jsonData = await response.json();
    
    // Backend returns: { success, message, data: [...], pagination: {...} }
    // handleResponse would extract data.data, but we need the full structure
    // So we need to parse the full response ourselves
    let properties: Property[] = [];
    
    let rawProperties: any[] = [];
    if (Array.isArray(jsonData.data)) {
      rawProperties = jsonData.data;
    } else if (jsonData.data === null || jsonData.data === undefined) {
      // Backend returns { data: null } when no properties exist
      rawProperties = [];
    } else if (Array.isArray(jsonData)) {
      // Fallback: if response is directly an array
      rawProperties = jsonData;
    } else {
      rawProperties = [];
    }
    
    // Normalize property data (handle ID -> id, etc.)
    properties = rawProperties.map((prop: any) => ({
      ...prop,
      id: prop.id ?? prop.ID,
      user_id: prop.user_id || prop.UserID,
      title: prop.title || prop.Title,
      description: prop.description || prop.Description,
      property_type: prop.property_type || prop.PropertyType,
      listing_type: prop.listing_type || prop.ListingType,
      sale_price: prop.sale_price || prop.SalePrice,
      monthly_rent: prop.monthly_rent || prop.MonthlyRent,
      price_negotiable: prop.price_negotiable ?? prop.PriceNegotiable ?? true,
      bedrooms: prop.bedrooms || prop.Bedrooms,
      bathrooms: prop.bathrooms || prop.Bathrooms,
      area: prop.area || prop.Area,
      floor_number: prop.floor_number || prop.FloorNumber,
      age: prop.age || prop.Age,
      furnishing_status: prop.furnishing_status || prop.FurnishingStatus,
      state: prop.state || prop.State,
      city: prop.city || prop.City,
      address: prop.address || prop.Address,
      pincode: prop.pincode || prop.Pincode,
      images: prop.images || prop.Images || [],
      status: prop.status || prop.Status,
      is_approved: prop.is_approved ?? prop.IsApproved ?? false,
      uploaded_by_admin: prop.uploaded_by_admin ?? prop.UploadedByAdmin ?? false,
      treesindia_assured: prop.treesindia_assured ?? prop.TreesIndiaAssured ?? false,
      created_at: prop.created_at || prop.CreatedAt,
      updated_at: prop.updated_at || prop.UpdatedAt,
      deleted_at: prop.deleted_at || prop.DeletedAt,
      approved_at: prop.approved_at || prop.ApprovedAt,
      approved_by: prop.approved_by || prop.ApprovedBy,
      priority_score: prop.priority_score || prop.PriorityScore || 0,
      subscription_required: prop.subscription_required ?? prop.SubscriptionRequired ?? false,
      expires_at: prop.expires_at || prop.ExpiresAt,
      broker_id: prop.broker_id || prop.BrokerID,
      // Extract contact information from nested user object
      contact_number: prop.contact_number || prop.ContactNumber || prop.contact || prop.Contact ||
                     (prop.user?.phone || prop.user?.Phone) || (prop.User?.phone || prop.User?.Phone),
      owner_name: prop.owner_name || prop.OwnerName || prop.owner || prop.Owner ||
                 (prop.user?.name || prop.user?.Name) || (prop.User?.name || prop.User?.Name),
    }));
    
    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Properties retrieved successfully',
      data: properties,
      pagination: jsonData.pagination,
    };
  }

  async createProperty(data: FormData): Promise<PropertyResponse> {
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
        throw new Error('Authentication required');
      }
    }

    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/user/properties`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type, let FormData handle it
      },
      body: data,
    });

    return handleResponse<PropertyResponse>(response);
  }

  async updateProperty(id: number, data: FormData): Promise<PropertyResponse> {
    // Get access token for manual header setting (similar to create property)
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
        throw new Error('Authentication required');
      }
    }

    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/user/properties/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type, let FormData handle it
      },
      body: data,
    });

    return handleResponse<PropertyResponse>(response);
  }

  async deleteProperty(id: number): Promise<{ success: boolean; message: string }> {
    const response = await authenticatedFetch(`${API_BASE_URL}/user/properties/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Get properties with filters
   */
  async getPropertiesWithFilters(
    filters: {
      page?: number;
      limit?: number;
      listing_type?: string;
      bedrooms?: number;
      bathrooms?: number;
      max_price?: number;
      property_type?: string;
      furnishing_status?: string;
      search?: string;
    } = {}
  ): Promise<PropertyListResponse> {
    const params = new URLSearchParams({
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 20).toString(),
      is_approved: 'true',
      status: 'available',
      sortBy: 'priority_score',
      sortOrder: 'desc',
    });

    if (filters.listing_type) {
      params.append('listing_type', filters.listing_type);
    }
    if (filters.bedrooms) {
      params.append('bedrooms', filters.bedrooms.toString());
    }
    if (filters.bathrooms) {
      params.append('bathrooms', filters.bathrooms.toString());
    }
    if (filters.max_price) {
      params.append('max_price', filters.max_price.toString());
    }
    if (filters.property_type) {
      params.append('property_type', filters.property_type);
    }
    if (filters.furnishing_status) {
      params.append('furnishing_status', filters.furnishing_status);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const url = `${API_BASE_URL}/properties?${params.toString()}`;
    const response = await fetch(url);
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

    let properties: Property[] = [];
    let rawProperties: any[] = [];
    
    if (Array.isArray(jsonData.data)) {
      rawProperties = jsonData.data;
    } else if (jsonData.data === null || jsonData.data === undefined) {
      rawProperties = [];
    } else if (Array.isArray(jsonData)) {
      rawProperties = jsonData;
    } else {
      rawProperties = [];
    }

    // Normalize property data with image parsing
    properties = rawProperties.map((prop: any) => {
      let images: string[] = [];
      if (prop.images) {
        if (Array.isArray(prop.images)) {
          images = prop.images;
        } else if (typeof prop.images === 'string') {
          try {
            const parsed = JSON.parse(prop.images);
            if (Array.isArray(parsed)) {
              images = parsed;
            }
          } catch {
            images = [prop.images];
          }
        }
      } else if (prop.Images) {
        if (Array.isArray(prop.Images)) {
          images = prop.Images;
        } else if (typeof prop.Images === 'string') {
          try {
            const parsed = JSON.parse(prop.Images);
            if (Array.isArray(parsed)) {
              images = parsed;
            }
          } catch {
            images = [prop.Images];
          }
        }
      }

      return {
        ...prop,
        id: prop.id ?? prop.ID,
        user_id: prop.user_id || prop.UserID,
        title: prop.title || prop.Title,
        description: prop.description || prop.Description,
        property_type: prop.property_type || prop.PropertyType,
        listing_type: prop.listing_type || prop.ListingType,
        sale_price: prop.sale_price || prop.SalePrice,
        monthly_rent: prop.monthly_rent || prop.MonthlyRent,
        price_negotiable: prop.price_negotiable ?? prop.PriceNegotiable ?? true,
        bedrooms: prop.bedrooms || prop.Bedrooms,
        bathrooms: prop.bathrooms || prop.Bathrooms,
        area: prop.area || prop.Area,
        floor_number: prop.floor_number || prop.FloorNumber,
        age: prop.age || prop.Age,
        furnishing_status: prop.furnishing_status || prop.FurnishingStatus,
        state: prop.state || prop.State,
        city: prop.city || prop.City,
        address: prop.address || prop.Address,
        pincode: prop.pincode || prop.Pincode,
        images: images,
        status: prop.status || prop.Status,
        is_approved: prop.is_approved ?? prop.IsApproved ?? false,
        uploaded_by_admin: prop.uploaded_by_admin ?? prop.UploadedByAdmin ?? false,
        treesindia_assured: prop.treesindia_assured ?? prop.TreesIndiaAssured ?? false,
        created_at: prop.created_at || prop.CreatedAt,
        updated_at: prop.updated_at || prop.UpdatedAt,
        deleted_at: prop.deleted_at || prop.DeletedAt,
        approved_at: prop.approved_at || prop.ApprovedAt,
        approved_by: prop.approved_by || prop.ApprovedBy,
        priority_score: prop.priority_score || prop.PriorityScore || 0,
        subscription_required: prop.subscription_required ?? prop.SubscriptionRequired ?? false,
        expires_at: prop.expires_at || prop.ExpiresAt,
        broker_id: prop.broker_id || prop.BrokerID,
        // Extract contact information from nested user object
        contact_number: prop.contact_number || prop.ContactNumber || prop.contact || prop.Contact ||
                       (prop.user?.phone || prop.user?.Phone) || (prop.User?.phone || prop.User?.Phone),
        owner_name: prop.owner_name || prop.OwnerName || prop.owner || prop.Owner ||
                   (prop.user?.name || prop.user?.Name) || (prop.User?.name || prop.User?.Name),
      };
    });

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Properties retrieved successfully',
      data: properties,
      pagination: jsonData.pagination,
    };
  }

  /**
   * Get all properties (public endpoint)
   */
  async getAllProperties(page: number = 1, limit: number = 20): Promise<PropertyListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      is_approved: 'true', // Only show approved properties
      status: 'available', // Only show available properties
      sortBy: 'priority_score', // Sort by priority score (properties with images usually have higher priority)
      sortOrder: 'desc', // Descending order
    });

    const response = await fetch(`${API_BASE_URL}/properties?${params.toString()}`); // Public endpoint
    const jsonData = await response.json();

    // Debug: Log the raw response
    if (jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
      // First property data available
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        errorMessage = jsonData.message || jsonData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    let properties: Property[] = [];
    let rawProperties: any[] = [];
    
    if (Array.isArray(jsonData.data)) {
      rawProperties = jsonData.data;
    } else if (jsonData.data === null || jsonData.data === undefined) {
      rawProperties = [];
    } else if (Array.isArray(jsonData)) {
      rawProperties = jsonData;
    } else {
      rawProperties = [];
    }

    // Normalize property data
    properties = rawProperties.map((prop: any) => {
      // Handle images - could be array, JSON string, or null
      let images: string[] = [];
      if (prop.images) {
        if (Array.isArray(prop.images)) {
          images = prop.images;
        } else if (typeof prop.images === 'string') {
          try {
            const parsed = JSON.parse(prop.images);
            if (Array.isArray(parsed)) {
              images = parsed;
            }
          } catch {
            // If parsing fails, treat as single URL
            images = [prop.images];
          }
        }
      } else if (prop.Images) {
        if (Array.isArray(prop.Images)) {
          images = prop.Images;
        } else if (typeof prop.Images === 'string') {
          try {
            const parsed = JSON.parse(prop.Images);
            if (Array.isArray(parsed)) {
              images = parsed;
            }
          } catch {
            images = [prop.Images];
          }
        }
      }

      return {
        ...prop,
        id: prop.id ?? prop.ID,
        user_id: prop.user_id || prop.UserID,
        title: prop.title || prop.Title,
        description: prop.description || prop.Description,
        property_type: prop.property_type || prop.PropertyType,
        listing_type: prop.listing_type || prop.ListingType,
        sale_price: prop.sale_price || prop.SalePrice,
        monthly_rent: prop.monthly_rent || prop.MonthlyRent,
        price_negotiable: prop.price_negotiable ?? prop.PriceNegotiable ?? true,
        bedrooms: prop.bedrooms || prop.Bedrooms,
        bathrooms: prop.bathrooms || prop.Bathrooms,
        area: prop.area || prop.Area,
        floor_number: prop.floor_number || prop.FloorNumber,
        age: prop.age || prop.Age,
        furnishing_status: prop.furnishing_status || prop.FurnishingStatus,
        state: prop.state || prop.State,
        city: prop.city || prop.City,
        address: prop.address || prop.Address,
        pincode: prop.pincode || prop.Pincode,
        images: images,
        status: prop.status || prop.Status,
        is_approved: prop.is_approved ?? prop.IsApproved ?? false,
        uploaded_by_admin: prop.uploaded_by_admin ?? prop.UploadedByAdmin ?? false,
        treesindia_assured: prop.treesindia_assured ?? prop.TreesIndiaAssured ?? false,
        created_at: prop.created_at || prop.CreatedAt,
        updated_at: prop.updated_at || prop.UpdatedAt,
        deleted_at: prop.deleted_at || prop.DeletedAt,
        approved_at: prop.approved_at || prop.ApprovedAt,
        approved_by: prop.approved_by || prop.ApprovedBy,
        priority_score: prop.priority_score || prop.PriorityScore || 0,
        subscription_required: prop.subscription_required ?? prop.SubscriptionRequired ?? false,
        expires_at: prop.expires_at || prop.ExpiresAt,
        broker_id: prop.broker_id || prop.BrokerID,
        // Extract contact information from nested user object
        contact_number: prop.contact_number || prop.ContactNumber || prop.contact || prop.Contact ||
                       (prop.user?.phone || prop.user?.Phone) || (prop.User?.phone || prop.User?.Phone),
        owner_name: prop.owner_name || prop.OwnerName || prop.owner || prop.Owner ||
                   (prop.user?.name || prop.user?.Name) || (prop.User?.name || prop.User?.Name),
      };
    });

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Properties retrieved successfully',
      data: properties,
      pagination: jsonData.pagination,
    };
  }
}

export const propertyService = new PropertyService();

