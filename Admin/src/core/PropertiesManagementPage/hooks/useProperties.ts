import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  Property,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyFilters,
  PropertyStats,
  PropertiesResponse,
  PropertyResponse,
  PropertyStatsResponse,
} from "../types";

interface UsePropertiesReturn {
  properties: Property[];
  stats: PropertyStats | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  fetchProperties: (
    filters?: PropertyFilters,
    page?: number,
    limit?: number,
    mode?: "all" | "pending"
  ) => Promise<void>;
  fetchPropertyById: (id: number) => Promise<Property | null>;
  createProperty: (
    data: CreatePropertyRequest,
    imageFiles?: File[]
  ) => Promise<Property | null>;
  updateProperty: (
    id: number,
    data: UpdatePropertyRequest,
    imageFiles?: File[]
  ) => Promise<Property | null>;
  deleteProperty: (id: number) => Promise<boolean>;
  approveProperty: (id: number) => Promise<boolean>;
  rejectProperty: (id: number) => Promise<boolean>;
  togglePropertyStatus: (id: number) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  refreshProperties: (
    filters?: PropertyFilters,
    page?: number,
    limit?: number,
    mode?: "all" | "pending"
  ) => Promise<void>;
}

export const useProperties = (): UsePropertiesReturn => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProperties = useCallback(
    async (
      filters: PropertyFilters = {
        search: "",
        property_type: "",
        listing_type: "",
        status: "",
        furnishing_status: "",
        state: "",
        city: "",
        min_price: "",
        max_price: "",
        min_area: "",
        max_area: "",
        bedrooms: "",
        bathrooms: "",
        is_approved: "",
        uploaded_by_admin: "",
        treesindia_assured: "",
        sortBy: "created_at",
        sortOrder: "desc",
      },
      pageNum: number = 1,
      limit: number = 20,
      mode: "all" | "pending" = "all"
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        // Add pagination
        params.append("page", pageNum.toString());
        params.append("limit", limit.toString());

        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "") {
            params.append(key, value);
          }
        });

        const endpoint =
          mode === "pending"
            ? "/admin/properties/pending"
            : "/admin/properties";
        const response = await apiClient.get<PropertiesResponse>(
          `${endpoint}?${params.toString()}`
        );

        if (response.data.success) {
          setProperties(response.data.data || []);
          setTotal(response.data.pagination.total || 0);
          setPage(response.data.pagination.page || 1);
          setTotalPages(response.data.pagination.total_pages || 0);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch properties"
          );
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch properties";
        setError(errorMessage);
        setProperties([]); // Ensure properties is always an array
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchPropertyById = useCallback(
    async (id: number): Promise<Property | null> => {
      try {
        const response = await apiClient.get<PropertyResponse>(
          `/admin/properties/${id}`
        );

        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to fetch property");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch property";
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  const createProperty = useCallback(
    async (
      data: CreatePropertyRequest,
      imageFiles?: File[]
    ): Promise<Property | null> => {
      try {
        let response;

        if (imageFiles && imageFiles.length > 0) {
          // Use FormData for file uploads
          const formData = new FormData();

          // Append all property data
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (typeof value === "boolean") {
                formData.append(key, value.toString());
              } else if (typeof value === "object" && Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, value.toString());
              }
            }
          });

          // Append image files
          imageFiles.forEach((file) => {
            formData.append("images", file);
          });

          response = await apiClient.post<PropertyResponse>(
            "/admin/properties",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          // Use JSON for data without files
          response = await apiClient.post<PropertyResponse>(
            "/admin/properties",
            data
          );
        }

        if (response.data.success) {
          toast.success("Property created successfully");
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to create property");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to create property";
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  const updateProperty = useCallback(
    async (
      id: number,
      data: UpdatePropertyRequest,
      imageFiles?: File[]
    ): Promise<Property | null> => {
      try {
        let response;

        if (imageFiles && imageFiles.length > 0) {
          // Use FormData for file uploads
          const formData = new FormData();

          // Append all property data
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (typeof value === "boolean") {
                formData.append(key, value.toString());
              } else if (typeof value === "object" && Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, value.toString());
              }
            }
          });

          // Append image files
          imageFiles.forEach((file) => {
            formData.append("images", file);
          });

          response = await apiClient.put<PropertyResponse>(
            `/admin/properties/${id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          // Use JSON for data without files
          response = await apiClient.put<PropertyResponse>(
            `/admin/properties/${id}`,
            data
          );
        }

        if (response.data.success) {
          toast.success("Property updated successfully");
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to update property");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to update property";
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  const deleteProperty = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/admin/properties/${id}`);

      if (response.status === 200 || response.status === 204) {
        toast.success("Property deleted successfully");
        return true;
      } else {
        throw new Error("Failed to delete property");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete property";
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const approveProperty = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/admin/properties/${id}/approve`);

      if (response.status === 200) {
        toast.success("Property approved successfully");
        return true;
      } else {
        throw new Error("Failed to approve property");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to approve property";
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const rejectProperty = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await apiClient.put(`/admin/properties/${id}`, {
        is_approved: false,
        status: "off_market",
      });

      if (response.status === 200) {
        toast.success("Property rejected successfully");
        return true;
      } else {
        throw new Error("Failed to reject property");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to reject property";
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const togglePropertyStatus = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const property = properties.find((p) => p.ID === id);
        if (!property) {
          throw new Error("Property not found");
        }

        const newStatus =
          property.status === "available" ? "off_market" : "available";

        const response = await apiClient.put(`/admin/properties/${id}`, {
          status: newStatus,
        });

        if (response.status === 200) {
          toast.success(
            `Property ${
              newStatus === "available" ? "activated" : "deactivated"
            } successfully`
          );
          return true;
        } else {
          throw new Error("Failed to toggle property status");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to toggle property status";
        toast.error(errorMessage);
        return false;
      }
    },
    [properties]
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get<PropertyStatsResponse>(
        "/admin/properties/stats"
      );

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch property stats"
        );
      }
    } catch (err: any) {
      console.error("Failed to fetch property stats:", err);
    }
  }, []);

  const refreshProperties = useCallback(
    async (
      filters?: PropertyFilters,
      pageNum?: number,
      limit?: number,
      mode?: "all" | "pending"
    ) => {
      await fetchProperties(filters, pageNum, limit, mode);
    },
    [fetchProperties]
  );

  return {
    properties,
    stats,
    isLoading,
    error,
    total,
    page,
    totalPages,
    fetchProperties,
    fetchPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    approveProperty,
    rejectProperty,
    togglePropertyStatus,
    fetchStats,
    refreshProperties,
  };
};
