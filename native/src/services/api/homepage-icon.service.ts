import { handleResponse, API_BASE_URL } from './base';

export interface HomepageCategoryIcon {
  id?: number;
  ID?: number;
  name: string;
  icon_url: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

class HomepageIconService {
  /**
   * Get all active homepage category icons
   */
  async getActiveIcons(): Promise<HomepageCategoryIcon[]> {
    const response = await fetch(`${API_BASE_URL}/homepage-icons/active`);
    const data = await handleResponse<HomepageCategoryIcon[]>(response);

    // Normalize icon data
    return data.map((icon) => ({
      ...icon,
      id: icon.id || icon.ID || 0,
      ID: icon.ID || icon.id || 0,
    }));
  }
}

export const homepageIconService = new HomepageIconService();
