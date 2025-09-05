import { useState, useEffect, useCallback } from "react";
import { getAvailableWorkers } from "@/lib/api-client";
import { User } from "@/types/user";

interface UseAvailableWorkersProps {
  scheduledTime?: string;
  serviceDuration?: number;
  serviceId?: number;
  location?: string;
  enabled?: boolean;
}

interface UseAvailableWorkersReturn {
  workers: User[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAvailableWorkers = ({
  scheduledTime,
  serviceDuration = 120,
  serviceId,
  location,
  enabled = true,
}: UseAvailableWorkersProps): UseAvailableWorkersReturn => {
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    if (!enabled) {
      setWorkers([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getAvailableWorkers({
        scheduled_time: scheduledTime,
        service_duration: serviceDuration,
        service_id: serviceId,
        location: location,
      });

      if (response.success && response.data) {
        // Filter to only include workers (user_type === "worker")
        const workerUsers = Array.isArray(response.data.users)
          ? response.data.users.filter(
              (user: User) => user.user_type === "worker"
            )
          : [];
        setWorkers(workerUsers);
      } else {
        setError(response.message || "Failed to fetch available workers");
        setWorkers([]);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch available workers";
      setError(errorMessage);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, scheduledTime, serviceDuration, serviceId, location]);

  useEffect(() => {
    fetchWorkers();
  }, [
    scheduledTime,
    serviceDuration,
    serviceId,
    location,
    enabled,
    fetchWorkers,
  ]);

  return {
    workers,
    loading,
    error,
    refetch: fetchWorkers,
  };
};
