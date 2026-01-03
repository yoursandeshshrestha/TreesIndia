import { authenticatedFetch, handleResponse, API_BASE_URL } from './base';

export interface Category {
  id?: number;
  ID?: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string; // Icon URL or icon name
  is_active?: boolean;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

class CategoryService {
  /**
   * Get all categories with optional filtering
   */
  async getCategories(parentId?: string, isActive?: boolean): Promise<Category[]> {
    const params = new URLSearchParams();
    if (parentId) {
      params.append('parent_id', parentId);
    }
    if (isActive !== undefined) {
      params.append('is_active', isActive.toString());
    }

    const url = `${API_BASE_URL}/categories${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url); // Public endpoint
    const data = await handleResponse<Category[]>(response);

    // Normalize category data - ensure icon field is properly extracted
    return data.map((category) => ({
      ...category,
      id: category.id || category.ID || 0,
      ID: category.ID || category.id || 0,
      // Preserve icon as-is from backend (empty string, URL, null, or undefined)
      // Don't normalize it - let it pass through exactly as received
    }));
  }

  /**
   * Get root categories (parent_id is null)
   */
  async getRootCategories(isActive: boolean = true): Promise<Category[]> {
    return this.getCategories('root', isActive);
  }
}

export const categoryService = new CategoryService();

