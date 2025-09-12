import {
  Project,
  ProjectsResponse,
  ProjectFilters,
  ProjectStats,
} from "@/types/project";
import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function fetchProjects(
  filters: ProjectFilters = {}
): Promise<ProjectsResponse> {
  const searchParams = new URLSearchParams();

  // Add filters to search params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/projects?${searchParams.toString()}`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchProjectById(id: number): Promise<{
  success: boolean;
  message: string;
  data: Project;
  timestamp: string;
}> {
  const url = `${API_BASE_URL}/projects/${id}`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchProjectBySlug(slug: string): Promise<{
  success: boolean;
  message: string;
  data: Project;
  timestamp: string;
}> {
  const url = `${API_BASE_URL}/projects/slug/${slug}`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.statusText}`);
  }

  return response.json();
}

export async function searchProjects(
  query: string,
  filters: ProjectFilters = {}
): Promise<ProjectsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append("q", query);

  // Add additional filters to search params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/projects/search?${searchParams.toString()}`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to search projects: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchUserProjects(
  page: number = 1,
  limit: number = 20
): Promise<ProjectsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append("page", page.toString());
  searchParams.append("limit", limit.toString());

  const url = `${API_BASE_URL}/projects/user?${searchParams.toString()}`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user projects: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchProjectStats(): Promise<{
  success: boolean;
  message: string;
  data: ProjectStats;
  timestamp: string;
}> {
  const url = `${API_BASE_URL}/projects/stats`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch project stats: ${response.statusText}`);
  }

  return response.json();
}

export async function createProject(projectData: FormData): Promise<{
  success: boolean;
  message: string;
  data: Project;
  timestamp: string;
}> {
  try {
    const url = `${API_BASE_URL}/projects`;
    const response = await authenticatedFetch(url, {
      method: "POST",
      body: projectData,
    });

    const data = await response.json();

    if (!response.ok) {
      // If the response contains error details, throw them
      if (data && typeof data === "object") {
        throw new Error(
          data.message || data.error || `HTTP error! status: ${response.status}`
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function deleteProject(
  projectId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${API_BASE_URL}/projects/${projectId}`;
    const response = await authenticatedFetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If the response contains error details, throw them
      if (data && typeof data === "object") {
        throw new Error(
          data.message || data.error || `HTTP error! status: ${response.status}`
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}
