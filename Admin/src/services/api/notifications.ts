import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/types/api";
import type {
  InAppNotification,
  NotificationResponse,
  UnreadCountResponse,
  NotificationStatsResponse,
} from "@/types/notification";

// API endpoints
const NOTIFICATION_ENDPOINTS = {
  notifications: "/admin/in-app-notifications",
  unreadCount: "/admin/in-app-notifications/unread-count",
  readAll: "/admin/in-app-notifications/read-all",
  stats: "/admin/in-app-notifications/stats",
} as const;

// Query keys
export const notificationQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...notificationQueryKeys.lists(), filters] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unreadCount"] as const,
  stats: () => [...notificationQueryKeys.all, "stats"] as const,
};

// Notification API functions
export const notificationApi = {
  // Get admin notifications with pagination
  getNotifications: async (params?: {
    limit?: number;
    page?: number;
    type?: string;
    is_read?: boolean;
  }): Promise<NotificationResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.type) searchParams.append("type", params.type);
    if (params?.is_read !== undefined)
      searchParams.append("is_read", params.is_read.toString());

    const url = `${
      NOTIFICATION_ENDPOINTS.notifications
    }?${searchParams.toString()}`;
    return api.get<NotificationResponse>(url);
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    return api.get<UnreadCountResponse>(NOTIFICATION_ENDPOINTS.unreadCount);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    return api.patch<{ success: boolean; message: string }>(
      NOTIFICATION_ENDPOINTS.readAll
    );
  },

  // Get notification statistics
  getStats: async (): Promise<NotificationStatsResponse> => {
    return api.get<NotificationStatsResponse>(NOTIFICATION_ENDPOINTS.stats);
  },
};

// React Query hooks
export const useNotifications = (params?: {
  limit?: number;
  page?: number;
  type?: string;
  is_read?: boolean;
}) => {
  return useQuery({
    queryKey: notificationQueryKeys.list(params || {}),
    queryFn: () => notificationApi.getNotifications(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: notificationApi.getUnreadCount,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useNotificationStats = () => {
  return useQuery({
    queryKey: notificationQueryKeys.stats(),
    queryFn: notificationApi.getStats,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.unreadCount(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.stats(),
      });
    },
  });
};
