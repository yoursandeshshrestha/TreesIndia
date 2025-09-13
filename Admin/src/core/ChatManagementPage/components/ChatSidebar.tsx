"use client";

import React, { useState, useEffect } from "react";
import { User, Loader2 } from "lucide-react";
import { Conversation, conversationApi } from "../services/conversationApi";
import { conversationStore } from "@/utils/conversationStore";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  isLoading?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  isLoading = false,
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
            // Get the other participant (not admin)
            const otherParticipant = conversation.user || conversation.worker;

            if (!otherParticipant) return null;

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
                        conversationStore.emitReadStatusUpdate(conversation.id);
                      })
                      .catch((error) => {
                        console.error(
                          "Failed to mark conversation as read:",
                          error
                        );
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
                  {/* Avatar */}
                  <div className="relative">
                    {otherParticipant.avatar ? (
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full ${getParticipantTypeColor(
                          otherParticipant.user_type
                        )} flex items-center justify-center text-white font-semibold`}
                      >
                        {(
                          otherParticipant.name ||
                          otherParticipant.phone ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {otherParticipant.name ||
                          otherParticipant.phone ||
                          "Unknown User"}
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
                      <span className="text-xs text-gray-400 capitalize">
                        {otherParticipant.user_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
