export interface Service {
  id: number;
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  price_type: "fixed" | "inquiry";
  price?: number;
  duration?: string;
  category_id: number; // Now points to the deepest level category (typically Level 3)
  category?: Category; // Nested category object with hierarchy
  category_name?: string; // Keep for backward compatibility
  category_path?: string; // Full category path like "home service → electrician → ac repair"
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
  icon?: string;
  parent_id?: number | null;
  parent?: Category; // Parent category reference
  children?: Category[]; // Child categories
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
  category_id: number; // Typically Level 3 category
  is_active?: boolean;
  service_area_ids: number[];
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  price_type?: "fixed" | "inquiry";
  price?: number;
  duration?: string;
  category_id?: number; // Typically Level 3 category
  is_active?: boolean;
}

export interface ServiceFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
  priceType?: "fixed" | "inquiry" | "all";
  categoryId?: number; // Can filter by any level category
  subcategoryId?: number; // Legacy - kept for backward compatibility, treated as categoryId
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
