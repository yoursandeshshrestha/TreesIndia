export interface Property {
  id: number;
  title: string;
  description: string;
  property_type: "residential" | "commercial";
  listing_type: "sale" | "rent";
  slug: string;
  sale_price: number | null;
  monthly_rent: number | null;
  price_negotiable: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null; // in sq ft
  parking_spaces: number | null;
  floor_number: number | null;
  age: number | null; // age in years
  furnishing_status: "furnished" | "semi_furnished" | "unfurnished" | null;
  state: string;
  city: string;
  locality: string | null;
  address: string | null;
  pincode: string | null;
  status: "available" | "sold" | "rented";
  is_approved: boolean;
  approved_at: string | null;
  approved_by: number | null;
  uploaded_by_admin: boolean;
  priority_score: number;
  subscription_required: boolean;
  treesindia_assured: boolean;
  images: string[];
  expires_at: string | null;
  user_id: number;
  broker_id: number | null;
  user?: {
    id: number;
    name: string;
    phone: string;
  };
  broker?: {
    id: number;
    name: string;
    phone: string;
  };
  approved_by_user?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PropertiesResponse {
  success: boolean;
  message: string;
  data: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  timestamp: string;
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  search?: string;
  property_type?: "residential" | "commercial";
  listing_type?: "sale" | "rent";
  status?: "available" | "sold" | "rented";
  min_price?: number;
  max_price?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  furnishing_status?: "furnished" | "semi_furnished" | "unfurnished";
  state?: string;
  city?: string;
  is_approved?: boolean;
  uploaded_by_admin?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
