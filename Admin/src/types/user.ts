// User Types
export type UserType = "normal" | "worker" | "broker" | "admin";
export type RoleApplicationStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export interface User {
  ID: number;
  name: string;
  email?: string;
  phone: string;
  user_type: UserType;
  gender?: Gender;
  is_active: boolean;
  role_application_status: RoleApplicationStatus;
  wallet_balance: number;
  has_active_subscription: boolean;
  subscription_expiry_date?: string;
  avatar?: string;
  CreatedAt: string;
  UpdatedAt: string;
  last_login_at?: string;
}

export interface CreateUserRequest {
  name: string;
  email?: string;
  phone: string;
  user_type: UserType;
  gender?: Gender;
  is_active: boolean;
  role_application_status: RoleApplicationStatus;
  wallet_balance: number;
  has_active_subscription: boolean;
  subscription_expiry_date?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: number;
}

// User Filter Types
export interface UserFilterState {
  search: string;
  user_type: string;
  is_active: string;
  role_application_status: string;
  has_active_subscription: string;
  date_from: string;
  date_to: string;
}

// User Table Selection
export interface UserTableSelection {
  selectionMode: boolean;
  selectedUsers: string[];
}

// User Modal States
export interface UserModalStates {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isPreviewModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedUser: User | null;
}

// API Response Types
export interface UsersApiResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Backend API Response Wrapper (matches api-client.ts)
export interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
