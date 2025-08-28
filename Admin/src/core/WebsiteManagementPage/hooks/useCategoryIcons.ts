import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HomepageCategoryIcon } from "../types";
import { apiClient } from "@/lib/api-client";

export const useCategoryIcons = () => {
  const [categoryIcons, setCategoryIcons] = useState<HomepageCategoryIcon[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryIcons = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/homepage-icons/");
      setCategoryIcons(response.data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch category icons";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategoryIcon = async (
    name: string,
    iconFile: File
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("icon", iconFile);

      await apiClient.put(
        `/homepage-icons/${encodeURIComponent(name)}/icon`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchCategoryIcons(); // Refresh the list
      toast.success("Category icon updated successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update category icon";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryIcons();
  }, []);

  return {
    categoryIcons,
    isLoading,
    error,
    fetchCategoryIcons,
    updateCategoryIcon,
  };
};
