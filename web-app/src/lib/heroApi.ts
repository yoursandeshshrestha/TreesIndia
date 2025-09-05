import { HeroConfig, HomepageCategoryIcon, HeroImage } from "@/types/hero";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

export const heroApi = {
  // Get hero configuration
  getHeroConfig: async (): Promise<{
    success: boolean;
    message: string;
    data: HeroConfig;
  }> => {
    const response = await fetch(`${API_BASE_URL}/hero/config`);
    return handleApiResponse(response);
  },

  // Get active category icons
  getCategoryIcons: async (): Promise<{
    success: boolean;
    message: string;
    data: HomepageCategoryIcon[];
  }> => {
    const response = await fetch(`${API_BASE_URL}/homepage-icons/active`);
    return handleApiResponse(response);
  },

  // Get hero images
  getHeroImages: async (): Promise<{
    success: boolean;
    message: string;
    data: HeroImage[];
  }> => {
    const response = await fetch(`${API_BASE_URL}/hero/images`);
    return handleApiResponse(response);
  },
};
