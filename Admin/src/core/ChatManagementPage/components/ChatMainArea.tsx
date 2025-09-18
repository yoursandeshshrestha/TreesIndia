"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, Phone, Loader2 } from "lucide-react";
import {
  Conversation,
  Message,
  conversationApi,
} from "../services/conversationApi";
import { toast } from "sonner";
import { useSimpleConversationWebSocket } from "@/hooks/useSimpleConversationWebSocket";
import { displayChatDateTime } from "@/utils/displayUtils";
import { playSound, initializeAudio } from "@/utils/soundUtils";

interface ChatMainAreaProps {
  selectedConversation: Conversation | null;
}

const ChatMainArea: React.FC<ChatMainAreaProps> = ({
  selectedConversation,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!selectedConversation) return;

      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await conversationApi.getMessages(
          selectedConversation.id,
          page,
          50
        );

        // Backend returns messages in DESC order (latest first), so we reverse them for display
        const orderedMessages = (response.messages || []).reverse();

        if (append) {
          // For pagination, prepend older messages to the beginning
          setMessages((prev) => [...orderedMessages, ...prev]);
        } else {
          // For initial load, set messages directly
          setMessages(orderedMessages);
        }

        // Check if there are more messages to load
        setHasMoreMessages(
          response.pagination
            ? page <
                (response.pagination as { total_pages: number }).total_pages
            : false
        );
        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [selectedConversation]
  );

  const loadMoreMessages = async () => {
    if (!hasMoreMessages || isLoadingMore) return;

    const nextPage = currentPage + 1;
    await loadMessages(nextPage, true);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;

    // Load more messages when scrolled to the top
    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  // WebSocket integration - only connect when conversation is selected
  const { isConnected, sendTypingIndicator } = useSimpleConversationWebSocket({
    conversationId: selectedConversation?.id || null,
    isConversationOpen: true, // This conversation is currently open
    onMessage: (message) => {
      // Add new message to the list, but check for duplicates
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some((msg) => msg.id === message.id);
        if (messageExists) {
          return prev;
        }

        // Play receive sound for messages from other users (not admin)
        if (
          message.sender &&
          typeof message.sender === "object" &&
          "user_type" in message.sender &&
          (message.sender as any).user_type !== "admin"
        ) {
          playSound("receive");
        }
        // Note: We don't play sound for admin's own messages here since
        // the send sound is already played in handleSendMessage

        return [...prev, message as unknown as Message];
      });
    },
    onStatusUpdate: () => {},
  });

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setCurrentPage(1);
      setHasMoreMessages(true);
      loadMessages(1, false);
    } else {
      setMessages([]);
      setCurrentPage(1);
      setHasMoreMessages(true);
    }
  }, [selectedConversation, loadMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX
    setIsSending(true);

    try {
      // Send message via API
      await conversationApi.adminSendMessage(selectedConversation.id, {
        message: messageText,
      });

      // Play send sound after successful send
      playSound("send");

      // Don't add to messages here - let WebSocket handle it to avoid duplicates
      // The WebSocket will receive the message and add it via onMessage callback
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      // Play error sound
      playSound("error");
      // Restore the message if sending failed
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
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

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Chat Management
          </h3>
          <p className="text-gray-500 max-w-md">
            Select a conversation from the sidebar to start viewing and managing
            chat messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {(() => {
              const user1 = selectedConversation.user_1_data;
              const user2 = selectedConversation.user_2_data;

              if (!user1 || !user2) return null;

              return (
                <>
                  {/* Show both participants */}
                  <div className="flex -space-x-2">
                    {user1.avatar ? (
                      <img
                        src={user1.avatar}
                        alt={user1.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold border-2 border-white text-xs">
                        {(user1.name || user1.phone || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    {user2.avatar ? (
                      <img
                        src={user2.avatar}
                        alt={user2.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold border-2 border-white text-xs">
                        {(user2.name || user2.phone || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user1.name || user1.phone || "User 1"} &{" "}
                      {user2.name || user2.phone || "User 2"}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {/* Only show non-admin user types to reduce redundancy */}
                      {user1.user_type !== "admin" &&
                      user2.user_type !== "admin"
                        ? `${user1.user_type} & ${user2.user_type}`
                        : user1.user_type === "admin"
                        ? user2.user_type
                        : user1.user_type}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => {
                if (selectedConversation) {
                  // For admin, we could show a dropdown to choose which participant to call
                  // For now, let's call the first participant
                  const user1 = selectedConversation.user_1_data;
                  if (user1?.phone) {
                    window.open(`tel:${user1.phone}`, "_self");
                  }
                }
              }}
            >
              <Phone size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50 min-h-0"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Loading more messages indicator */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-2">
                <Loader2 size={20} className="animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  Loading older messages...
                </span>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle
                    size={48}
                    className="mx-auto text-gray-300 mb-2"
                  />
                  <p className="text-gray-500">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender.user_type === "admin"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-xs lg:max-w-md">
                    {/* Sender info */}
                    <div
                      className={`flex items-center space-x-2 mb-1 ${
                        message.sender.user_type === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.sender.user_type !== "admin" && (
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(message.sender.name || message.sender.phone || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <span
                        className={`text-xs font-medium ${
                          message.sender.user_type === "admin"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        {message.sender.name ||
                          message.sender.phone ||
                          "Unknown User"}
                      </span>
                      {message.sender.user_type === "admin" && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(message.sender.name || message.sender.phone || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender.user_type === "admin"
                          ? "bg-blue-500 text-white"
                          : "bg-white shadow-sm border border-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>

                    {/* Timestamp */}
                    <p
                      className={`text-xs text-gray-500 mt-1 ${
                        message.sender.user_type === "admin"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {displayChatDateTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSending ? (
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

export default ChatMainArea;
