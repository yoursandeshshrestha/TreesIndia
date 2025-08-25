export interface PromotionBanner {
  id: number;
  title: string;
  image: string;
  link?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerRequest {
  title: string;
  image?: string;
  link?: string;
  is_active?: boolean;
}

export interface UpdateBannerRequest {
  title?: string;
  image?: string;
  link?: string;
  is_active?: boolean;
}

export interface BannerFilters {
  search?: string;
  status?: "active" | "inactive" | "all";
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
