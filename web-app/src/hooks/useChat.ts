import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth-api";
import {
  fetchUserChatRooms,
  fetchChatHistory,
  fetchChatMessages,
  sendChatMessage,
  fetchBookingChatRoom,
} from "@/lib/chatApi";

import { useAuth } from "@/hooks/useAuth";

// Query keys
export const chatKeys = {
  all: ["chat"] as const,
  rooms: () => [...chatKeys.all, "rooms"] as const,
  history: () => [...chatKeys.all, "history"] as const,
  messages: (roomId: number) => [...chatKeys.all, "messages", roomId] as const,
  bookingRoom: (bookingId: number) =>
    [...chatKeys.all, "bookingRoom", bookingId] as const,
};

// Hook for fetching user's chat rooms
export function useUserChatRooms(params?: { page?: number; limit?: number }) {
  const token = authAPI.getAccessToken();

  return useQuery({
    queryKey: [...chatKeys.rooms(), params],
    queryFn: () => fetchUserChatRooms(params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for fetching chat history
export function useChatHistory(params?: { page?: number; limit?: number }) {
  const token = authAPI.getAccessToken();

  return useQuery({
    queryKey: [...chatKeys.history(), params],
    queryFn: () => fetchChatHistory(params),
    enabled: !!token,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching messages in a chat room
export function useChatMessages(
  roomId: number,
  params?: {
    page?: number;
    limit?: number;
  }
) {
  const token = authAPI.getAccessToken();

  return useQuery({
    queryKey: [...chatKeys.messages(roomId), params],
    queryFn: () => fetchChatMessages(roomId, params),
    enabled: !!token && !!roomId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching booking chat room
export function useBookingChatRoom(bookingId: number) {
  const token = authAPI.getAccessToken();

  return useQuery({
    queryKey: chatKeys.bookingRoom(bookingId),
    queryFn: () => fetchBookingChatRoom(bookingId),
    enabled: !!token && !!bookingId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for chat mutations (send message, mark as read, etc.)
export function useChatMutations() {
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
    }) => sendChatMessage(roomId, messageData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch messages for the room
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.roomId),
      });
      // Invalidate chat rooms to update last message
      queryClient.invalidateQueries({
        queryKey: chatKeys.rooms(),
      });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  return {
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isSendingMessage: sendMessageMutation.isPending,
    sendMessageError: sendMessageMutation.error,
  };
}

// Combined hook for chat functionality
export function useChat(roomId?: number, bookingId?: number) {
  const { user } = useAuth();

  // Get chat rooms
  const {
    data: chatRoomsData,
    isLoading: isLoadingChatRooms,
    error: chatRoomsError,
    refetch: refetchChatRooms,
  } = useUserChatRooms();

  // Get chat history
  const {
    data: chatHistoryData,
    isLoading: isLoadingChatHistory,
    error: chatHistoryError,
    refetch: refetchChatHistory,
  } = useChatHistory();

  // Get messages for specific room
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useChatMessages(roomId || 0);

  // Get booking chat room
  const {
    data: bookingChatRoomData,
    isLoading: isLoadingBookingChatRoom,
    error: bookingChatRoomError,
    refetch: refetchBookingChatRoom,
  } = useBookingChatRoom(bookingId || 0);

  // Get mutations
  const { sendMessage, sendMessageAsync, isSendingMessage, sendMessageError } =
    useChatMutations();

  return {
    // Data
    chatRooms: chatRoomsData?.chat_rooms || [],
    chatHistory: chatHistoryData?.chat_rooms || [],
    messages: messagesData?.messages || [],
    bookingChatRoom: bookingChatRoomData?.chat_room,
    pagination: {
      chatRooms: chatRoomsData?.pagination,
      chatHistory: chatHistoryData?.pagination,
      messages: messagesData?.pagination,
    },

    // Loading states
    isLoadingChatRooms,
    isLoadingChatHistory,
    isLoadingMessages,
    isLoadingBookingChatRoom,
    isSendingMessage,

    // Error states
    chatRoomsError,
    chatHistoryError,
    messagesError,
    bookingChatRoomError,
    sendMessageError,

    // Actions
    sendMessage,
    sendMessageAsync,
    refetchChatRooms,
    refetchChatHistory,
    refetchMessages,
    refetchBookingChatRoom,

    // Helper functions
    currentUser: user,
  };
}
