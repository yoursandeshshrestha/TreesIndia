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
  icon?: string;
  parent_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category;
}

export interface CreateSubcategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  parent_id: number;
  is_active?: boolean;
}

export interface UpdateSubcategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  parent_id?: number;
  is_active?: boolean;
}

export interface SubcategoryFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
  serviceType?: "all" | "home" | "construction";
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
