export interface Property {
  ID: number;
  title: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  slug: string;
  sale_price?: number;
  monthly_rent?: number;
  price_negotiable: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  parking_spaces?: number;
  floor_number?: number;
  age?: "under_1_year" | "1_2_years" | "2_5_years" | "10_plus_years";
  furnishing_status?: FurnishingStatus;
  state: string;
  city: string;
  address?: string;
  pincode?: string;
  status: PropertyStatus;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: number;
  uploaded_by_admin: boolean;
  priority_score: number;
  subscription_required: boolean;
  treesindia_assured: boolean;
  images: string[];
  expires_at?: string;
  user_id: number;
  broker_id?: number;
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
  broker?: {
    ID: number;
    name: string;
    email?: string;
    phone?: string;
    user_type: string;
    is_active: boolean;
  };
  approved_by_user?: {
    ID: number;
    name: string;
    email?: string;
    phone?: string;
    user_type: string;
    is_active: boolean;
  };
}

export type PropertyType = "residential" | "commercial";
export type ListingType = "sale" | "rent";
export type PropertyStatus =
  | "available"
  | "sold" // For sale listings
  | "rented"; // For rent listings
export type FurnishingStatus = "furnished" | "semi_furnished" | "unfurnished";

export interface CreatePropertyRequest {
  title: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  sale_price?: number;
  monthly_rent?: number;
  price_negotiable: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  parking_spaces?: number;
  floor_number?: number;
  age?: "under_1_year" | "1_2_years" | "2_5_years" | "10_plus_years";
  furnishing_status?: FurnishingStatus;
  state: string;
  city: string;
  address?: string;
  pincode?: string;
  status: PropertyStatus;
  uploaded_by_admin: boolean;
  priority_score?: number;
  subscription_required?: boolean;
  treesindia_assured?: boolean;
  images?: string[];
  user_id: number;
  broker_id?: number;
}

export interface UpdatePropertyRequest {
  title?: string;
  description?: string;
  property_type?: PropertyType;
  listing_type?: ListingType;
  sale_price?: number;
  monthly_rent?: number;
  price_negotiable?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  parking_spaces?: number;
  floor_number?: number;
  age?: "under_1_year" | "1_2_years" | "2_5_years" | "10_plus_years";
  furnishing_status?: FurnishingStatus;
  state?: string;
  city?: string;
  locality?: string;
  address?: string;
  pincode?: string;
  status?: PropertyStatus;
  is_approved?: boolean;
  approved_at?: string;
  approved_by?: number;
  uploaded_by_admin?: boolean;
  priority_score?: number;
  subscription_required?: boolean;
  treesindia_assured?: boolean;
  images?: string[];
  user_id?: number;
  broker_id?: number;
}

export interface PropertyFilters {
  search: string;
  property_type: string;
  listing_type: string;
  status: string;
  furnishing_status: string;
  state: string;
  city: string;
  min_price: string;
  max_price: string;
  min_area: string;
  max_area: string;
  bedrooms: string;
  bathrooms: string;
  is_approved: string;
  uploaded_by_admin: string;
  treesindia_assured: string;
  sortBy: string;
  sortOrder: string;
}

export interface PropertyStats {
  total_properties: number;
  approved_properties: number;
  pending_properties: number;
  residential_properties: number;
  commercial_properties: number;
  sale_properties: number;
  rent_properties: number;
  expired_properties: number;
  treesindia_assured_properties: number;
}

export interface PropertyFormData {
  title: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  sale_price?: number;
  monthly_rent?: number;
  price_negotiable: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  parking_spaces?: number;
  floor_number?: number;
  age?: "under_1_year" | "1_2_years" | "2_5_years" | "10_plus_years";
  furnishing_status?: FurnishingStatus;
  state: string;
  city: string;
  address?: string;
  pincode?: string;
  status: PropertyStatus;
  uploaded_by_admin: boolean;
  priority_score: number;
  subscription_required: boolean;
  treesindia_assured: boolean;
  user_id: number;
  broker_id?: number;
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  data: Property;
}

export interface PropertiesResponse {
  success: boolean;
  message: string;
  data: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface PropertyStatsResponse {
  success: boolean;
  message: string;
  data: PropertyStats;
}

export type PropertyTabType =
  | "all"
  | "rented"
  | "sold"
  | "treesindia_assured"
  | "pending";
