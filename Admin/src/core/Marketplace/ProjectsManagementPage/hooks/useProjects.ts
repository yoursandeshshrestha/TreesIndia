"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Project, ProjectStats, ProjectListParams } from "../types";
import { apiClient } from "@/lib/api-client";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    residential: 0,
    commercial: 0,
    infrastructure: 0,
    active: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProjects = useCallback(async (params: ProjectListParams) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();

      // Add pagination - backend uses offset instead of page
      const offset = (params.page - 1) * params.limit;
      queryParams.append("offset", offset.toString());
      queryParams.append("limit", params.limit.toString());

      // Add filters - match backend parameter names
      if (params.projectType && params.projectType !== "") {
        queryParams.append("project_type", params.projectType);
      }
      if (params.status && params.status !== "") {
        queryParams.append("status", params.status);
      }
      if (params.state && params.state !== "") {
        queryParams.append("state", params.state);
      }
      if (params.city && params.city !== "") {
        queryParams.append("city", params.city);
      }

      // Determine endpoint based on whether there's a search query
      let endpoint = "/admin/projects";
      if (params.search && params.search.trim() !== "") {
        endpoint = "/admin/projects/search";
        queryParams.append("q", params.search.trim());
      }

      const response = await apiClient.get(
        `${endpoint}?${queryParams.toString()}`
      );

      if (response.data.success) {
        setProjects(response.data.data || []);
        // Calculate total pages based on response
        const totalItems =
          response.data.pagination?.total || response.data.data?.length || 0;
        setTotalPages(Math.ceil(totalItems / params.limit));
      } else {
        throw new Error(response.data.message || "Failed to fetch projects");
      }
    } catch (error: unknown) {
      console.error("Error fetching projects:", error);
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to fetch projects";
      toast.error(errorMessage);
      setProjects([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get("/admin/projects/stats");

      if (response.data.success) {
        setStats(
          response.data.data || {
            total: 0,
            residential: 0,
            commercial: 0,
            infrastructure: 0,
            active: 0,
            completed: 0,
          }
        );
      } else {
        throw new Error(
          response.data.message || "Failed to fetch project stats"
        );
      }
    } catch (error: unknown) {
      console.error("Error fetching project stats:", error);
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to fetch project stats";
      toast.error(errorMessage);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    // This would typically refetch with current parameters
    // For now, we'll just refetch stats
    await fetchStats();
  }, [fetchStats]);

  const deleteProject = useCallback(
    async (projectId: number) => {
      try {
        const response = await apiClient.delete(`/admin/projects/${projectId}`);

        if (response.data.success) {
          // Remove the project from local state
          setProjects((prev) =>
            prev.filter((project) => project.ID !== projectId)
          );
          // Update stats
          await fetchStats();
          return response.data;
        } else {
          throw new Error(response.data.message || "Failed to delete project");
        }
      } catch (error: unknown) {
        console.error("Error deleting project:", error);
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          "Failed to delete project";
        toast.error(errorMessage);
        throw error;
      }
    },
    [fetchStats]
  );

  const createProject = useCallback(
    async (projectData: unknown) => {
      try {
        const response = await apiClient.post("/admin/projects", projectData);

        if (response.data.success) {
          toast.success("Project created successfully");
          // Refresh the list
          await fetchStats();
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to create project");
        }
      } catch (error: unknown) {
        console.error("Error creating project:", error);
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          "Failed to create project";
        toast.error(errorMessage);
        throw error;
      }
    },
    [fetchStats]
  );

  const updateProject = useCallback(
    async (projectId: number, projectData: unknown) => {
      try {
        const response = await apiClient.put(
          `/admin/projects/${projectId}`,
          projectData
        );

        if (response.data.success) {
          toast.success("Project updated successfully");
          // Update the project in local state
          setProjects((prev) =>
            prev.map((project) =>
              project.ID === projectId
                ? { ...project, ...response.data.data }
                : project
            )
          );
          return response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to update project");
        }
      } catch (error: unknown) {
        console.error("Error updating project:", error);
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          "Failed to update project";
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  const getProject = useCallback(async (projectId: number) => {
    try {
      const response = await apiClient.get(`/admin/projects/${projectId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch project");
      }
    } catch (error: unknown) {
      console.error("Error fetching project:", error);
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to fetch project";
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  return {
    projects,
    stats,
    isLoading,
    totalPages,
    fetchProjects,
    fetchStats,
    refreshProjects,
    deleteProject,
    createProject,
    updateProject,
    getProject,
  };
}
