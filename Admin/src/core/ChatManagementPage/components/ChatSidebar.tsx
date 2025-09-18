"use client";

import React, { useState, useEffect } from "react";
import { User, Loader2, Wifi, WifiOff } from "lucide-react";
import { Conversation, conversationApi } from "../services/conversationApi";
import { conversationStore } from "@/utils/conversationStore";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  isLoading?: boolean;
  isWebSocketConnected?: boolean;
  totalUnreadCount?: number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  isLoading = false,
  isWebSocketConnected = false,
  totalUnreadCount = 0,
}) => {
  // Track which conversation is currently open
  const [currentlyOpenConversationId, setCurrentlyOpenConversationId] =
    useState<number | null>(null);

  // Note: WebSocket is handled by the main sidebar to avoid duplicate connections
  // This component listens to conversation store updates instead

  // Listen for open conversation changes
  useEffect(() => {
    const unsubscribeOpenConversation =
      conversationStore.subscribeToOpenConversation((conversationId) => {
        setCurrentlyOpenConversationId(conversationId);
      });

    return () => {
      unsubscribeOpenConversation();
    };
  }, []);

  // Show all conversations since search is now handled by UserSearchDropdown
  const filteredConversations = conversations;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getParticipantTypeColor = (type: string) => {
    switch (type) {
      case "user":
        return "bg-blue-500";
      case "worker":
        return "bg-green-500";
      case "admin":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Sidebar Header with WebSocket Status */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 w-full ">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <div className="flex items-center space-x-2">
            {/* Total Unread Count Badge */}
            {totalUnreadCount > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {totalUnreadCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <User size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium">No conversations</p>
            <p className="text-sm">
              Start a new conversation by searching for a user
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              // For admin view, show both participants
              const user1 = conversation.user_1_data;
              const user2 = conversation.user_2_data;

              if (!user1 || !user2) return null;

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    // Mark conversation as read if it has unread messages and is not currently open
                    if (
                      conversation.unread_count &&
                      conversation.unread_count > 0 &&
                      currentlyOpenConversationId !== conversation.id
                    ) {
                      // Handle async operation without blocking the click
                      conversationApi
                        .markConversationAsRead(conversation.id)
                        .then(() => {
                          // Emit read status update to notify other components
                          conversationStore.emitReadStatusUpdate(
                            conversation.id
                          );
                        })
                        .catch(() => {
                          // Silently handle error
                        });
                    }

                    onConversationSelect(conversation);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedConversation?.id === conversation.id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatars - show both participants */}
                    <div className="relative flex -space-x-2">
                      {/* User 1 Avatar */}
                      <div className="relative">
                        {user1.avatar ? (
                          <img
                            src={user1.avatar}
                            alt={user1.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full ${getParticipantTypeColor(
                              user1.user_type
                            )} flex items-center justify-center text-white font-semibold border-2 border-white text-xs`}
                          >
                            {(user1.name || user1.phone || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* User 2 Avatar */}
                      <div className="relative">
                        {user2.avatar ? (
                          <img
                            src={user2.avatar}
                            alt={user2.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full ${getParticipantTypeColor(
                              user2.user_type
                            )} flex items-center justify-center text-white font-semibold border-2 border-white text-xs`}
                          >
                            {(user2.name || user2.phone || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {user1.name || user1.phone || "User 1"} &{" "}
                          {user2.name || user2.phone || "User 2"}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.updated_at)}
                          </span>
                          {(conversation.unread_count || 0) > 0 &&
                            currentlyOpenConversationId !== conversation.id && (
                              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {conversation.unread_count}
                              </span>
                            )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.last_message_text || "No messages yet"}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          {/* Only show role tags for non-admin users to reduce redundancy */}
                          {user1.user_type !== "admin" && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getParticipantTypeColor(
                                user1.user_type
                              )} text-white`}
                            >
                              {user1.user_type}
                            </span>
                          )}
                          {user2.user_type !== "admin" && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getParticipantTypeColor(
                                user2.user_type
                              )} text-white`}
                            >
                              {user2.user_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
