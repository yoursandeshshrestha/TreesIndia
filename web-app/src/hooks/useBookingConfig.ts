import { useState, useEffect } from "react";
import { bookingFlowApi } from "@/lib/bookingFlowApi";
import { BookingConfig } from "@/types/booking";

export function useBookingConfig() {
  const [config, setConfig] = useState<BookingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await bookingFlowApi.getBookingConfig();
        setConfig(response.data);
      } catch (err) {
        console.error("Failed to fetch booking config:", err);
        setError("Failed to load booking configuration");
        setConfig(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, isLoading, error };
}
