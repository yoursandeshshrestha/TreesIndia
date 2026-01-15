import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';

export interface ContactInfo {
  phone?: string;
  email?: string;
  contact_person?: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  slug?: string;
  project_type: string; // 'residential' | 'commercial' | 'infrastructure'
  status: string; // 'starting_soon' | 'on_going' | 'completed' | 'cancelled' | 'on_hold'
  state: string;
  city: string;
  address?: string;
  pincode?: string;
  estimated_duration?: number;
  contact_info?: ContactInfo;
  images: string[];
  uploaded_by_admin: boolean;
  user_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ProjectListResponse {
  success: boolean;
  message: string;
  data?: {
    projects: Project[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
    user_subscription?: {
      has_active_subscription: boolean;
      subscription_expiry_date: string | null;
    };
  };
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  data?: Project;
}

class ProjectService {
  /**
   * Get all projects (authenticated endpoint - requires subscription)
   */
  async getAllProjects(page: number = 1, limit: number = 20): Promise<ProjectListResponse> {
    const offset = (page - 1) * limit;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await authenticatedFetch(`${API_BASE_URL}/projects?${params.toString()}`);
    const jsonData = await response.json();

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        errorMessage = jsonData.message || jsonData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    let projects: Project[] = [];
    let rawProjects: any[] = [];

    // Handle both old format (array) and new format (object with projects array)
    if (jsonData.data && jsonData.data.projects && Array.isArray(jsonData.data.projects)) {
      rawProjects = jsonData.data.projects;
    } else if (Array.isArray(jsonData.data)) {
      rawProjects = jsonData.data;
    } else if (jsonData.data === null || jsonData.data === undefined) {
      rawProjects = [];
    } else if (Array.isArray(jsonData)) {
      rawProjects = jsonData;
    } else {
      rawProjects = [];
    }

    // Normalize project data
    projects = rawProjects.map((proj: any) => {
      // Handle images - could be array, JSON string, or null
      let images: string[] = [];
      if (proj.images) {
        if (Array.isArray(proj.images)) {
          images = proj.images;
        } else if (typeof proj.images === 'string') {
          try {
            const parsed = JSON.parse(proj.images);
            if (Array.isArray(parsed)) {
              images = parsed;
            }
          } catch {
            images = [proj.images];
          }
        }
      } else if (proj.Images) {
        if (Array.isArray(proj.Images)) {
          images = proj.Images;
        } else if (typeof proj.Images === 'string') {
          try {
            const parsed = JSON.parse(proj.Images);
            if (Array.isArray(parsed)) {
              images = parsed;
            }
          } catch {
            images = [proj.Images];
          }
        }
      }

      // Handle contact_info - could be object or JSON string
      let contactInfo: ContactInfo = {};
      if (proj.contact_info) {
        if (typeof proj.contact_info === 'object') {
          contactInfo = proj.contact_info;
        } else if (typeof proj.contact_info === 'string') {
          try {
            contactInfo = JSON.parse(proj.contact_info);
          } catch {
            contactInfo = {};
          }
        }
      } else if (proj.ContactInfo) {
        if (typeof proj.ContactInfo === 'object') {
          contactInfo = proj.ContactInfo;
        } else if (typeof proj.ContactInfo === 'string') {
          try {
            contactInfo = JSON.parse(proj.ContactInfo);
          } catch {
            contactInfo = {};
          }
        }
      }

      return {
        id: proj.id ?? proj.ID,
        title: proj.title || proj.Title,
        description: proj.description || proj.Description,
        slug: proj.slug || proj.Slug,
        project_type: proj.project_type || proj.ProjectType,
        status: proj.status || proj.Status,
        state: proj.state || proj.State,
        city: proj.city || proj.City,
        address: proj.address || proj.Address,
        pincode: proj.pincode || proj.Pincode,
        estimated_duration: proj.estimated_duration || proj.EstimatedDuration,
        contact_info: contactInfo,
        images: images,
        uploaded_by_admin: proj.uploaded_by_admin ?? proj.UploadedByAdmin ?? false,
        user_id: proj.user_id || proj.UserID,
        created_at: proj.created_at || proj.CreatedAt,
        updated_at: proj.updated_at || proj.UpdatedAt,
        deleted_at: proj.deleted_at || proj.DeletedAt,
      };
    });

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Projects retrieved successfully',
      data: {
        projects: projects,
        pagination: jsonData.data?.pagination || jsonData.pagination,
        user_subscription: jsonData.data?.user_subscription,
      },
    };
  }

  /**
   * Get projects with filters
   */
  async getProjectsWithFilters(
    filters: {
      page?: number;
      limit?: number;
      project_type?: string;
      status?: string;
      state?: string;
      city?: string;
      search?: string;
    } = {}
  ): Promise<ProjectListResponse> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (filters.project_type) {
      params.append('project_type', filters.project_type);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.state) {
      params.append('state', filters.state);
    }
    if (filters.city) {
      params.append('city', filters.city);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const url = `${API_BASE_URL}/projects?${params.toString()}`;
    const response = await authenticatedFetch(url);
    const jsonData = await response.json();

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        errorMessage = jsonData.message || jsonData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    let projects: Project[] = [];
    let rawProjects: any[] = [];

    // Backend returns: { success: true, data: { projects: [...], user_subscription: {...} } }
    if (jsonData.data && jsonData.data.projects && Array.isArray(jsonData.data.projects)) {
      rawProjects = jsonData.data.projects;
    } else if (Array.isArray(jsonData.data)) {
      // Fallback: if data is directly an array
      rawProjects = jsonData.data;
    } else if (jsonData.data === null || jsonData.data === undefined) {
      rawProjects = [];
    } else if (Array.isArray(jsonData)) {
      rawProjects = jsonData;
    } else {
      rawProjects = [];
    }

    // Normalize project data with image parsing
    projects = rawProjects.map((proj: any) => {
      let images: string[] = [];
      if (proj.images) {
        if (Array.isArray(proj.images)) {
          images = proj.images;
        } else if (typeof proj.images === 'string') {
          try {
            const parsed = JSON.parse(proj.images);
            if (Array.isArray(parsed)) {
              images = parsed;
            }
          } catch {
            images = [proj.images];
          }
        }
      } else if (proj.Images) {
        if (Array.isArray(proj.Images)) {
          images = proj.Images;
        } else if (typeof proj.Images === 'string') {
          try {
            const parsed = JSON.parse(proj.Images);
            if (Array.isArray(parsed)) {
              images = parsed;
            }
          } catch {
            images = [proj.Images];
          }
        }
      }

      let contactInfo: ContactInfo = {};
      if (proj.contact_info) {
        if (typeof proj.contact_info === 'object') {
          contactInfo = proj.contact_info;
        } else if (typeof proj.contact_info === 'string') {
          try {
            contactInfo = JSON.parse(proj.contact_info);
          } catch {
            contactInfo = {};
          }
        }
      } else if (proj.ContactInfo) {
        if (typeof proj.ContactInfo === 'object') {
          contactInfo = proj.ContactInfo;
        } else if (typeof proj.ContactInfo === 'string') {
          try {
            contactInfo = JSON.parse(proj.ContactInfo);
          } catch {
            contactInfo = {};
          }
        }
      }

      return {
        id: proj.id ?? proj.ID,
        title: proj.title || proj.Title,
        description: proj.description || proj.Description,
        slug: proj.slug || proj.Slug,
        project_type: proj.project_type || proj.ProjectType,
        status: proj.status || proj.Status,
        state: proj.state || proj.State,
        city: proj.city || proj.City,
        address: proj.address || proj.Address,
        pincode: proj.pincode || proj.Pincode,
        estimated_duration: proj.estimated_duration || proj.EstimatedDuration,
        contact_info: contactInfo,
        images: images,
        uploaded_by_admin: proj.uploaded_by_admin ?? proj.UploadedByAdmin ?? false,
        user_id: proj.user_id || proj.UserID,
        created_at: proj.created_at || proj.CreatedAt,
        updated_at: proj.updated_at || proj.UpdatedAt,
        deleted_at: proj.deleted_at || proj.DeletedAt,
      };
    });

    // Filter to prioritize projects with images
    const projectsWithImages = projects.filter(
      (proj) => proj.images && Array.isArray(proj.images) && proj.images.length > 0
    );
    const finalProjects =
      projectsWithImages.length > 0
        ? projectsWithImages.slice(0, filters.limit || 20)
        : projects.slice(0, filters.limit || 20);

    // Extract pagination and user_subscription from the response
    const pagination = jsonData.data?.pagination || jsonData.pagination;
    const userSubscription = jsonData.data?.user_subscription;

    return {
      success: jsonData.success !== false,
      message: jsonData.message || 'Projects retrieved successfully',
      data: {
        projects: finalProjects,
        pagination: pagination,
        user_subscription: userSubscription,
      },
    };
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: number): Promise<ProjectResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/projects/${id}`);
    return handleResponse<ProjectResponse>(response);
  }

  /**
   * Get project by slug
   */
  async getProjectBySlug(slug: string): Promise<ProjectResponse> {
    const response = await authenticatedFetch(`${API_BASE_URL}/projects/slug/${slug}`);
    return handleResponse<ProjectResponse>(response);
  }
}

export const projectService = new ProjectService();
