"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { useSimpleConversation } from "@/hooks/useSimpleConversations";
import { useSimpleConversationWebSocket } from "@/hooks/useSimpleConversationWebSocket";
import { SimpleConversationMessage } from "@/lib/simpleConversationApi";
import { playSound } from "@/utils/soundUtils";

interface SimpleRealTimeChatProps {
  conversationId: number;
  connectionError?: string | null;
}

export function SimpleRealTimeChat({
  conversationId,
}: SimpleRealTimeChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversation data and messages
  const {
    conversation,
    messages,
    isLoadingMessages,
    isSendingMessage,
    sendMessage,
    markMessageRead,
    currentUser,
  } = useSimpleConversation(conversationId);

  // WebSocket integration
  const { isConnected, sendTypingIndicator } = useSimpleConversationWebSocket({
    conversationId,
    onMessage: (message: SimpleConversationMessage) => {
      // Mark message as read if it's not from current user
      if (message.sender_id !== currentUser?.id) {
        markMessageRead(message.id);

        // Play receive sound for messages from other users
        playSound("receive");
      }
    },
    onTyping: (userId: number, isTyping: boolean) => {
      // Handle typing indicators
      if (userId !== currentUser?.id) {
        setIsTyping(isTyping);
      }
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark all messages as read when conversation opens
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) => !msg.is_read && msg.sender_id !== currentUser?.id
      );
      unreadMessages.forEach((msg) => markMessageRead(msg.id));
    }
  }, [conversationId, messages, currentUser?.id, markMessageRead]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || isSendingMessage) return;

    try {
      await sendMessage({ message: newMessage.trim() });
      setNewMessage("");

      // Play send sound
      playSound("send");

      // Stop typing indicator
      sendTypingIndicator(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [newMessage, isSendingMessage, sendMessage, sendTypingIndicator]);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setNewMessage(value);

      // Send typing indicator
      if (value.trim() && isConnected) {
        sendTypingIndicator(true);
      } else if (isConnected) {
        sendTypingIndicator(false);
      }
    },
    [isConnected, sendTypingIndicator]
  );

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {otherParticipant ? (
              <>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {(otherParticipant.name || otherParticipant.phone || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {otherParticipant.name ||
                      otherParticipant.phone ||
                      "Unknown User"}
                  </h3>
                  <p className="text-xs text-gray-500 capitalize">
                    {otherParticipant.user_type}
                    {isTyping && " • typing..."}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <MessageCircle size={16} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Loading...
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUser?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div className="max-w-xs">
                  <div
                    className={`rounded-lg px-3 py-2 ${
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
                    {formatTime(message.created_at)}
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
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isSendingMessage}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSendingMessage}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSendingMessage ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
