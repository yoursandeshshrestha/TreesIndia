import { useState, useEffect } from "react";
import {
  Category,
  Subcategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateSubcategoryRequest,
  UpdateSubcategoryRequest,
} from "../types";
import { apiClient } from "@/lib/api-client";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async (parentId?: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      // Use parent_id query param: "root" for root categories, specific ID for children
      const url = parentId
        ? `/admin/categories?parent_id=${parentId}&include=children`
        : "/admin/categories?include=children";
      const response = await apiClient.get(url);
      setCategories(response.data.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (
    data: CreateCategoryRequest,
    imageFile?: File
  ): Promise<Category> => {
    try {
      let response;

      if (imageFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("name", data.name);
        if (data.description) formData.append("description", data.description);
        if (data.icon) formData.append("icon", data.icon);
        if (data.parent_id !== undefined && data.parent_id !== null) {
          formData.append("parent_id", data.parent_id.toString());
        }
        formData.append("is_active", (data.is_active ?? true).toString());
        formData.append("image", imageFile);

        response = await apiClient.post("/admin/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Use JSON for data without file
        response = await apiClient.post("/admin/categories", data);
      }

      const newCategory = response.data.data;
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create category"
      );
    }
  };

  const updateCategory = async (
    id: number,
    data: UpdateCategoryRequest,
    imageFile?: File
  ): Promise<Category> => {
    try {
      let response;

      if (imageFile) {
        // Use FormData for file upload
        const formData = new FormData();
        if (data.name) formData.append("name", data.name);
        if (data.description) formData.append("description", data.description);
        if (data.icon) formData.append("icon", data.icon);
        if (data.parent_id !== undefined) {
          formData.append("parent_id", data.parent_id?.toString() || "null");
        }
        if (data.is_active !== undefined) {
          formData.append("is_active", data.is_active.toString());
        }
        formData.append("image", imageFile);

        response = await apiClient.put(`/admin/categories/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Use JSON for data without file
        response = await apiClient.put(`/admin/categories/${id}`, data);
      }

      const updatedCategory = response.data.data;
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      return updatedCategory;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update category"
      );
    }
  };

  const deleteCategory = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  // Legacy: createSubcategory now uses unified category endpoint
  const createSubcategory = async (
    data: CreateSubcategoryRequest,
    iconFile?: File
  ): Promise<Subcategory> => {
    // Convert to CreateCategoryRequest and use createCategory
    return createCategory(
      data as CreateCategoryRequest,
      iconFile
    ) as Promise<Subcategory>;
  };

  // Legacy: updateSubcategory now uses unified category endpoint
  const updateSubcategory = async (
    id: number,
    data: UpdateSubcategoryRequest,
    iconFile?: File
  ): Promise<Subcategory> => {
    // Convert to UpdateCategoryRequest and use updateCategory
    return updateCategory(
      id,
      data as UpdateCategoryRequest,
      iconFile
    ) as Promise<Subcategory>;
  };

  // Legacy: deleteSubcategory now uses unified category endpoint
  const deleteSubcategory = async (id: number): Promise<void> => {
    return deleteCategory(id);
  };

  const toggleCategoryStatus = async (id: number): Promise<Category> => {
    try {
      const response = await apiClient.patch(`/admin/categories/${id}/toggle`);
      const updatedCategory = response.data.data;
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      return updatedCategory;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to toggle category status"
      );
    }
  };

  // Legacy: toggleSubcategoryStatus now uses unified category endpoint
  const toggleSubcategoryStatus = async (id: number): Promise<Subcategory> => {
    return toggleCategoryStatus(id) as Promise<Subcategory>;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleCategoryStatus,
    toggleSubcategoryStatus,
  };
}
