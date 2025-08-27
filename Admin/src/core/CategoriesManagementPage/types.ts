export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subcategories?: Subcategory[];
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
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
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

export interface CategoryFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
