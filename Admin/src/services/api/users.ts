import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/types/api";
import { isAuthenticated } from "@/utils/authUtils";
import type {
  User,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  CreateRequest,
  UpdateRequest,
  DeleteRequest,
} from "@/types/api";

// API endpoints
const USER_ENDPOINTS = {
  users: "/users",
  user: (id: string) => `/users/${id}`,
  profile: "/users/profile",
} as const;

// User API functions
export const userApi = {
  // Get all users with pagination
  getUsers: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const url = `${USER_ENDPOINTS.users}?${searchParams.toString()}`;
    return api.get<PaginatedResponse<User>>(url);
  },

  // Get single user by ID
  getUser: async (id: string): Promise<User> => {
    return api.get<User>(USER_ENDPOINTS.user(id));
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    return api.get<ApiResponse<User>>(USER_ENDPOINTS.profile);
  },

  // Update current user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    return api.put<User>(USER_ENDPOINTS.profile, data);
  },

  // Create new user
  createUser: async (userData: CreateRequest<User>): Promise<User> => {
    return api.post<User>(USER_ENDPOINTS.users, userData.data);
  },

  // Update user
  updateUser: async ({ id, data }: UpdateRequest<User>): Promise<User> => {
    return api.put<User>(USER_ENDPOINTS.user(id), data);
  },

  // Delete user
  deleteUser: async ({ id }: DeleteRequest): Promise<void> => {
    return api.delete(USER_ENDPOINTS.user(id));
  },
};

// TanStack Query hooks
export const useUsers = (params?: PaginationParams) => {
  return useQuery({
    queryKey: [...queryKeys.users, params],
    queryFn: () => userApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => userApi.getProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data.data, // Extract the data from the response
    enabled: isAuthenticated(), // Only run when user is authenticated
    retry: 3, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
  });
};

// Mutation hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateUser,
    onSuccess: (updatedUser) => {
      // Update user in cache
      queryClient.setQueryData(
        queryKeys.user(updatedUser.id.toString()),
        updatedUser
      );
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (error) => {
      console.error("Failed to update user:", error);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (updatedUser) => {
      // Update profile in cache
      queryClient.setQueryData(queryKeys.profile, { data: updatedUser });
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, { id }) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: queryKeys.user(id) });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (error) => {
      console.error("Failed to delete user:", error);
    },
  });
};
