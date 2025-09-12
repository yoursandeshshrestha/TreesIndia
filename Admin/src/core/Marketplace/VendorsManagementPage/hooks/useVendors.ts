import { useState, useCallback } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  Vendor,
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorFilters,
  VendorStats,
  VendorsResponse,
  VendorResponse,
  VendorStatsResponse,
} from "../types";

// Helper function to extract error message from unknown error
const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === "object") {
    const errorObj = err as Record<string, unknown>;
    if (errorObj.response && typeof errorObj.response === "object") {
      const response = errorObj.response as Record<string, unknown>;
      if (response.data && typeof response.data === "object") {
        const data = response.data as Record<string, unknown>;
        if (typeof data.message === "string") {
          return data.message;
        }
      }
    }
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }
  }
  return fallback;
};

interface UseVendorsReturn {
  vendors: Vendor[];
  stats: VendorStats | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  fetchVendors: (
    filters?: VendorFilters,
    page?: number,
    limit?: number,
    mode?: "all" | "active" | "inactive"
  ) => Promise<void>;
  fetchVendorById: (id: number) => Promise<Vendor | null>;
  createVendor: (
    data: CreateVendorRequest,
    imageFiles?: File[]
  ) => Promise<Vendor | null>;
  updateVendor: (
    id: number,
    data: UpdateVendorRequest,
    imageFiles?: File[]
  ) => Promise<Vendor | null>;
  deleteVendor: (id: number) => Promise<boolean>;
  toggleVendorStatus: (id: number) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  refreshVendors: (
    filters?: VendorFilters,
    page?: number,
    limit?: number,
    mode?: "all" | "active" | "inactive"
  ) => Promise<void>;
}

export const useVendors = (): UseVendorsReturn => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchVendors = useCallback(
    async (
      filters: VendorFilters = {
        search: "",
        business_type: "",
        state: "",
        city: "",
        is_active: "",
        sortBy: "created_at",
        sortOrder: "desc",
      },
      pageNum: number = 1,
      limit: number = 20,
      mode: "all" | "active" | "inactive" = "all"
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

        const endpoint = "/admin/vendors";
        const response = await apiClient.get<VendorsResponse>(
          `${endpoint}?${params.toString()}`
        );

        if (response.data.success) {
          setVendors(response.data.data.vendors || []);
          setTotal(response.data.data.pagination.total || 0);
          setPage(response.data.data.pagination.page || 1);
          setTotalPages(response.data.data.pagination.total_pages || 0);
        } else {
          throw new Error(response.data.message || "Failed to fetch vendors");
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Failed to fetch vendors");
        setError(errorMessage);
        setVendors([]); // Ensure vendors is always an array
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchVendorById = useCallback(
    async (id: number): Promise<Vendor | null> => {
      try {
        const response = await apiClient.get<VendorResponse>(
          `/admin/vendors/${id}`
        );

        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to fetch vendor");
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Failed to fetch vendor");
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  const createVendor = useCallback(
    async (
      data: CreateVendorRequest,
      imageFiles?: File[]
    ): Promise<Vendor | null> => {
      try {
        let response;

        if (imageFiles && imageFiles.length > 0) {
          // Use FormData for file uploads
          const formData = new FormData();

          // Append all vendor data
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (typeof value === "boolean") {
                formData.append(key, value.toString());
              } else if (typeof value === "object" && Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
              } else if (typeof value === "object") {
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

          response = await apiClient.post<VendorResponse>(
            "/admin/vendors",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          // Use JSON for data without files
          response = await apiClient.post<VendorResponse>(
            "/admin/vendors",
            data
          );
        }

        if (response.data.success) {
          toast.success("Vendor created successfully");
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to create vendor");
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Failed to create vendor");
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  const updateVendor = useCallback(
    async (
      id: number,
      data: UpdateVendorRequest,
      imageFiles?: File[]
    ): Promise<Vendor | null> => {
      try {
        let response;

        if (imageFiles && imageFiles.length > 0) {
          // Use FormData for file uploads
          const formData = new FormData();

          // Append all vendor data
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (typeof value === "boolean") {
                formData.append(key, value.toString());
              } else if (typeof value === "object" && Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
              } else if (typeof value === "object") {
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

          response = await apiClient.put<VendorResponse>(
            `/admin/vendors/${id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          // Use JSON for data without files
          response = await apiClient.put<VendorResponse>(
            `/admin/vendors/${id}`,
            data
          );
        }

        if (response.data.success) {
          toast.success("Vendor updated successfully");
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to update vendor");
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Failed to update vendor");
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  const deleteVendor = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/admin/vendors/${id}`);

      if (response.status === 200 || response.status === 204) {
        toast.success("Vendor deleted successfully");
        return true;
      } else {
        throw new Error("Failed to delete vendor");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "Failed to delete vendor");
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const toggleVendorStatus = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const vendor = vendors.find((v) => v.ID === id);
        if (!vendor) {
          throw new Error("Vendor not found");
        }

        const newStatus = !vendor.is_active;

        const response = await apiClient.put(`/admin/vendors/${id}`, {
          is_active: newStatus,
        });

        if (response.status === 200) {
          toast.success(
            `Vendor ${newStatus ? "activated" : "deactivated"} successfully`
          );
          return true;
        } else {
          throw new Error("Failed to toggle vendor status");
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(
          err,
          "Failed to toggle vendor status"
        );
        toast.error(errorMessage);
        return false;
      }
    },
    [vendors]
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get<VendorStatsResponse>(
        "/admin/vendors/stats"
      );

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch vendor stats"
        );
      }
    } catch (err: unknown) {
      console.error("Failed to fetch vendor stats:", err);
    }
  }, []);

  const refreshVendors = useCallback(
    async (
      filters?: VendorFilters,
      pageNum?: number,
      limit?: number,
      mode?: "all" | "active" | "inactive"
    ) => {
      await fetchVendors(filters, pageNum, limit, mode);
    },
    [fetchVendors]
  );

  return {
    vendors,
    stats,
    isLoading,
    error,
    total,
    page,
    totalPages,
    fetchVendors,
    fetchVendorById,
    createVendor,
    updateVendor,
    deleteVendor,
    toggleVendorStatus,
    fetchStats,
    refreshVendors,
  };
};
