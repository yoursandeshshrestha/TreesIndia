import {
  PopularServicesResponse,
  PromotionBannersResponse,
  BannerImagesResponse,
  SubcategoriesResponse,
  CategoriesResponse,
  ServicesResponse,
  Service,
} from "@/types/api";

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
    throw error;
  }
}

export async function fetchSubcategories(
  categoryId: number
): Promise<SubcategoriesResponse> {
  try {
    const url = `${API_BASE_URL}/subcategories/category/${categoryId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchPromotionBanners(): Promise<PromotionBannersResponse> {
  try {
    const url = `${API_BASE_URL}/promotion-banners`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchBannerImages(): Promise<BannerImagesResponse> {
  try {
    const url = `${API_BASE_URL}/banner/images`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  try {
    const url = `${API_BASE_URL}/categories`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchServices(params?: {
  category?: string;
  subcategory?: string;
  type?: "fixed-price" | "inquiry-based";
  price_min?: number;
  price_max?: number;
  exclude_inactive?: boolean;
  page?: number;
  limit?: number;
}): Promise<ServicesResponse> {
  try {
    const url = new URL(`${API_BASE_URL}/services`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchServiceById(id: number): Promise<{
  success: boolean;
  message: string;
  data: Service;
}> {
  try {
    const url = `${API_BASE_URL}/services/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
