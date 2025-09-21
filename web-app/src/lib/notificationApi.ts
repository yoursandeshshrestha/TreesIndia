import { authenticatedFetch } from "./auth-api";
import {
  NotificationResponse,
  UnreadCountResponse,
  MarkAllAsReadResponse,
} from "@/types/notification";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// API endpoints
const NOTIFICATION_ENDPOINTS = {
  notifications: "/in-app-notifications",
  unreadCount: "/in-app-notifications/unread-count",
  markAllAsRead: "/in-app-notifications/read-all",
} as const;

// Query keys for React Query
export const notificationQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...notificationQueryKeys.lists(), params] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unreadCount"] as const,
  stats: () => [...notificationQueryKeys.all, "stats"] as const,
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Notification API functions
export const notificationApi = {
  // Get user notifications with pagination
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

    const url = `${API_BASE_URL}${
      NOTIFICATION_ENDPOINTS.notifications
    }?${searchParams.toString()}`;
    const response = await authenticatedFetch(url);
    return handleResponse<NotificationResponse>(response);
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const url = `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.unreadCount}`;
    const response = await authenticatedFetch(url);
    return handleResponse<UnreadCountResponse>(response);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const url = `${API_BASE_URL}${NOTIFICATION_ENDPOINTS.markAllAsRead}`;
    const response = await authenticatedFetch(url, {
      method: "PATCH",
    });
    return handleResponse<MarkAllAsReadResponse>(response);
  },
};
