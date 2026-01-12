import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  setUser,
  setUserLoading,
  setUserError,
  updateUser,
  updateUserAvatar,
  clearUser,
  selectUser,
  selectUserLoading,
  selectUserError,
} from "@/app/store/slices";
import { useProfile, useUpdateProfile } from "@/services/api/users";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { isAuthenticated } from "@/utils/authUtils";
import type { User } from "@/types/api";

export const useUserState = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);

  // No longer initialize from stored data - we always fetch fresh from API
  // This ensures header and sidebar always show the most up-to-date user information

  // Clear user data when not authenticated
  useEffect(() => {
    if (user && !isAuthenticated()) {
      dispatch(clearUser());
    }
  }, [user, dispatch]);

  // Fetch user data using React Query
  const {
    data: userData,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = useProfile();

  // Force refetch when user is authenticated but no user data is loaded
  useEffect(() => {
    if (isAuthenticated() && !userData && !queryLoading) {
      refetch();
    }
  }, [userData, queryLoading, refetch]);

  // Get update profile mutation
  const updateProfileMutation = useUpdateProfile();

  // Sync React Query data with Redux
  useEffect(() => {
    if (userData) {
      // Always update Redux when userData changes from React Query
      dispatch(setUser(userData));
    }
  }, [userData, dispatch]);

  // Update loading state
  useEffect(() => {
    dispatch(setUserLoading(queryLoading));
  }, [queryLoading, dispatch]);

  // Update error state
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError instanceof Error
        ? queryError.message
        : "Failed to load user data";
      dispatch(setUserError(errorMessage));
    } else {
      dispatch(setUserError(null));
    }
  }, [queryError, dispatch]);

  // Actions
  const updateUserData = async (updates: Partial<User>) => {
    try {
      const updatedUser = await updateProfileMutation.mutateAsync(updates);
      // Update Redux store with the updated user data
      dispatch(updateUser(updatedUser));
      // Invalidate and refetch user profile to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      return updatedUser;
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  };

  const updateAvatar = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiClient.post("/users/upload-avatar", formData);
      const avatarUrl = response.data.avatar_url;

      // Update avatar in Redux immediately
      dispatch(updateUserAvatar(avatarUrl));

      // Invalidate and refetch user profile to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ["profile"] });

      return avatarUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  };

  const refreshUserData = () => {
    refetch();
  };

  return {
    user,
    isLoading,
    error,
    updateUserData,
    updateAvatar,
    refreshUserData,
    updateProfileMutation,
  };
};
