import { UserSubscription } from "./subscription";

export interface Project {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  title: string;
  description: string;
  slug: string;
  project_type: "residential" | "commercial" | "infrastructure";
  status: "starting_soon" | "on_going" | "completed" | "cancelled" | "on_hold";
  state: string;
  city: string;
  address: string;
  pincode: string;
  estimated_duration_days: number | null;
  contact_info: Record<string, unknown>;
  uploaded_by_admin: boolean;
  images: string[];
  user_id: number;
  user?: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
    email: string | null;
    phone: string;
    user_type: string;
    avatar: string;
    gender: string;
    is_active: boolean;
    last_login_at: string;
    role_application_status: string;
    application_date: string | null;
    approval_date: string | null;
    wallet_balance: number;
    subscription_id: number | null;
    subscription: UserSubscription | null;
    has_active_subscription: boolean;
    subscription_expiry_date: string | null;
    notification_settings: Record<string, unknown> | null;
  };
  // Legacy fields for backward compatibility
  id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectsResponse {
  success: boolean;
  message: string;
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  timestamp: string;
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  project_type?: "residential" | "commercial" | "infrastructure";
  status?: "starting_soon" | "on_going" | "completed" | "cancelled" | "on_hold";
  state?: string;
  city?: string;
  location?: string;
  uploaded_by_admin?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProjectStats {
  total: number;
  residential: number;
  commercial: number;
  infrastructure: number;
  active: number;
  completed: number;
}
