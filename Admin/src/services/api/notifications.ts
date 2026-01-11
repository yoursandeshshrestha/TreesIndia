import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

// API endpoints
const NOTIFICATION_ENDPOINTS = {
  sendFCM: "/admin/notifications/send",
  sendFCMBulk: "/admin/notifications/send-bulk",
} as const;

// Notification API functions
export const notificationApi = {
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
