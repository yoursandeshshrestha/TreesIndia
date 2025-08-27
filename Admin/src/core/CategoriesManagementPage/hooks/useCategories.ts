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

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(
        "/admin/categories?include=subcategories"
      );
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
    data: CreateCategoryRequest
  ): Promise<Category> => {
    try {
      const response = await apiClient.post("/admin/categories", data);
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
    data: UpdateCategoryRequest
  ): Promise<Category> => {
    try {
      const response = await apiClient.put(`/admin/categories/${id}`, data);
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

  const createSubcategory = async (
    data: CreateSubcategoryRequest,
    iconFile?: File
  ): Promise<Subcategory> => {
    try {
      let response;

      if (iconFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description || "");
        formData.append("parent_id", data.parent_id.toString());
        formData.append("is_active", data.is_active?.toString() || "true");
        formData.append("icon", iconFile);

        response = await apiClient.post("/admin/subcategories", formData);
      } else {
        // Use JSON for data without file
        response = await apiClient.post("/admin/subcategories", data);
      }

      const newSubcategory = response.data.data;
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === data.parent_id
            ? {
                ...cat,
                subcategories: [...(cat.subcategories || []), newSubcategory],
              }
            : cat
        )
      );
      return newSubcategory;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create subcategory"
      );
    }
  };

  const updateSubcategory = async (
    id: number,
    data: UpdateSubcategoryRequest,
    iconFile?: File
  ): Promise<Subcategory> => {
    try {
      let response;

      if (iconFile) {
        // Use FormData for file upload
        const formData = new FormData();
        if (data.name) formData.append("name", data.name);
        if (data.description) formData.append("description", data.description);
        if (data.parent_id)
          formData.append("parent_id", data.parent_id.toString());
        if (data.is_active !== undefined)
          formData.append("is_active", data.is_active.toString());
        formData.append("icon", iconFile);

        response = await apiClient.put(`/admin/subcategories/${id}`, formData);
      } else {
        // Use JSON for data without file
        response = await apiClient.put(`/admin/subcategories/${id}`, data);
      }

      const updatedSubcategory = response.data.data;
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          subcategories: (cat.subcategories || []).map((sub) =>
            sub.id === id ? updatedSubcategory : sub
          ),
        }))
      );
      return updatedSubcategory;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update subcategory"
      );
    }
  };

  const deleteSubcategory = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/subcategories/${id}`);
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          subcategories: (cat.subcategories || []).filter(
            (sub) => sub.id !== id
          ),
        }))
      );
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete subcategory"
      );
    }
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

  const toggleSubcategoryStatus = async (id: number): Promise<Subcategory> => {
    try {
      const response = await apiClient.patch(
        `/admin/subcategories/${id}/toggle`
      );
      const updatedSubcategory = response.data.data;
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          subcategories: (cat.subcategories || []).map((sub) =>
            sub.id === id ? updatedSubcategory : sub
          ),
        }))
      );
      return updatedSubcategory;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to toggle subcategory status"
      );
    }
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
