import {
  Property,
  PropertiesResponse,
  PropertyFilters,
} from "@/types/property";

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
