import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HeroConfig, UpdateHeroConfigRequest } from "../types";
import { apiClient } from "@/lib/api-client";

export const useHeroConfig = () => {
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroConfig = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/hero/config");
      setHeroConfig(response.data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch hero config";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateHeroConfig = async (
    config: UpdateHeroConfigRequest
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.put("/hero/config", config);
      setHeroConfig(response.data.data);
      toast.success("Hero configuration updated successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update hero config";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroConfig();
  }, []);

  return {
    heroConfig,
    isLoading,
    error,
    fetchHeroConfig,
    updateHeroConfig,
  };
};
