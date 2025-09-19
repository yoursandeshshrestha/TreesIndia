"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAdminConversationWebSocket } from "@/hooks/useAdminConversationWebSocket";
import { conversationStore } from "@/utils/conversationStore";

interface GlobalWebSocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  totalUnreadCount: number;
}

const GlobalWebSocketContext = createContext<GlobalWebSocketContextType | null>(
  null
);

export const useGlobalWebSocket = () => {
  const context = useContext(GlobalWebSocketContext);
  if (!context) {
    throw new Error(
      "useGlobalWebSocket must be used within a GlobalWebSocketProvider"
    );
  }
  return context;
};

interface GlobalWebSocketProviderProps {
  children: React.ReactNode;
}

export const GlobalWebSocketProvider: React.FC<
  GlobalWebSocketProviderProps
> = ({ children }) => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [currentlyOpenConversationId, setCurrentlyOpenConversationId] =
    useState<number | null>(null);

  // Global WebSocket connection for all real-time updates
  const { isConnected, connectionError } = useAdminConversationWebSocket({
    onTotalUnreadCount: (count) => {
      // Use the backend total unread count as a fallback
      // The conversation list subscription will override this with filtered count
      setTotalUnreadCount(count);
    },
    onMessage: (message) => {
      // Increment total unread count when new message arrives
      // (unless it's from the currently open conversation)
      const messageData = message as {
        conversation_id: number;
        message: Record<string, unknown>;
      };
      if (messageData.conversation_id !== currentlyOpenConversationId) {
        setTotalUnreadCount((prev) => prev + 1);
      }

      // Also reload total unread count as a fallback to ensure accuracy
      setTimeout(() => {
        loadTotalUnreadCount();
      }, 100);

      // Emit message updates to conversation store for other components
      // Transform the message data to match the expected ConversationUpdateData type
      const transformedMessageData = {
        conversation_id: messageData.conversation_id,
        message: messageData.message as {
          id: number;
          conversation_id: number;
          sender_id: number;
          message: string;
          created_at: string;
          sender?: {
            user_type: string;
          };
        }
      };
      conversationStore.emitUpdate(transformedMessageData);
    },
    onStatusUpdate: () => {
      // Handle status updates if needed
    },
    onConversationUnreadCount: (conversationId, count) => {
      // Emit conversation unread count updates to conversation store
      conversationStore.emitConversationUnreadCountUpdate(
        conversationId,
        count
      );
    },
  });

  // Load total unread count using the dedicated API
  const loadTotalUnreadCount = async () => {
    try {
      const { conversationApi } = await import(
        "@/core/ChatManagementPage/services/conversationApi"
      );
      const response = await conversationApi.getAdminTotalUnreadCount();
      // For now, we'll use the backend count directly
      // The backend should ideally filter out the currently open conversation
      setTotalUnreadCount(response.total_unread_count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  // Load total unread count on component mount
  useEffect(() => {
    loadTotalUnreadCount();
  }, []);

  // Listen for open conversation changes to adjust total count
  useEffect(() => {
    const unsubscribeOpenConversation =
      conversationStore.subscribeToOpenConversation((conversationId) => {
        setCurrentlyOpenConversationId(conversationId);
      });

    return () => {
      unsubscribeOpenConversation();
    };
  }, []);

  // Listen for read status updates to reload total count
  useEffect(() => {
    const unsubscribeReadStatus = conversationStore.subscribeToReadStatus(
      () => {
        // Reload total unread count when a conversation is marked as read
        loadTotalUnreadCount();
      }
    );

    const unsubscribeConversationList =
      conversationStore.subscribeToConversationList((conversations) => {
        // Calculate total unread count excluding currently open conversation
        const filteredCount = conversations.reduce((total, conv) => {
          if (conv.id !== currentlyOpenConversationId) {
            return total + (conv.unread_count || 0);
          }
          return total;
        }, 0);
        setTotalUnreadCount(filteredCount);
      });

    const unsubscribeConversationUnreadCount =
      conversationStore.subscribeToConversationUnreadCount(() => {
        // When individual conversation unread count changes, reload total count
        // This ensures real-time updates
        loadTotalUnreadCount();
      });

    return () => {
      unsubscribeReadStatus();
      unsubscribeConversationList();
      unsubscribeConversationUnreadCount();
    };
  }, [currentlyOpenConversationId]);

  const contextValue: GlobalWebSocketContextType = {
    isConnected,
    connectionError,
    totalUnreadCount,
  };

  return (
    <GlobalWebSocketContext.Provider value={contextValue}>
      {children}
    </GlobalWebSocketContext.Provider>
  );
};
