import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { notificationApi, notificationQueryKeys } from "@/lib/notificationApi";
import { notificationStore } from "@/utils/notificationStore";
import { toast } from "sonner";

// React Query hooks
export const useNotifications = (params?: {
  limit?: number;
  page?: number;
  type?: string;
  is_read?: boolean;
}) => {
  const [storeState, setStoreState] = useState(notificationStore.getState());

  useEffect(() => {
    const unsubscribe = notificationStore.subscribe(setStoreState);
    return unsubscribe;
  }, []);

  const query = useQuery({
    queryKey: notificationQueryKeys.list(params || {}),
    queryFn: () => notificationApi.getNotifications(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Update store when query data changes
  useEffect(() => {
    if (query.data?.data) {
      if (params?.page === 1 || !params?.page) {
        notificationStore.setNotifications(query.data.data);
      } else {
        // For pagination, append to existing notifications
        const currentNotifications = storeState.notifications;
        notificationStore.setNotifications([
          ...currentNotifications,
          ...query.data.data,
        ]);
      }
    }
  }, [query.data, params?.page, storeState.notifications]);

  return {
    ...query,
    data: {
      ...query.data,
      data: storeState.notifications,
    },
  };
};

export const useUnreadCount = () => {
  const [storeState, setStoreState] = useState(notificationStore.getState());

  useEffect(() => {
    const unsubscribe = notificationStore.subscribe(setStoreState);
    return unsubscribe;
  }, []);

  const query = useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: notificationApi.getUnreadCount,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
  });

  // Update store when query data changes
  useEffect(() => {
    if (query.data?.unread_count !== undefined) {
      notificationStore.setUnreadCount(query.data.unread_count);
    }
  }, [query.data]);

  return {
    ...query,
    data: {
      ...query.data,
      unread_count: storeState.unreadCount,
    },
  };
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      // Update store immediately
      notificationStore.markAllAsRead();

      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
      toast.success("All notifications marked as read");
    },
    onError: (error: Error) => {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all notifications as read");
    },
  });
};
