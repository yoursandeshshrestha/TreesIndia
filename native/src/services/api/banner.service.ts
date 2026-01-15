import { authenticatedFetch, handleResponse, API_BASE_URL } from './base';

export interface PromotionBanner {
  id?: number;
  ID?: number;
  title: string;
  image: string;
  link?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

class BannerService {
  /**
   * Get all active promotion banners (public endpoint, no auth required)
   */
  async getPromotionBanners(): Promise<PromotionBanner[]> {
    // This is a public endpoint, so we use regular fetch instead of authenticatedFetch
    const response = await fetch(`${API_BASE_URL}/promotion-banners`);
    const data = await handleResponse<PromotionBanner[]>(response);

    // Normalize banner data and filter only active banners with images
    return data
      .map((banner) => ({
        ...banner,
        id: banner.id || banner.ID || 0,
        ID: banner.ID || banner.id || 0,
      }))
      .filter((banner) => banner.is_active && banner.image && banner.image.trim() !== '');
  }
}

export const bannerService = new BannerService();
