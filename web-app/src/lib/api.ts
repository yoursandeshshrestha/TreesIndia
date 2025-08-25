import { PopularServicesResponse } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function fetchPopularServices(
  city?: string,
  state?: string
): Promise<PopularServicesResponse> {
  try {
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (state) params.append("state", state);

    const url = params.toString()
      ? `${API_BASE_URL}/services/popular?${params.toString()}`
      : `${API_BASE_URL}/services/popular`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching popular services:", error);
    throw error;
  }
}
