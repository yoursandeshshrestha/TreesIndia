import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllChatRooms,
  fetchChatMessages,
  sendAdminMessage,
  closeChatRoom,
} from "@/lib/chatApi";

// Query keys
export const adminChatKeys = {
  all: ["adminChat"] as const,
  rooms: () => [...adminChatKeys.all, "rooms"] as const,
  messages: (roomId: number) =>
    [...adminChatKeys.all, "messages", roomId] as const,
};

// Hook for fetching all chat rooms (admin only)
export function useAllChatRooms(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...adminChatKeys.rooms(), params],
    queryFn: () => fetchAllChatRooms(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for fetching messages in a chat room
export function useAdminChatMessages(
  roomId: number,
  params?: {
    page?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: [...adminChatKeys.messages(roomId), params],
    queryFn: () => fetchChatMessages(roomId, params),
    enabled: !!roomId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for admin chat mutations
export function useAdminChatMutations() {
  const queryClient = useQueryClient();

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({
      roomId,
      messageData,
    }: {
      roomId: number;
      messageData: {
        message: string;
        message_type?: "text" | "image" | "file";
      };
    }) => sendAdminMessage(roomId, messageData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch messages for the room
      queryClient.invalidateQueries({
        queryKey: adminChatKeys.messages(variables.roomId),
      });
      // Invalidate chat rooms to update last message
      queryClient.invalidateQueries({
        queryKey: adminChatKeys.rooms(),
      });
    },
    onError: (error) => {
      console.error("Error sending admin message:", error);
    },
  });

  // Close chat room mutation
  const closeRoomMutation = useMutation({
    mutationFn: (roomId: number) => closeChatRoom(roomId),
    onSuccess: (data, roomId) => {
      // Invalidate chat rooms to update status
      queryClient.invalidateQueries({
        queryKey: adminChatKeys.rooms(),
      });
      // Invalidate messages for the closed room
      queryClient.invalidateQueries({
        queryKey: adminChatKeys.messages(roomId),
      });
    },
    onError: (error) => {
      console.error("Error closing chat room:", error);
    },
  });

  return {
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isSendingMessage: sendMessageMutation.isPending,
    sendMessageError: sendMessageMutation.error,

    closeRoom: closeRoomMutation.mutate,
    closeRoomAsync: closeRoomMutation.mutateAsync,
    isClosingRoom: closeRoomMutation.isPending,
    closeRoomError: closeRoomMutation.error,
  };
}

// Combined hook for admin chat functionality
export function useAdminChat(roomId?: number) {
  // Get all chat rooms
  const {
    data: chatRoomsData,
    isLoading: isLoadingChatRooms,
    error: chatRoomsError,
    refetch: refetchChatRooms,
  } = useAllChatRooms();

  // Get messages for specific room
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useAdminChatMessages(roomId || 0);

  // Get mutations
  const {
    sendMessage,
    sendMessageAsync,
    isSendingMessage,
    sendMessageError,
    closeRoom,
    closeRoomAsync,
    isClosingRoom,
    closeRoomError,
  } = useAdminChatMutations();

  return {
    // Data
    chatRooms: chatRoomsData?.chat_rooms || [],
    messages: messagesData?.messages || [],
    pagination: {
      chatRooms: chatRoomsData?.pagination,
      messages: messagesData?.pagination,
    },

    // Loading states
    isLoadingChatRooms,
    isLoadingMessages,
    isSendingMessage,
    isClosingRoom,

    // Error states
    chatRoomsError,
    messagesError,
    sendMessageError,
    closeRoomError,

    // Actions
    sendMessage,
    sendMessageAsync,
    closeRoom,
    closeRoomAsync,
    refetchChatRooms,
    refetchMessages,
  };
}
