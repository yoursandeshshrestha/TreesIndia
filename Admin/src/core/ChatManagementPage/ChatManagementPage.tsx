"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Components
import ChatSidebar from "./components/ChatSidebar";
import ChatMainArea from "./components/ChatMainArea";
import UserSearchDropdown from "./components/UserSearchDropdown";

// Services
import { conversationApi, Conversation } from "./services/conversationApi";

// Utils
import { conversationStore } from "@/utils/conversationStore";
import { getCurrentUser } from "@/utils/authUtils";
import {
  getChatUserContext,
  clearChatUserContext,
} from "@/utils/chatNavigation";

// Hooks
import { useGlobalWebSocket } from "@/components/GlobalWebSocketProvider/GlobalWebSocketProvider";

// Types
import { User as UserType } from "@/types/user";

interface WebSocketMessage {
  conversation_id: number;
  message: {
    id: number;
    conversation_id: number;
    sender_id: number;
    message: string;
    created_at: string;
    sender?: {
      user_type: string;
    };
  };
}

type TabType = "admin" | "oversight";

function ChatManagementPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("admin");
  const [isHandlingUserContext, setIsHandlingUserContext] = useState(false);
  // Get global WebSocket state and unread count
  const { isConnected: isWebSocketConnected, totalUnreadCount } =
    useGlobalWebSocket();

  const loadConversations = async (tab: TabType = activeTab) => {
    setIsLoading(true);
    try {
      let response;
      if (tab === "admin") {
        response = await conversationApi.getAllConversations(1, 50);
      } else {
        response = await conversationApi.getAllConversationsForOversight(1, 50);
      }
      const conversations = response.conversations || [];
      setConversations(conversations);

      // Don't calculate unread count here - the backend WebSocket will handle it
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Failed to load conversations");
      // Don't show error toast if it's just that there are no conversations yet
      if (error instanceof Error && !error.message.includes("404")) {
        toast.error("Failed to load conversations");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user context from booking system
  const handleUserContext = useCallback(async () => {
    if (isHandlingUserContext) {
      return;
    }

    const userContext = getChatUserContext();
    if (!userContext) {
      return;
    }

    setIsHandlingUserContext(true);

    try {
      // Clear the context first
      clearChatUserContext();

      // Check if conversation already exists with this user
      const existingConversation = conversations.find(
        (conv) =>
          conv.user_1 === userContext.userId ||
          conv.user_2 === userContext.userId
      );

      if (existingConversation) {
        // Select existing conversation
        setSelectedConversation(existingConversation);
        toast.success(
          `Opened conversation with ${userContext.userName || "user"} (${
            userContext.userPhone
          })`
        );
        return; // Exit early to prevent error handling
      } else {
        // Create a new conversation via API
        const currentUser = getCurrentUser();
        if (!currentUser) {
          toast.error("Admin user not found");
          return;
        }

        const conversationData = {
          user_1: currentUser.id,
          user_2: userContext.userId,
        };

        const response = await conversationApi.createConversation(
          conversationData
        );
        const newConversation = response.conversation;

        // Add to conversations list
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation(newConversation);

        // Set this conversation as open in the store
        conversationStore.setOpenConversation(newConversation.id);

        // Show success toast after a small delay to ensure UI is updated
        setTimeout(() => {
          toast.success(
            `Started conversation with ${userContext.userName || "user"} (${
              userContext.userPhone
            })`
          );
        }, 100);
        return; // Exit early to prevent error handling
      }
    } catch (error) {
      console.error("Failed to handle user context:", error);
      toast.error("Failed to start conversation");
    } finally {
      setIsHandlingUserContext(false);
    }
  }, [conversations, isHandlingUserContext]);

  const updateConversationList = useCallback(
    (data: WebSocketMessage) => {
      const conversationId = data.conversation_id;
      const message = data.message;

      // If this conversation is currently open, automatically mark it as read
      if (conversationStore.isConversationOpen(conversationId)) {
        conversationApi
          .markConversationAsRead(conversationId)
          .then(() => {
            // Emit read status update
            conversationStore.emitReadStatusUpdate(conversationId);
          })
          .catch((error) => {
            console.error("Failed to auto-mark conversation as read:", error);
          });
      }

      setConversations((prevConversations) => {
        // Find the conversation that was updated
        const conversationIndex = prevConversations.findIndex(
          (conv) => conv.id === conversationId
        );

        if (conversationIndex === -1) {
          // If conversation doesn't exist in the list, reload conversations
          loadConversations();
          return prevConversations;
        }

        // Update the conversation with new last message info
        const updatedConversations = [...prevConversations];

        const updatedConversation = {
          ...updatedConversations[conversationIndex],
          last_message_text: message.message,
          last_message_created_at: message.created_at,
          last_message_sender_id: message.sender_id,
          updated_at: message.created_at,
          // Update unread count only if this conversation is not currently open
          unread_count: conversationStore.isConversationOpen(conversationId)
            ? 0 // If conversation is open, unread count should be 0
            : (updatedConversations[conversationIndex].unread_count || 0) + 1,
        };

        // Move updated conversation to the top
        updatedConversations.splice(conversationIndex, 1);
        updatedConversations.unshift(updatedConversation);

        // Note: Audio sounds for messages are handled in ChatMainArea component

        // Emit conversation list update to notify other components (like sidebar)
        conversationStore.emitConversationListUpdate(updatedConversations);

        return updatedConversations;
      });
    },
    [selectedConversation?.id]
  );

  // Handle conversation unread count updates from WebSocket
  const handleConversationUnreadCount = useCallback(
    (conversationId: number, unreadCount: number) => {
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === conversationId) {
            return { ...conv, unread_count: unreadCount };
          }
          return conv;
        });
      });
    },
    []
  );

  // Listen to conversation updates from sidebar
  useEffect(() => {
    const unsubscribeConversationUpdate = conversationStore.subscribeToUpdates(
      (data) => {
        updateConversationList(data);
      }
    );

    const unsubscribeConversationList =
      conversationStore.subscribeToConversationList((conversations) => {
        setConversations(conversations);
      });

    const unsubscribeConversationUnreadCount =
      conversationStore.subscribeToConversationUnreadCount(
        (conversationId, count) => {
          handleConversationUnreadCount(conversationId, count);
        }
      );

    return () => {
      unsubscribeConversationUpdate();
      unsubscribeConversationList();
      unsubscribeConversationUnreadCount();
    };
  }, [updateConversationList, handleConversationUnreadCount]);

  // Load conversations on component mount and when tab changes
  useEffect(() => {
    loadConversations(activeTab);
  }, [activeTab]);

  // Handle user context from booking system
  useEffect(() => {
    // Check for user context immediately when component mounts
    const userContext = getChatUserContext();
    if (userContext && !isHandlingUserContext) {
      handleUserContext();
    }
  }, [handleUserContext, isHandlingUserContext]);

  // Also handle user context when conversations are loaded
  useEffect(() => {
    if (conversations.length > 0) {
      const userContext = getChatUserContext();
      if (userContext && !isHandlingUserContext) {
        handleUserContext();
      }
    }
  }, [conversations, handleUserContext, isHandlingUserContext]);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedConversation(null); // Clear selected conversation when switching tabs
  };

  // Cleanup: Clear open conversation when component unmounts
  useEffect(() => {
    return () => {
      conversationStore.setOpenConversation(null);
    };
  }, []);

  // Handle conversation closing (when selectedConversation changes to null)
  useEffect(() => {
    if (selectedConversation === null) {
      // When no conversation is selected, clear the open conversation
      conversationStore.setOpenConversation(null);
    }
  }, [selectedConversation]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);

    // Set this conversation as open in the store
    conversationStore.setOpenConversation(conversation.id);

    // Mark conversation as read (async, non-blocking)
    conversationApi
      .markConversationAsRead(conversation.id)
      .then(() => {
        // Emit read status update
        conversationStore.emitReadStatusUpdate(conversation.id);
      })
      .catch((error) => {
        console.error("Failed to mark conversation as read:", error);
      });

    // Reset unread count for the selected conversation
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv.id === conversation.id) {
          return { ...conv, unread_count: 0 };
        }
        return conv;
      });
    });
  };

  const handleUserSelect = async (user: UserType) => {
    try {
      setIsLoading(true);

      // Check if conversation already exists with this user
      const existingConversation = conversations.find(
        (conv) => conv.user_1 === user.ID || conv.user_2 === user.ID
      );

      if (existingConversation) {
        // Select existing conversation
        setSelectedConversation(existingConversation);
        toast.success(`Opened conversation with ${user.name}`);
      } else {
        // Create a new conversation via API
        // Get current admin user ID
        const currentUser = getCurrentUser();
        if (!currentUser) {
          toast.error("Admin user not found");
          return;
        }

        const conversationData = {
          user_1: currentUser.id,
          user_2: user.ID,
        };

        const response = await conversationApi.createConversation(
          conversationData
        );
        const newConversation = response.conversation;

        // Add to conversations list
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation(newConversation);

        // Set this conversation as open in the store
        conversationStore.setOpenConversation(newConversation.id);

        toast.success(`Started conversation with ${user.name}`);
      }
    } catch (error) {
      console.error("Failed to handle user selection:", error);
      toast.error("Failed to start conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-75px)] flex bg-white -mx-6 -mt-6 -mb-6">
      {/* Chat Sidebar */}
      <div className="w-1/3 min-w-[350px] bg-white border-r border-gray-200 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange("admin")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "admin"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => handleTabChange("oversight")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "oversight"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Others
          </button>
        </div>

        {/* Search - only show for admin tab */}
        {activeTab === "admin" && (
          <div className="p-4 border-b border-gray-200">
            <UserSearchDropdown
              onUserSelect={handleUserSelect}
              placeholder="Search users..."
            />
          </div>
        )}

        {/* Tab description */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <p className="text-xs text-gray-600">
            {activeTab === "admin"
              ? "Your conversations with users and workers"
              : "All conversations in the system for monitoring"}
          </p>
        </div>

        {/* Conversations List */}
        <ChatSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
          isLoading={isLoading}
          isWebSocketConnected={isWebSocketConnected}
          totalUnreadCount={totalUnreadCount}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatMainArea selectedConversation={selectedConversation} />
      </div>
    </div>
  );
}

export default ChatManagementPage;
