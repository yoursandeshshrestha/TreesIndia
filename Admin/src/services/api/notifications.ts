import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
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
  sendFCM: "/admin/notifications/send",
  sendFCMBulk: "/admin/notifications/send-bulk",
} as const;

// Query keys
export const notificationQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
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

  // Send FCM notification to a single user
  sendFCMNotification: async (data: {
    user_id: number;
    type: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    image_url?: string;
    click_action?: string;
    priority?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      user_id: number;
      type: string;
      push_sent: boolean;
      push_success: boolean;
      push_error?: string;
      sent_at: string;
    };
  }> => {
    return api.post(NOTIFICATION_ENDPOINTS.sendFCM, data);
  },

  // Send FCM notifications to multiple users
  sendFCMNotificationBulk: async (data: {
    user_ids: number[];
    type: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    image_url?: string;
    click_action?: string;
    priority?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      results: Array<{
        user_id: number;
        type: string;
        push_sent: boolean;
        push_success: boolean;
        push_error?: string;
        sent_at: string;
      }>;
      success_count: number;
      failure_count: number;
      total: number;
    };
  }> => {
    return api.post(NOTIFICATION_ENDPOINTS.sendFCMBulk, data);
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

// React Query hooks for FCM notifications
export const useSendFCMNotification = () => {
  return useMutation({
    mutationFn: notificationApi.sendFCMNotification,
  });
};

export const useSendFCMNotificationBulk = () => {
  return useMutation({
    mutationFn: notificationApi.sendFCMNotificationBulk,
  });
};
