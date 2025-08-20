import { useState, useEffect } from "react";
import {
  Category,
  Subcategory,
  CreateSubcategoryRequest,
  UpdateSubcategoryRequest,
} from "../types";
import { apiClient } from "@/lib/api-client";

export function useSubcategories() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubcategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/subcategories");
      // Handle both array and object response formats
      const data = response.data.data || response.data || [];
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch subcategories"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createSubcategory = async (
    data: CreateSubcategoryRequest,
    imageFile?: File
  ): Promise<Subcategory> => {
    try {
      let response;

      if (imageFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("parent_id", data.parent_id.toString());
        formData.append("is_active", data.is_active?.toString() || "true");
        formData.append("image", imageFile);

        response = await apiClient.post("/admin/subcategories", formData);
      } else {
        // Use JSON for data without file
        response = await apiClient.post("/admin/subcategories", data);
      }

      const newSubcategory = response.data.data || response.data;
      setSubcategories((prev) => [...prev, newSubcategory]);
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
    imageFile?: File
  ): Promise<Subcategory> => {
    try {
      let response;

      if (imageFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("name", data.name || "");
        formData.append("parent_id", data.parent_id?.toString() || "");
        formData.append("is_active", data.is_active?.toString() || "true");
        formData.append("image", imageFile);

        response = await apiClient.put(`/admin/subcategories/${id}`, formData);
      } else {
        // Use JSON for data without file
        response = await apiClient.put(`/admin/subcategories/${id}`, data);
      }

      const updatedSubcategory = response.data.data || response.data;
      setSubcategories((prev) =>
        prev.map((sub) => (sub.id === id ? updatedSubcategory : sub))
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
      setSubcategories((prev) => prev.filter((sub) => sub.id !== id));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete subcategory"
      );
    }
  };

  const toggleSubcategoryStatus = async (id: number): Promise<void> => {
    try {
      const response = await apiClient.patch(
        `/admin/subcategories/${id}/status`,
        {}
      );
      const updatedSubcategory = response.data.data || response.data;
      setSubcategories((prev) =>
        prev.map((sub) => (sub.id === id ? updatedSubcategory : sub))
      );
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : "Failed to toggle subcategory status"
      );
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(
        "/admin/categories?exclude_inactive=true"
      );
      const data = response.data.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  return {
    subcategories,
    categories,
    isLoading,
    error,
    fetchSubcategories,
    fetchCategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryStatus,
  };
}
