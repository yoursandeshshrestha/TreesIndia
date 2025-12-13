// Unified Category interface supporting hierarchical structure
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string; // Icon for the category (moved from subcategory)
  parent_id?: number | null; // NULL for root categories (Level 1)
  parent?: Category; // Parent category reference
  children?: Category[]; // Child categories (all levels)
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Legacy support - for backward compatibility
  subcategories?: Category[]; // Alias for children (deprecated)
}

// Legacy Subcategory interface - kept for backward compatibility
// Now just an alias for Category with parent_id
export interface Subcategory extends Category {
  parent_id: number; // Required for subcategories (Level 2 or 3)
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string; // Icon name or URL
  parent_id?: number | null; // Optional: NULL for root (Level 1), number for nested
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  parent_id?: number | null;
  is_active?: boolean;
}

// Legacy interfaces - kept for backward compatibility
export interface CreateSubcategoryRequest extends CreateCategoryRequest {
  parent_id: number; // Required for subcategories
}

export interface UpdateSubcategoryRequest extends UpdateCategoryRequest {
  parent_id?: number;
}

export interface CategoryFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
