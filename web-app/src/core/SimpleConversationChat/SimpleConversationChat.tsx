"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MessageCircle, Send, Loader2, User } from "lucide-react";
import { useSimpleConversation } from "@/hooks/useSimpleConversations";
import { useSimpleConversationWebSocket } from "@/hooks/useSimpleConversationWebSocket";
import { SimpleConversationMessage } from "@/lib/simpleConversationApi";
import { displayChatDateTime } from "@/utils/displayUtils";
import { useQueryClient } from "@tanstack/react-query";
import { simpleConversationKeys } from "@/hooks/useSimpleConversations";
import { conversationStore } from "@/utils/conversationStore";

interface SimpleConversationChatProps {
  conversationId: number;
  onClose?: () => void;
}

export const SimpleConversationChat: React.FC<SimpleConversationChatProps> = ({
  conversationId,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsReadRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  // Get conversation data and messages
  const {
    conversation,
    messages,
    isLoadingMessages,
    isSendingMessage,
    sendMessage,
    markMessageRead,
    markConversationRead,
    currentUser,
  } = useSimpleConversation(conversationId);

  // WebSocket integration
  const { isConnected, sendTypingIndicator } = useSimpleConversationWebSocket({
    conversationId,
    isConversationOpen: true, // This conversation is currently open
    onMessage: (message: Record<string, unknown>) => {
      // Invalidate messages query to refetch latest messages
      queryClient.invalidateQueries({
        queryKey: simpleConversationKeys.messages(conversationId),
      });

      // Mark message as read if it's not from current user and not already read
      if (message.sender_id !== currentUser?.id && !message.is_read) {
        markMessageRead(message.id as number);
      }
    },
    onTyping: (userId: number, isTyping: boolean) => {
      // Handle typing indicators
      if (userId !== currentUser?.id) {
        setIsTyping(isTyping);
      }
    },
  });

  // Listen to global conversation updates for this specific conversation
  useEffect(() => {
    const unsubscribe = conversationStore.subscribeToUpdates((data) => {
      // Only handle updates for this conversation
      if (data.conversation_id === conversationId) {
        // Invalidate messages query to refetch latest messages
        queryClient.invalidateQueries({
          queryKey: simpleConversationKeys.messages(conversationId),
        });
      }
    });

    return unsubscribe;
  }, [conversationId, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark conversation as read when it opens (only once per conversation)
  useEffect(() => {
    if (conversationId && currentUser?.id) {
      // Only mark as read if we haven't already done it for this conversation
      if (hasMarkedAsReadRef.current !== conversationId) {
        markConversationRead();
        hasMarkedAsReadRef.current = conversationId;
      }
    }
  }, [conversationId, currentUser?.id, markConversationRead]);

  // Reset the read marker when conversation changes
  useEffect(() => {
    hasMarkedAsReadRef.current = null;
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSendingMessage) return;

    try {
      await sendMessage({ message: newMessage.trim() });
      setNewMessage("");

      // Stop typing indicator
      sendTypingIndicator(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Send typing indicator
    if (value.trim() && isConnected) {
      sendTypingIndicator(true);
    } else if (isConnected) {
      sendTypingIndicator(false);
    }
  };

  // Get the other participant (not current user)
  const getOtherParticipant = () => {
    if (!conversation) return null;

    if (conversation.user.ID === currentUser?.id) {
      return conversation.worker || conversation.admin;
    } else {
      return conversation.user;
    }
  };

  const otherParticipant = getOtherParticipant();

  if (isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {otherParticipant ? (
              <>
                {otherParticipant.avatar ? (
                  <Image
                    src={otherParticipant.avatar}
                    alt={otherParticipant.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {(otherParticipant.name || otherParticipant.phone || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {otherParticipant.name ||
                      otherParticipant.phone ||
                      "Unknown User"}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {otherParticipant.user_type}
                    {isTyping && " • typing..."}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Loading...
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Backend returns messages in DESC order (latest first), so we reverse them for display */}
            {messages
              .slice()
              .reverse()
              .map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === currentUser?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-xs lg:max-w-md">
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender_id === currentUser?.id
                          ? "bg-blue-500 text-white"
                          : "bg-white shadow-sm"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <p
                      className={`text-xs text-gray-500 mt-1 ${
                        message.sender_id === currentUser?.id
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {displayChatDateTime(message.created_at)}
                      {message.sender_id === currentUser?.id &&
                        message.is_read && <span className="ml-1">✓</span>}
                    </p>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isSendingMessage}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSendingMessage}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSendingMessage ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
