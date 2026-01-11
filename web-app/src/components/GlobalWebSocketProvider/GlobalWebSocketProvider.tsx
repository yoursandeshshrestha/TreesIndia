"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useConversationWebSocket } from "@/hooks/useConversationWebSocket";
import { conversationStore } from "@/utils/conversationStore";
import { getTotalUnreadCount } from "@/lib/simpleConversationApi";

interface GlobalWebSocketContextType {
  isConversationConnected: boolean;
  conversationError: string | null;
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

  // Global conversation WebSocket connection
  const {
    isConnected: isConversationConnected,
    connectionError: conversationError,
  } = useConversationWebSocket({
    onMessage: (message: unknown) => {
      // Type guard to ensure the message has the expected structure
      if (message && typeof message === 'object' && 'conversation_id' in message && 'message' in message && 'sender_id' in message && 'timestamp' in message) {
        const rawData = message as { conversation_id: number; message: string; sender_id: number; timestamp: string };
        // Transform to ConversationUpdateData format
        const data = {
          event: 'new_conversation_message',
          conversation_id: rawData.conversation_id,
          message: {
            id: Date.now(), // Generate temporary ID
            message: rawData.message,
            created_at: rawData.timestamp,
            sender_id: rawData.sender_id,
            sender: {
              user_type: 'user' // Default user type, could be enhanced based on sender_id
            }
          }
        };
        // Emit message updates to conversation store for other components
        conversationStore.emitUpdate(data);
      }
    },
    onTotalUnreadCount: (count: number) => {
      setTotalUnreadCount(count);
      conversationStore.setCurrentUnreadCount(count);
    },
    onConversationUnreadCount: (conversationId: number, count: number) => {
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
      const response = await getTotalUnreadCount();
      setTotalUnreadCount(response.total_unread_count);
      conversationStore.setCurrentUnreadCount(response.total_unread_count);
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

    const unsubscribeTotalUnreadCount =
      conversationStore.subscribeToTotalUnreadCount((count) => {
        setTotalUnreadCount(count);
      });

    return () => {
      unsubscribeReadStatus();
      unsubscribeConversationList();
      unsubscribeConversationUnreadCount();
      unsubscribeTotalUnreadCount();
    };
  }, [currentlyOpenConversationId]);

  const contextValue: GlobalWebSocketContextType = {
    isConversationConnected,
    conversationError,
    totalUnreadCount,
  };

  return (
    <GlobalWebSocketContext.Provider value={contextValue}>
      {children}
    </GlobalWebSocketContext.Provider>
  );
};
