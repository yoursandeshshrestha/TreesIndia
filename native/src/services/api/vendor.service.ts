import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'company', label: 'Company' },
  { value: 'llp', label: 'LLP' },
  { value: 'pvt_ltd', label: 'Private Limited' },
  { value: 'public_ltd', label: 'Public Limited' },
  { value: 'other', label: 'Other' },
];

export interface Vendor {
  id: number;
  user_id: number;
  vendor_name: string;
  business_description?: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email?: string;
  business_address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  business_type: string;
  years_in_business: number;
  services_offered: string[];
  profile_picture?: string;
  business_gallery: string[];
  rating?: number;
  total_jobs?: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorListResponse {
  success: boolean;
  message: string;
  data?: {
    vendors: Vendor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    user_subscription?: {
      has_active_subscription: boolean;
      subscription_expiry_date: string | null;
    };
  };
}

export interface VendorResponse {
  success: boolean;
  message: string;
  data?: {
    vendor: Vendor;
  };
}

export interface VendorFilters {
  page?: number;
  limit?: number;
  business_type?: string;
  search?: string;
  city?: string;
  state?: string;
}

export interface MyVendorListResponse {
  success: boolean;
  message: string;
  data?: Vendor[];
}

export interface CreateVendorResponse {
  success: boolean;
  message: string;
  data?: {
    vendor: Vendor;
  };
}

class VendorService {
  /**
   * Get all vendors with filters (requires subscription)
   */
  async getVendorsWithFilters(filters: VendorFilters = {}): Promise<VendorListResponse> {
    const params = new URLSearchParams({
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 20).toString(),
    });

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.business_type) {
      params.append('business_type', filters.business_type);
    }

    if (filters.city) {
      params.append('city', filters.city);
    }

    if (filters.state) {
      params.append('state', filters.state);
    }

    const url = `${API_BASE_URL}/vendors?${params.toString()}`;
    const response = await authenticatedFetch(url);
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

    // Backend returns data in format: { success, message, data: { vendors: [], pagination: {} } }
    let vendors: Vendor[] = [];
    if (jsonData.data && jsonData.data.vendors && Array.isArray(jsonData.data.vendors)) {
      vendors = jsonData.data.vendors.map((vendor: Vendor) => this.normalizeVendor(vendor));
    }

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Vendors retrieved successfully',
      data: {
        vendors: vendors,
        pagination: jsonData.data?.pagination || {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: vendors.length,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      },
    };
  }

  /**
   * Get vendor by ID (requires subscription)
   */
  async getVendorById(id: number): Promise<VendorResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/vendors/${id}`);
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

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Vendor retrieved successfully',
      data: jsonData.data
        ? {
            vendor: this.normalizeVendor(jsonData.data.vendor),
          }
        : undefined,
    };
  }

  /**
   * Search vendors (requires subscription)
   */
  async searchVendors(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<VendorListResponse> {
    const params = new URLSearchParams({
      q: query.trim(),
      page: page.toString(),
      limit: limit.toString(),
    });

    const url = `${API_BASE_URL}/vendors/search?${params.toString()}`;
    const response = await authenticatedFetch(url);
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

    let vendors: Vendor[] = [];
    if (jsonData.data && jsonData.data.vendors && Array.isArray(jsonData.data.vendors)) {
      vendors = jsonData.data.vendors.map((vendor: Vendor) => this.normalizeVendor(vendor));
    }

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Vendors retrieved successfully',
      data: {
        vendors: vendors,
        pagination: jsonData.data?.pagination || {
          page: page,
          limit: limit,
          total: vendors.length,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      },
    };
  }

  /**
   * Get vendors by business type (requires subscription)
   */
  async getVendorsByBusinessType(
    businessType: string,
    page: number = 1,
    limit: number = 20
  ): Promise<VendorListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const url = `${API_BASE_URL}/vendors/type/${businessType}?${params.toString()}`;
    const response = await authenticatedFetch(url);
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

    let vendors: Vendor[] = [];
    if (jsonData.data && jsonData.data.vendors && Array.isArray(jsonData.data.vendors)) {
      vendors = jsonData.data.vendors.map((vendor: Vendor) => this.normalizeVendor(vendor));
    }

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Vendors retrieved successfully',
      data: {
        vendors: vendors,
        pagination: jsonData.data?.pagination || {
          page: page,
          limit: limit,
          total: vendors.length,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      },
    };
  }

  /**
   * Get vendor statistics (requires authentication)
   */
  async getVendorStats(): Promise<{
    total_vendors: number;
    active_vendors: number;
    verified_vendors: number;
    by_business_type: Record<string, number>;
  }> {
    const response = await authenticatedFetch(`${API_BASE_URL}/vendors/stats`);
    const jsonData = await response.json();

    if (!response.ok) {
      throw new Error(jsonData.message || 'Failed to get vendor statistics');
    }

    return jsonData.data;
  }

  /**
   * Get user's own vendor profiles
   */
  async getUserVendors(): Promise<MyVendorListResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/vendors/my`);

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

    let vendors: Vendor[] = [];
    let rawVendors: any[] = [];

    if (Array.isArray(jsonData.data)) {
      rawVendors = jsonData.data;
    } else if (jsonData.data === null || jsonData.data === undefined) {
      rawVendors = [];
    } else if (Array.isArray(jsonData)) {
      rawVendors = jsonData;
    } else {
      rawVendors = [];
    }

    vendors = rawVendors.map((vendor: any) => this.normalizeVendor(vendor));

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Vendors retrieved successfully',
      data: vendors,
    };
  }

  /**
   * Create vendor profile
   */
  async createVendor(data: FormData): Promise<CreateVendorResponse> {
    // Get access token for manual header setting
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

    const response = await fetch(`${API_BASE_URL}/vendors`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type, let FormData handle it
      },
      body: data,
    });

    return handleResponse<CreateVendorResponse>(response);
  }

  /**
   * Update vendor profile
   */
  async updateVendor(id: number, data: FormData): Promise<CreateVendorResponse> {
    // Get access token for manual header setting
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

    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type, let FormData handle it
      },
      body: data,
    });

    return handleResponse<CreateVendorResponse>(response);
  }

  /**
   * Delete vendor profile
   */
  async deleteVendor(id: number): Promise<{ success: boolean; message: string }> {
    const response = await authenticatedFetch(`${API_BASE_URL}/vendors/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Normalize vendor data to handle different formats
   */
  private normalizeVendor(vendor: any): Vendor {
    // Parse services_offered if it's a string
    let servicesOffered: string[] = [];
    if (vendor.services_offered) {
      if (Array.isArray(vendor.services_offered)) {
        servicesOffered = vendor.services_offered;
      } else if (typeof vendor.services_offered === 'string') {
        try {
          servicesOffered = JSON.parse(vendor.services_offered);
        } catch {
          servicesOffered = [vendor.services_offered];
        }
      }
    }

    // Parse business_address if it's a string
    let businessAddress = vendor.business_address;
    if (typeof businessAddress === 'string') {
      try {
        businessAddress = JSON.parse(businessAddress);
      } catch {
        businessAddress = {
          street: '',
          city: '',
          state: '',
          pincode: '',
        };
      }
    }

    // Parse business_gallery if it's a string
    let businessGallery: string[] = [];
    if (vendor.business_gallery) {
      if (Array.isArray(vendor.business_gallery)) {
        businessGallery = vendor.business_gallery;
      } else if (typeof vendor.business_gallery === 'string') {
        try {
          businessGallery = JSON.parse(vendor.business_gallery);
        } catch {
          businessGallery = [vendor.business_gallery];
        }
      }
    }

    return {
      id: vendor.id || vendor.ID || 0,
      user_id: vendor.user_id || vendor.UserID || 0,
      vendor_name: vendor.vendor_name || vendor.VendorName || '',
      business_description: vendor.business_description || vendor.BusinessDescription,
      contact_person_name: vendor.contact_person_name || vendor.ContactPersonName || '',
      contact_person_phone: vendor.contact_person_phone || vendor.ContactPersonPhone || '',
      contact_person_email: vendor.contact_person_email || vendor.ContactPersonEmail,
      business_address: businessAddress || {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
      business_type: vendor.business_type || vendor.BusinessType || '',
      years_in_business: vendor.years_in_business || vendor.YearsInBusiness || 0,
      services_offered: servicesOffered,
      profile_picture: vendor.profile_picture || vendor.ProfilePicture,
      business_gallery: businessGallery,
      rating: vendor.rating || vendor.Rating || 0,
      total_jobs: vendor.total_jobs || vendor.TotalJobs || 0,
      is_active: vendor.is_active ?? vendor.IsActive ?? true,
      is_verified: vendor.is_verified ?? vendor.IsVerified ?? false,
      created_at: vendor.created_at || vendor.CreatedAt || '',
      updated_at: vendor.updated_at || vendor.UpdatedAt || '',
    };
  }
}

export const vendorService = new VendorService();
