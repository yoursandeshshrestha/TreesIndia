import { UserSubscription } from "./subscription";

export interface Vendor {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  vendor_name: string;
  business_description: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
  business_address:
    | string
    | {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string;
      };
  business_type:
    | "individual"
    | "partnership"
    | "company"
    | "llp"
    | "pvt_ltd"
    | "public_ltd"
    | "other";
  years_in_business: number;
  services_offered: string[];
  profile_picture: string;
  business_gallery: string[];
  is_active: boolean;
  user_id: number;
  user?: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
    email: string | null;
    phone: string;
    user_type: string;
    avatar: string;
    gender: string;
    is_active: boolean;
    last_login_at: string;
    role_application_status: string;
    application_date: string | null;
    approval_date: string | null;
    wallet_balance: number;
    subscription_id: number | null;
    subscription: UserSubscription | null;
    has_active_subscription: boolean;
    subscription_expiry_date: string | null;
    notification_settings: Record<string, unknown> | null;
  };
  // Legacy fields for backward compatibility
  id?: number;
  created_at?: string;
  updated_at?: string;
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
  timestamp: string;
}

export interface UserVendorsResponse {
  success: boolean;
  message: string;
  data: Vendor[];
  timestamp: string;
}

export interface VendorFilters {
  page?: number;
  limit?: number;
  business_type?: string;
  location?: string;
  city?: string;
  state?: string;
  services?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  is_active?: boolean;
}

export interface CreateVendorRequest {
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
  business_type:
    | "individual"
    | "partnership"
    | "company"
    | "llp"
    | "pvt_ltd"
    | "public_ltd"
    | "other";
  years_in_business: number;
  services_offered: string[];
  profile_picture?: File;
  business_gallery?: File[];
}

export interface UpdateVendorRequest {
  vendor_name?: string;
  business_description?: string;
  contact_person_name?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  business_address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  business_type?:
    | "individual"
    | "partnership"
    | "company"
    | "llp"
    | "pvt_ltd"
    | "public_ltd"
    | "other";
  years_in_business?: number;
  services_offered?: string[];
  is_active?: boolean;
}

export interface VendorStats {
  total_vendors: number;
  active_vendors: number;
  inactive_vendors: number;
}
