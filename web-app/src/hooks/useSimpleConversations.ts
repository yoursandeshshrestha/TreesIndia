import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchUserConversations,
  fetchConversation,
  fetchConversationMessages,
  createConversation,
  sendConversationMessage,
  markConversationMessageRead,
  markConversationAsRead,
  getConversationUnreadCount,
  getTotalUnreadCount,
  CreateConversationRequest,
  SendMessageRequest,
} from "@/lib/simpleConversationApi";
import { conversationStore } from "@/utils/conversationStore";

// Query Keys
export const simpleConversationKeys = {
  all: ["simpleConversations"] as const,
  lists: () => [...simpleConversationKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...simpleConversationKeys.lists(), { filters }] as const,
  details: () => [...simpleConversationKeys.all, "detail"] as const,
  detail: (id: number) => [...simpleConversationKeys.details(), id] as const,
  messages: (conversationId: number) =>
    [...simpleConversationKeys.detail(conversationId), "messages"] as const,
  unreadCount: (conversationId: number) =>
    [...simpleConversationKeys.detail(conversationId), "unreadCount"] as const,
  totalUnreadCount: () =>
    [...simpleConversationKeys.all, "totalUnreadCount"] as const,
};

// Hooks for fetching data

// Get user's conversations
export function useUserConversations(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: simpleConversationKeys.list(params || {}),
    queryFn: () => fetchUserConversations(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get conversation by ID
export function useConversation(conversationId: number) {
  return useQuery({
    queryKey: simpleConversationKeys.detail(conversationId),
    queryFn: () => fetchConversation(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get messages for a conversation
export function useConversationMessages(
  conversationId: number,
  params?: {
    page?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: simpleConversationKeys.messages(conversationId),
    queryFn: () => fetchConversationMessages(conversationId, params),
    enabled: !!conversationId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Get unread count for a conversation
export function useConversationUnreadCount(conversationId: number) {
  return useQuery({
    queryKey: simpleConversationKeys.unreadCount(conversationId),
    queryFn: () => getConversationUnreadCount(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes - only refetch if data is stale
    // Removed refetchInterval - no more polling, rely on WebSocket updates
  });
}

// Get total unread count for user (initial fetch only, real-time updates via WebSocket)
export function useTotalUnreadCount() {
  return useQuery({
    queryKey: simpleConversationKeys.totalUnreadCount(),
    queryFn: getTotalUnreadCount,
    staleTime: 1000 * 60 * 5, // 5 minutes - only refetch if data is stale
    // Removed refetchInterval - no more polling, rely on WebSocket updates
  });
}

// Mutations

// Create conversation
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationRequest) => createConversation(data),
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: simpleConversationKeys.lists(),
      });
    },
  });
}

// Send message
export function useSendConversationMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageData,
    }: {
      conversationId: number;
      messageData: SendMessageRequest;
    }) => sendConversationMessage(conversationId, messageData),
    onSuccess: () => {
      // Invalidate conversations list to update last_message
      queryClient.invalidateQueries({
        queryKey: simpleConversationKeys.lists(),
      });

      // Don't optimistically add the message here to avoid duplicates
      // Let WebSocket handle the message addition for instant updates
      // The WebSocket will receive the message immediately after sending
    },
  });
}

// Mark message as read
export function useMarkConversationMessageRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
    }: {
      conversationId: number;
      messageId: number;
    }) => markConversationMessageRead(conversationId, messageId),
    onSuccess: (_, { conversationId, messageId }) => {
      // Update the message in the cache
      queryClient.setQueryData(
        simpleConversationKeys.messages(conversationId),
        (oldData: { messages: Array<{ id: number; is_read: boolean; read_at?: string }> }) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            messages: oldData.messages.map((msg) =>
              msg.id === messageId
                ? { ...msg, is_read: true, read_at: new Date().toISOString() }
                : msg
            ),
          };
        }
      );

      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: simpleConversationKeys.unreadCount(conversationId),
      });

      // Update total unread count in real-time
      const currentCount = conversationStore.getCurrentUnreadCount() || 0;

      // Use setTimeout to defer the state update to avoid render phase issues
      setTimeout(() => {
        conversationStore.emitTotalUnreadCountUpdate(
          Math.max(0, currentCount - 1)
        );
      }, 0);
    },
  });
}

// Mark conversation as read
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: number) =>
      markConversationAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      // Emit read status update to global store
      conversationStore.emitReadStatusUpdate(conversationId);

      // Invalidate and refetch conversation messages
      queryClient.invalidateQueries({
        queryKey: simpleConversationKeys.messages(conversationId),
      });
      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: simpleConversationKeys.unreadCount(conversationId),
      });
      // Invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: simpleConversationKeys.lists(),
      });
      // Invalidate total unread count
      queryClient.invalidateQueries({
        queryKey: simpleConversationKeys.totalUnreadCount(),
      });

      // Update total unread count in real-time (marking conversation as read should decrease count by actual unread count)
      const currentCount = conversationStore.getCurrentUnreadCount() || 0;

      // Get the actual unread count for this conversation from the query cache
      const conversationData = queryClient.getQueryData(
        simpleConversationKeys.detail(conversationId)
      ) as { unread_count?: number } | undefined;
      const conversationUnreadCount = conversationData?.unread_count || 0;

      // Use setTimeout to defer the state update to avoid render phase issues
      setTimeout(() => {
        conversationStore.emitTotalUnreadCountUpdate(
          Math.max(0, currentCount - conversationUnreadCount)
        );
      }, 0);
    },
  });
}

// Combined hook for conversation functionality
export function useSimpleConversation(conversationId?: number) {
  const { user } = useAuth();

  // Get conversation data
  const {
    data: conversationData,
    isLoading: isLoadingConversation,
    error: conversationError,
    refetch: refetchConversation,
  } = useConversation(conversationId || 0);

  // Get messages
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useConversationMessages(conversationId || 0);

  // Get unread count
  const {
    data: unreadCountData,
    isLoading: isLoadingUnreadCount,
    error: unreadCountError,
  } = useConversationUnreadCount(conversationId || 0);

  // Get mutations
  const {
    mutate: sendMessage,
    isPending: isSendingMessage,
    error: sendMessageError,
  } = useSendConversationMessage();
  const { mutate: markMessageRead } = useMarkConversationMessageRead();
  const { mutate: markConversationRead } = useMarkConversationAsRead();

  return {
    // Data
    conversation: conversationData,
    messages: messagesData?.messages || [],
    unreadCount: unreadCountData?.unread_count || 0,
    pagination: {
      messages: messagesData?.pagination,
    },

    // Loading states
    isLoadingConversation,
    isLoadingMessages,
    isLoadingUnreadCount,
    isSendingMessage,

    // Error states
    conversationError,
    messagesError,
    unreadCountError,
    sendMessageError,

    // Actions
    sendMessage: (messageData: SendMessageRequest) => {
      if (conversationId) {
        sendMessage({ conversationId, messageData });
      }
    },
    markMessageRead: (messageId: number) => {
      if (conversationId) {
        markMessageRead({ conversationId, messageId });
      }
    },
    markConversationRead: () => {
      if (conversationId) {
        markConversationRead(conversationId);
      }
    },
    refetchConversation,
    refetchMessages,

    // Helper functions
    currentUser: user,
  };
}
