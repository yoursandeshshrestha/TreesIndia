export interface HeroConfig {
  id: number;
  title: string;
  description: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroImage {
  id: number;
  image_url: string;
  is_active: boolean;
  hero_config_id: number;
  created_at: string;
  updated_at: string;
}

export interface HomepageCategoryIcon {
  id: number;
  name: string;
  icon_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateHeroConfigRequest {
  title: string;
  description: string;
  prompt_text: string;
  is_active: boolean;
}

export interface UpdateHeroImageRequest {
  image?: File;
  is_active?: boolean;
}

export interface BannerImage {
  id: number;
  title: string;
  image: string;
  link: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerImageRequest {
  title: string;
  image: File;
  link?: string;
}

export interface UpdateBannerImageRequest {
  title?: string;
  image?: File;
  link?: string;
  is_active?: boolean;
}

export interface UpdateBannerImageSortRequest {
  sort_order: number;
}
