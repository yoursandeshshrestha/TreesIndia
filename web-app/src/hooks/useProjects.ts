import { useQuery } from "@tanstack/react-query";
import {
  fetchProjects,
  fetchProjectById,
  fetchProjectBySlug,
  fetchUserProjects,
  searchProjects,
  fetchProjectStats,
} from "@/lib/projectApi";
import { ProjectFilters } from "@/types/project";
import { authAPI } from "@/lib/auth-api";

export function useProjects(
  filters: ProjectFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => fetchProjects(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProjectById(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProjectById(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useProjectBySlug(slug: string) {
  return useQuery({
    queryKey: ["project", "slug", slug],
    queryFn: () => fetchProjectBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUserProjects(page: number = 1, limit: number = 20) {
  const token = authAPI.getAccessToken();

  return useQuery({
    queryKey: ["userProjects", page, limit],
    queryFn: () => fetchUserProjects(page, limit),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchProjects(query: string, filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ["projects", "search", query, filters],
    queryFn: () => searchProjects(query, filters),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProjectStats(enabled: boolean = true) {
  const token = authAPI.getAccessToken();

  return useQuery({
    queryKey: ["projectStats"],
    queryFn: () => fetchProjectStats(),
    enabled: !!token && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
