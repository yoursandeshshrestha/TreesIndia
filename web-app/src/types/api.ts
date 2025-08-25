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
  price_type: 'fixed' | 'inquiry';
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
