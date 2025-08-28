export interface ServiceArea {
  id: number;
  city: string;
  state: string;
  country: string;
  is_active: boolean;
}

export interface PopularService {
  id: number;
  name: string;
  slug: string;
  description: string;
  images: string[] | null;
  price_type: "fixed" | "inquiry";
  price: number | null;
  duration: string | null;
  category_id: number;
  subcategory_id: number;
  category_name: string;
  subcategory_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  service_areas: ServiceArea[];
}

export interface PopularServicesResponse {
  success: boolean;
  message: string;
  data: PopularService[];
  timestamp: string;
}

export interface Subcategory {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent_id: number;
  parent: {
    id: number;
    created_at: string;
    updated_at: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    is_active: boolean;
  };
  is_active: boolean;
}

export interface SubcategoriesResponse {
  success: boolean;
  message: string;
  data: Subcategory[]; // Always returns an array
  timestamp: string;
}

export interface PromotionBanner {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  image: string;
  link: string;
  is_active: boolean;
}

export interface PromotionBannersResponse {
  success: boolean;
  message: string;
  data: PromotionBanner[];
  timestamp: string;
}

export interface Category {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
  subcategories?: Subcategory[];
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
  timestamp: string;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  images: string[] | null;
  price_type: "fixed" | "inquiry";
  price: number | null;
  duration: string | null;
  category_id: number;
  subcategory_id: number;
  category: Category;
  subcategory: Subcategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  service_areas: ServiceArea[];
}

export interface ServicesResponse {
  success: boolean;
  message: string;
  data: {
    pagination: {
      has_next: boolean;
      has_prev: boolean;
      limit: number;
      page: number;
      total: number;
      total_pages: number;
    };
    services: Service[];
  };
  timestamp: string;
}
