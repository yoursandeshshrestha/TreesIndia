import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HeroImage, UpdateHeroImageRequest } from "../types";
import { apiClient } from "@/lib/api-client";

export const useHeroImages = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/hero/images");
      setHeroImages(response.data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch hero images";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createHeroImage = async (mediaFile: File): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      // Use 'media' field for both images and videos
      formData.append("media", mediaFile);

      await apiClient.post("/hero/images", formData);
      await fetchHeroImages(); // Refresh the list

      // Determine if it's an image or video for the success message
      const isVideo = mediaFile.type.startsWith("video/");
      toast.success(`Hero ${isVideo ? "video" : "image"} created successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create hero media";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateHeroImage = async (
    id: number,
    imageData: UpdateHeroImageRequest
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.put(`/hero/images/${id}`, imageData);
      await fetchHeroImages(); // Refresh the list
      toast.success("Hero image updated successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update hero image";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHeroImage = async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/hero/images/${id}`);
      await fetchHeroImages(); // Refresh the list
      toast.success("Hero image deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete hero image";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImages();
  }, []);

  return {
    heroImages,
    isLoading,
    error,
    fetchHeroImages,
    createHeroImage,
    updateHeroImage,
    deleteHeroImage,
  };
};
