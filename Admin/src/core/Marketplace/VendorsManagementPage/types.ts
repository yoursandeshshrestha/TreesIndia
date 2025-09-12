export interface Vendor {
  ID: number;
  vendor_name: string;
  business_description?: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email?: string;
  business_address: BusinessAddress;
  business_type: BusinessType;
  years_in_business: number;
  services_offered: string[];
  profile_picture?: string;
  business_gallery: string[];
  is_active: boolean;
  user_id: number;
  CreatedAt: string;
  UpdatedAt: string;
  user?: {
    ID: number;
    name: string;
    email?: string;
    phone?: string;
    user_type: string;
    is_active: boolean;
  };
}

export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export type BusinessType =
  | "individual"
  | "partnership"
  | "company"
  | "llp"
  | "pvt_ltd"
  | "public_ltd"
  | "other";

export interface CreateVendorRequest {
  vendor_name: string;
  business_description?: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email?: string;
  business_address: BusinessAddress;
  business_type: BusinessType;
  years_in_business: number;
  services_offered: string[];
}

export interface UpdateVendorRequest {
  vendor_name?: string;
  business_description?: string;
  contact_person_name?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  business_address?: BusinessAddress;
  business_type?: BusinessType;
  years_in_business?: number;
  services_offered?: string[];
  is_active?: boolean;
}

export interface VendorFilters {
  search: string;
  business_type: string;
  state: string;
  city: string;
  is_active: string;
  sortBy: string;
  sortOrder: string;
}

export interface VendorStats {
  total_vendors: number;
  active_vendors: number;
  inactive_vendors: number;
}

export interface VendorFormData {
  vendor_name: string;
  business_description: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
  business_address: BusinessAddress;
  business_type: BusinessType;
  years_in_business: number;
  services_offered: string[];
  is_active: boolean;
  user_id: number;
}

export interface VendorResponse {
  success: boolean;
  message: string;
  data: Vendor;
}

export interface VendorsResponse {
  success: boolean;
  message: string;
  data: {
    vendors: Vendor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export interface VendorStatsResponse {
  success: boolean;
  message: string;
  data: VendorStats;
}

export type VendorTabType = "all" | "active" | "inactive";
