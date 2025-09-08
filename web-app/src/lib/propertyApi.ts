import {
  Property,
  PropertiesResponse,
  PropertyFilters,
} from "@/types/property";
import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function fetchProperties(
  filters: PropertyFilters = {}
): Promise<PropertiesResponse> {
  const searchParams = new URLSearchParams();

  // Add filters to search params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/properties?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch properties: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchPropertyById(id: number): Promise<{
  success: boolean;
  message: string;
  data: Property;
  timestamp: string;
}> {
  const url = `${API_BASE_URL}/properties/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch property: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchPropertyBySlug(slug: string): Promise<{
  success: boolean;
  message: string;
  data: Property;
  timestamp: string;
}> {
  const url = `${API_BASE_URL}/properties/slug/${slug}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch property: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchFeaturedProperties(
  limit: number = 8,
  city?: string,
  state?: string
): Promise<PropertiesResponse> {
  const filters: PropertyFilters = {
    limit,
    is_approved: true,
    status: "available",
    sortBy: "priority_score",
    sortOrder: "desc",
  };

  // Add location filters if provided
  if (city) {
    filters.city = city;
  }
  if (state) {
    filters.state = state;
  }

  return fetchProperties(filters);
}

export async function fetchUserProperties(
  page: number = 1,
  limit: number = 20
): Promise<PropertiesResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append("page", page.toString());
  searchParams.append("limit", limit.toString());

  const url = `${API_BASE_URL}/user/properties?${searchParams.toString()}`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user properties: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteProperty(
  propertyId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${API_BASE_URL}/user/properties/${propertyId}`;
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
    console.error("Error deleting property:", error);
    throw error;
  }
}
