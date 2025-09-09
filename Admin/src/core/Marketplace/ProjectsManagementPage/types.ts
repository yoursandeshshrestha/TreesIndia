export interface Project {
  ID: number;
  title: string;
  description: string;
  project_type: ProjectType;
  status: ProjectStatus;
  slug: string;
  state: string;
  city: string;
  address?: string;
  pincode?: string;
  estimated_duration_days?: number;
  contact_info?: {
    phone?: string;
    email?: string;
    alternative_contact?: string;
    contact_person?: string;
  };
  uploaded_by_admin: boolean;
  images: string[];
  user_id: number;
  CreatedAt: string;
  UpdatedAt: string;
  user?: {
    ID: number;
    name: string;
    email?: string;
    phone?: string;
    user_type: string;
    is_active: boolean;
  };
}

export type ProjectType = "residential" | "commercial" | "infrastructure";

export type ProjectStatus =
  | "starting_soon"
  | "on_going"
  | "completed"
  | "cancelled"
  | "on_hold";

export type ProjectTabType =
  | "all"
  | "residential"
  | "commercial"
  | "infrastructure";

export interface CreateProjectRequest {
  title: string;
  description?: string;
  project_type: ProjectType;
  status?: ProjectStatus;
  state: string;
  city: string;
  address?: string;
  pincode?: string;
  estimated_duration_days?: number;
  contact_info?: {
    phone?: string;
    email?: string;
    alternative_contact?: string;
    contact_person?: string;
  };
  images?: string[];
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  project_type?: ProjectType;
  status?: ProjectStatus;
  state?: string;
  city?: string;
  address?: string;
  pincode?: string;
  estimated_duration_days?: number;
  contact_info?: {
    phone?: string;
    email?: string;
    alternative_contact?: string;
    contact_person?: string;
  };
  images?: string[];
}

export interface ProjectFilters {
  search: string;
  projectType: string;
  status: string;
  state: string;
  city: string;
  sortBy: string;
  sortOrder: string;
  activeTab: ProjectTabType;
}

export interface ProjectStats {
  total: number;
  residential: number;
  commercial: number;
  infrastructure: number;
  active: number;
  completed: number;
}

export interface ProjectListParams {
  page: number;
  limit: number;
  search?: string;
  projectType?: string;
  status?: string;
  state?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: string;
  activeTab?: ProjectTabType;
}
