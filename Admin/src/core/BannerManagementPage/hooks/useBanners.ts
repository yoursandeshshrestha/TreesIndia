import { useState, useEffect } from "react";
import {
  PromotionBanner,
  CreateBannerRequest,
  UpdateBannerRequest,
} from "../types";
import { apiClient } from "@/lib/api-client";

export function useBanners() {
  const [banners, setBanners] = useState<PromotionBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/admin/promotion-banners");

      // Handle different response structures
      let bannersData = [];
      if (response.data && response.data.data && response.data.data.banners) {
        // New structure: { data: { banners: [...] } }
        bannersData = response.data.data.banners;
      } else if (response.data && response.data.data) {
        // Old structure: { data: [...] }
        bannersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array
        bannersData = response.data;
      } else if (response.data && response.data.banners) {
        // Alternative structure: { banners: [...] }
        bannersData = response.data.banners;
      }

      setBanners(Array.isArray(bannersData) ? bannersData : []);
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch banners");
    } finally {
      setIsLoading(false);
    }
  };

  const createBanner = async (
    data: CreateBannerRequest,
    imageFile?: File
  ): Promise<PromotionBanner> => {
    try {
      let response;

      if (imageFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("is_active", data.is_active ? "true" : "false");
        if (data.link) {
          formData.append("link", data.link);
        }
        formData.append("image", imageFile);

        response = await apiClient.post("/admin/promotion-banners", formData);
      } else {
        // Use JSON for data without file
        const jsonData = {
          ...data,
          is_active: data.is_active ? "true" : "false",
        };
        response = await apiClient.post("/admin/promotion-banners", jsonData);
      }

      const newBanner = response.data.data;
      setBanners((prev) => [...prev, newBanner]);
      return newBanner;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create banner"
      );
    }
  };

  const updateBanner = async (
    id: number,
    data: UpdateBannerRequest,
    imageFile?: File
  ): Promise<PromotionBanner> => {
    try {
      let response;

      if (imageFile) {
        // Use FormData for file upload
        const formData = new FormData();
        if (data.title) {
          formData.append("title", data.title);
        }
        if (data.link) {
          formData.append("link", data.link);
        }
        formData.append("is_active", data.is_active ? "true" : "false");
        formData.append("image", imageFile);

        response = await apiClient.put(
          `/admin/promotion-banners/${id}`,
          formData
        );
      } else {
        // Use JSON for data without file
        const jsonData = {
          ...data,
          is_active: data.is_active ? "true" : "false",
        };
        response = await apiClient.put(
          `/admin/promotion-banners/${id}`,
          jsonData
        );
      }

      const updatedBanner = response.data.data;
      setBanners((prev) =>
        prev.map((banner) => (banner.id === id ? updatedBanner : banner))
      );
      return updatedBanner;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update banner"
      );
    }
  };

  const deleteBanner = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/promotion-banners/${id}`);
      setBanners((prev) => prev.filter((banner) => banner.id !== id));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete banner"
      );
    }
  };

  const toggleBannerStatus = async (id: number): Promise<void> => {
    try {
      const response = await apiClient.patch(
        `/admin/promotion-banners/${id}/status`,
        {}
      );
      const updatedBanner = response.data.data;
      setBanners((prev) =>
        prev.map((banner) => (banner.id === id ? updatedBanner : banner))
      );
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to toggle banner status"
      );
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    banners,
    isLoading,
    error,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
  };
}
