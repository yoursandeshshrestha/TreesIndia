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
  category?: Category;
  subcategory?: Subcategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price_type: "fixed" | "inquiry";
  price?: number;
  duration?: string;
  category_id: number;
  subcategory_id: number;
  is_active?: boolean;
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
