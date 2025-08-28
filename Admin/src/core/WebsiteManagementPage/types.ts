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
