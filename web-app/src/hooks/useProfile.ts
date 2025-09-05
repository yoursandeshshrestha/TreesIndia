import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth-api";
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getNotificationSettings,
  updateNotificationSettings,
  ProfileUpdateRequest,
  NotificationSettings,
} from "@/lib/profileApi";

export function useProfile() {
  const queryClient = useQueryClient();
  const token = authAPI.getAccessToken();

  // Fetch user profile
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getUserProfile(),
    enabled: !!token,
  });

  // Fetch notification settings
  const {
    data: notificationSettings,
    isLoading: isLoadingNotificationSettings,
    error: notificationSettingsError,
    refetch: refetchNotificationSettings,
  } = useQuery({
    queryKey: ["notificationSettings"],
    queryFn: () => getNotificationSettings(),
    enabled: !!token,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: ProfileUpdateRequest) =>
      updateUserProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => {
      // Error handled by component
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => {
      // Error handled by component
    },
  });

  // Update notification settings mutation
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: (settings: NotificationSettings) =>
      updateNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
    },
    onError: () => {
      // Error handled by component
    },
  });

  return {
    // Data
    userProfile: userProfile?.data,
    notificationSettings: notificationSettings?.data,

    // Loading states
    isLoadingProfile,
    isLoadingNotificationSettings,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    isUpdatingNotificationSettings:
      updateNotificationSettingsMutation.isPending,

    // Error states
    profileError,
    notificationSettingsError,
    updateProfileError: updateProfileMutation.error,
    uploadAvatarError: uploadAvatarMutation.error,
    updateNotificationSettingsError: updateNotificationSettingsMutation.error,

    // Actions
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutate,
    uploadAvatarAsync: uploadAvatarMutation.mutateAsync,
    updateNotificationSettings: updateNotificationSettingsMutation.mutate,
    updateNotificationSettingsAsync:
      updateNotificationSettingsMutation.mutateAsync,
    refetchProfile,
    refetchNotificationSettings,
  };
}
