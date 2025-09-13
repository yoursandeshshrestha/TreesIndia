import { useQuery } from "@tanstack/react-query";
import {
  fetchWorkers,
  fetchWorkerById,
  searchWorkers,
  fetchWorkersByType,
  fetchWorkerStats,
} from "@/lib/workerApi";
import { WorkerFilters } from "@/types/worker";
import { authAPI } from "@/lib/auth-api";

export function useWorkers(
  filters: WorkerFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["workers", filters],
    queryFn: () => fetchWorkers(filters),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useWorkerById(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["worker", id],
    queryFn: () => fetchWorkerById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchWorkers(
  query: string,
  filters: WorkerFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["workers", "search", query, filters],
    queryFn: () => searchWorkers(query, filters),
    enabled: enabled && !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useWorkersByType(
  workerType: string,
  filters: WorkerFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["workers", "type", workerType, filters],
    queryFn: () => fetchWorkersByType(workerType, filters),
    enabled: enabled && !!workerType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useWorkerStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ["workerStats"],
    queryFn: () => fetchWorkerStats(),
    enabled: enabled && authAPI.hasTokens(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
