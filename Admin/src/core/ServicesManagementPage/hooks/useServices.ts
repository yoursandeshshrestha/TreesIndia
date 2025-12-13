import { useState, useEffect } from "react";
import {
  Service,
  Category,
  CreateServiceRequest,
  UpdateServiceRequest,
} from "../types";
import { apiClient } from "@/lib/api-client";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // Subcategories removed - using unified category structure
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async (filters?: {
    search?: string;
    status?: string;
    priceType?: string;
    categoryId?: number;
    // subcategoryId removed - use categoryId instead
    sortBy?: string;
    sortOrder?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status && filters.status !== "all") {
        params.append(
          "exclude_inactive",
          filters.status === "inactive" ? "false" : "true"
        );
      }
      if (filters?.priceType && filters.priceType !== "all") {
        params.append(
          "type",
          filters.priceType === "fixed" ? "fixed-price" : "inquiry-based"
        );
      }
      if (filters?.categoryId)
        params.append("category", filters.categoryId.toString());
      // Subcategory filter removed - use categoryId instead
      if (filters?.sortBy) params.append("sort_by", filters.sortBy);
      if (filters?.sortOrder) params.append("sort_order", filters.sortOrder);

      const response = await apiClient.get(`/services?${params.toString()}`);
      setServices(response.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/services/categories");
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  // fetchSubcategories removed - use fetchCategories with parent_id instead
  const fetchSubcategories = async (categoryId?: number) => {
    // Legacy function - now returns children of the category
    if (categoryId) {
      try {
        const response = await apiClient.get(
          `/admin/categories?parent_id=${categoryId}`
        );
        return response.data.data || [];
      } catch (err) {
        console.error("Failed to fetch child categories:", err);
        return [];
      }
    }
    return [];
  };

  const createService = async (
    data: CreateServiceRequest,
    imageFiles?: File[]
  ): Promise<Service> => {
    try {
      let response;

      if (imageFiles && imageFiles.length > 0) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description || "");
        formData.append("price_type", data.price_type);
        formData.append("category_id", data.category_id.toString());
        // subcategory_id removed - using single category_id
        formData.append("is_active", data.is_active?.toString() || "true");

        if (data.price !== undefined) {
          formData.append("price", data.price.toString());
        }
        if (data.duration) {
          formData.append("duration", data.duration);
        }

        // Append image files
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });

        response = await apiClient.post("/admin/services", formData);
      } else {
        // Use JSON for data without files
        response = await apiClient.post("/admin/services", data);
      }

      const newService = response.data.data;
      setServices((prev) => [...prev, newService]);
      return newService;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create service"
      );
    }
  };

  const updateService = async (
    id: number,
    data: UpdateServiceRequest,
    imageFiles?: File[]
  ): Promise<Service> => {
    try {
      let response;

      if (imageFiles && imageFiles.length > 0) {
        // Use FormData for file upload
        const formData = new FormData();
        if (data.name) formData.append("name", data.name);
        if (data.description !== undefined)
          formData.append("description", data.description);
        if (data.price_type) formData.append("price_type", data.price_type);
        if (data.category_id)
          formData.append("category_id", data.category_id.toString());
        // subcategory_id removed - using single category_id
        if (data.is_active !== undefined)
          formData.append("is_active", data.is_active.toString());

        if (data.price !== undefined) {
          formData.append("price", data.price.toString());
        }
        if (data.duration) {
          formData.append("duration", data.duration);
        }

        // Append image files
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });

        response = await apiClient.put(`/admin/services/${id}`, formData);
      } else {
        // Use JSON for data without files
        response = await apiClient.put(`/admin/services/${id}`, data);
      }

      const updatedService = response.data.data;
      setServices((prev) =>
        prev.map((service) => (service.id === id ? updatedService : service))
      );
      return updatedService;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update service"
      );
    }
  };

  const deleteService = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/services/${id}`);
      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete service"
      );
    }
  };

  const toggleServiceStatus = async (id: number): Promise<void> => {
    try {
      const response = await apiClient.patch(
        `/admin/services/${id}/status`,
        {}
      );
      const updatedService = response.data.data;
      setServices((prev) =>
        prev.map((service) => (service.id === id ? updatedService : service))
      );
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to toggle service status"
      );
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Get all child categories (subcategories) from the categories tree
  const getAllChildCategories = (): Category[] => {
    const children: Category[] = [];
    const extractChildren = (cats: Category[]) => {
      cats.forEach((cat) => {
        if (cat.children) {
          children.push(...cat.children);
          extractChildren(cat.children);
        }
      });
    };
    extractChildren(categories);
    return children;
  };

  return {
    services,
    categories,
    subcategories: getAllChildCategories(), // Return all child categories for backward compatibility
    isLoading,
    error,
    fetchServices,
    fetchCategories,
    fetchSubcategories,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
  };
}
