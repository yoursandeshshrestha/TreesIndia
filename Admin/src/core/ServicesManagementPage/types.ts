export interface Service {
  id: number;
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  price_type: "fixed" | "inquiry";
  price?: number;
  duration?: string;
  category_id: number;
  subcategory_id: number;
  category_name?: string; // Keep for backward compatibility
  subcategory_name?: string; // Keep for backward compatibility
  category?: Category; // New nested object
  subcategory?: Subcategory; // New nested object
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service_areas?: ServiceArea[];
}

export interface ServiceArea {
  id: number;
  city: string;
  state: string;
  country: string;
  pincodes?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceAreaRequest {
  city: string;
  state: string;
  country: string;
  pincodes?: string[];
  is_active?: boolean;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price_type: "fixed" | "inquiry";
  price?: number;
  duration?: string;
  category_id: number;
  subcategory_id: number;
  is_active?: boolean;
  service_area_ids: number[];
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  price_type?: "fixed" | "inquiry";
  price?: number;
  duration?: string;
  category_id?: number;
  subcategory_id?: number;
  is_active?: boolean;
}

export interface ServiceFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
  priceType?: "fixed" | "inquiry" | "all";
  categoryId?: number;
  subcategoryId?: number;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
