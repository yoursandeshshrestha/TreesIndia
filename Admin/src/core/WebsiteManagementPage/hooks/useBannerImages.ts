import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  BannerImage,
  CreateBannerImageRequest,
  UpdateBannerImageRequest,
  UpdateBannerImageSortRequest,
} from "../types";
import { apiClient } from "@/lib/api-client";

export const useBannerImages = () => {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBannerImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/banner/images");
      setBannerImages(response.data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch banner images";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createBannerImage = async (
    request: CreateBannerImageRequest
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", request.title);
      formData.append("image", request.image);
      if (request.link) {
        formData.append("link", request.link);
      }

      await apiClient.post("/banner/images", formData);
      await fetchBannerImages(); // Refresh the list
      toast.success("Banner image created successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create banner image";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBannerImage = async (
    id: number,
    request: UpdateBannerImageRequest
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (request.image) {
        // Update with file upload
        const formData = new FormData();
        formData.append("title", request.title || "");
        formData.append("image", request.image);
        if (request.link) {
          formData.append("link", request.link);
        }

        await apiClient.put(`/banner/images/${id}/file`, formData);
      } else {
        // Update without file upload
        await apiClient.put(`/banner/images/${id}`, request);
      }

      await fetchBannerImages(); // Refresh the list
      toast.success("Banner image updated successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update banner image";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBannerImage = async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/banner/images/${id}`);
      await fetchBannerImages(); // Refresh the list
      toast.success("Banner image deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete banner image";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBannerImageSort = async (
    id: number,
    request: UpdateBannerImageSortRequest
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.put(`/banner/images/${id}/sort`, request);
      await fetchBannerImages(); // Refresh the list
      toast.success("Banner image sort order updated successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update sort order";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getBannerImageCount = async (): Promise<number> => {
    try {
      const response = await apiClient.get("/banner/count");
      return response.data.data.count;
    } catch (err) {
      console.error("Failed to get banner image count:", err);
      return 0;
    }
  };

  useEffect(() => {
    fetchBannerImages();
  }, []);

  return {
    bannerImages,
    isLoading,
    error,
    fetchBannerImages,
    createBannerImage,
    updateBannerImage,
    deleteBannerImage,
    updateBannerImageSort,
    getBannerImageCount,
  };
};
