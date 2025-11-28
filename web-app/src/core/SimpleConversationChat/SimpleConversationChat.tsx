"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MessageCircle, Send, Loader2, User, Image as ImageIcon, Video, X } from "lucide-react";
import { useSimpleConversation } from "@/hooks/useSimpleConversations";
import { useSimpleConversationWebSocket } from "@/hooks/useSimpleConversationWebSocket";
import {
  SimpleConversationMessage,
  SimpleMessagesResponse,
  sendConversationMessage,
} from "@/lib/simpleConversationApi";
import { displayChatDateTime } from "@/utils/displayUtils";
import { useQueryClient } from "@tanstack/react-query";
import { simpleConversationKeys } from "@/hooks/useSimpleConversations";
// Sound effects removed as requested

interface SimpleConversationChatProps {
  conversationId: number;
  onClose?: () => void;
}

export const SimpleConversationChat: React.FC<SimpleConversationChatProps> = ({
  conversationId,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsReadRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  // Get conversation data and messages
  const {
    conversation,
    messages,
    isLoadingMessages,
    isSendingMessage,
    markMessageRead,
    markConversationRead,
    currentUser,
  } = useSimpleConversation(conversationId);

  // WebSocket integration
  const { isConnected, sendTypingIndicator } = useSimpleConversationWebSocket({
    conversationId,
    isConversationOpen: true, // This conversation is currently open
    onMessage: (message: Record<string, unknown>) => {
      // Update the cache directly to avoid refetch and maintain instant updates
      queryClient.setQueryData(
        simpleConversationKeys.messages(conversationId),
        (oldData: SimpleMessagesResponse | undefined) => {
          if (!oldData) return oldData;

          const messageData = message as unknown as SimpleConversationMessage;
          // Check if message already exists
          const existingIndex = oldData.messages?.findIndex(
            (msg: SimpleConversationMessage) => msg.id === messageData.id
          );

          if (existingIndex !== undefined && existingIndex !== -1) {
            // Update existing message (merge to preserve any fields that might be missing in WebSocket message)
            const updated = [...(oldData.messages || [])];
            const existing = updated[existingIndex];
            updated[existingIndex] = {
              ...existing,
              ...messageData,
              // Prefer new URL if provided, otherwise keep existing (preserves image/video URLs)
              image_url: messageData.image_url || existing.image_url,
              video_url: messageData.video_url || existing.video_url,
              attachment_type: messageData.attachment_type || existing.attachment_type,
              // Preserve message text if WebSocket message doesn't have it
              message: messageData.message || existing.message,
            };

            return {
              ...oldData,
              messages: updated,
            };
          }

          // Backend returns messages in DESC order (latest first)
          // Add new message at the beginning of the array
          const updatedMessages = [
            messageData,
            ...(oldData.messages || []),
          ];

          return {
            ...oldData,
            messages: updatedMessages,
          };
        }
      );

      // Mark message as read if it's not from current user and not already read
      if (message.sender_id !== currentUser?.id && !message.is_read) {
        markMessageRead(message.id as number);

        // Sound effects removed as requested
      }
    },
    onTyping: (userId: number, isTyping: boolean) => {
      // Handle typing indicators
      if (userId !== currentUser?.id) {
        setIsTyping(isTyping);
      }
    },
  });

  // Note: We don't need to listen to global conversation store updates here
  // because the WebSocket onMessage handler already handles all message updates
  // and sound playing. This prevents duplicate sounds and duplicate message processing.

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
    if ((!newMessage.trim() && !selectedFile) || isSendingMessage) return;

    const messageText = newMessage.trim();
    const fileToSend = selectedFile;
    const previewUrl = filePreview; // Save preview before clearing

    // Clear inputs immediately for better UX
    setNewMessage("");
    setSelectedFile(null);
    setFilePreview(null);

    // Get current user for optimistic update
    const currentUserId = currentUser?.id;

    // Create optimistic message for immediate UI update
    const tempMessageId = Date.now(); // Temporary ID until we get the real one
    const isImage = fileToSend?.type.startsWith("image/");
    const isVideo = fileToSend?.type.startsWith("video/");

    const optimisticMessage: SimpleConversationMessage = {
      id: tempMessageId,
      conversation_id: conversationId,
      sender_id: currentUserId || 0,
      message: messageText || "",
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachment_type: isImage ? "image" : isVideo ? "video" : undefined,
      image_url: isImage && previewUrl ? previewUrl : undefined,
      video_url: isVideo && previewUrl ? previewUrl : undefined,
      sender: {
        ID: currentUserId || 0,
        name: currentUser?.name || "You",
        user_type: currentUser?.user_type || "normal",
        phone: currentUser?.phone,
      },
    };

    // Add optimistic message immediately to cache
    queryClient.setQueryData(
      simpleConversationKeys.messages(conversationId),
      (oldData: SimpleMessagesResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: [optimisticMessage, ...(oldData.messages || [])],
        };
      }
    );

    try {
      // Send message via API (with file if present)
      let sentMessage: SimpleConversationMessage | null = null;
      try {
        sentMessage = await sendConversationMessage(conversationId, {
          message: messageText || undefined,
          file: fileToSend || undefined,
        });
      } catch (apiError) {
        // Handle special cases where request was successful but response couldn't be parsed
        if (
          apiError instanceof Error &&
          (apiError.message === "EMPTY_RESPONSE_BUT_SUCCESS" ||
            apiError.message === "PARSE_ERROR_BUT_SUCCESS" ||
            apiError.message === "INVALID_FORMAT_BUT_SUCCESS" ||
            apiError.message === "SUCCESS_BUT_NO_MESSAGE")
        ) {
          console.log("Request was successful but response couldn't be parsed. Relying on WebSocket for message update.");
          // Keep the optimistic message - WebSocket will update it when it arrives
          // Sound effects removed as requested
          sendTypingIndicator(false);
          return;
        }
        // Re-throw other errors
        throw apiError;
      }

      // Sound effects removed as requested

      // Replace optimistic message with real message from server
      queryClient.setQueryData(
        simpleConversationKeys.messages(conversationId),
        (oldData: SimpleMessagesResponse | undefined) => {
          if (!oldData) return oldData;

          // Find optimistic message to preserve preview URL if needed
          const optimisticMsg = oldData.messages?.find((msg) => msg.id === tempMessageId);
          const optimisticImageUrl = optimisticMsg?.image_url;
          const optimisticVideoUrl = optimisticMsg?.video_url;

          // Remove the optimistic message
          const filtered = oldData.messages?.filter((msg) => msg.id !== tempMessageId) || [];
          // Check if message already exists (from WebSocket)
          const existingIndex = filtered.findIndex((msg) => msg.id === sentMessage.id);

          if (existingIndex !== -1) {
            // Update existing message with complete data from API
            // Use real URL if available, otherwise keep preview URL as fallback
            const updated = [...filtered];
            updated[existingIndex] = {
              ...sentMessage,
              image_url: sentMessage.image_url || optimisticImageUrl || updated[existingIndex].image_url,
              video_url: sentMessage.video_url || optimisticVideoUrl || updated[existingIndex].video_url,
            };
            return {
              ...oldData,
              messages: updated,
            };
          } else {
            // Add the real message if WebSocket hasn't already added it
            // Use real URL if available, otherwise keep preview URL as fallback
            const messageToAdd: SimpleConversationMessage = {
              ...sentMessage,
              image_url: sentMessage.image_url || optimisticImageUrl,
              video_url: sentMessage.video_url || optimisticVideoUrl,
            };
            return {
              ...oldData,
              messages: [messageToAdd, ...filtered],
            };
          }
        }
      );

      // Stop typing indicator
      sendTypingIndicator(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      console.error("Error details:", {
        error,
        message: errorMessage,
        conversationId,
        hasFile: !!fileToSend,
        fileType: fileToSend?.type,
        fileSize: fileToSend?.size,
      });
      
      // Show user-friendly error message
      alert(`Failed to send message: ${errorMessage}`);
      
      // Remove optimistic message on error
      queryClient.setQueryData(
        simpleConversationKeys.messages(conversationId),
        (oldData: SimpleMessagesResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            messages: oldData.messages?.filter((msg) => msg.id !== tempMessageId) || [],
          };
        }
      );
      // Restore the message if sending failed
      setNewMessage(messageText);
      setSelectedFile(fileToSend);
      if (fileToSend) {
        setFilePreview(URL.createObjectURL(fileToSend));
      }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isImage = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") || fileName.endsWith(".gif") ||
      fileName.endsWith(".webp");
    const isVideo = fileName.endsWith(".mp4") || fileName.endsWith(".mov") ||
      fileName.endsWith(".avi") || fileName.endsWith(".webm");

    if (!isImage && !isVideo) {
      alert("Only images (max 5MB) and videos (max 50MB) are allowed");
      return;
    }

    // Validate file size
    if (isImage && file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }
    if (isVideo && file.size > 50 * 1024 * 1024) {
      alert("Video size must be less than 50MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get the other participant (not current user)
  const getOtherParticipant = () => {
    if (!conversation) return null;

    if (conversation.user_1_data.ID === currentUser?.id) {
      return conversation.user_2_data;
    } else {
      return conversation.user_1_data;
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
                    {/* Sender info */}
                    <div
                      className={`flex items-center space-x-2 mb-1 ${
                        message.sender_id === currentUser?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.sender_id !== currentUser?.id && (
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(
                            message.sender?.name ||
                            message.sender?.phone ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <span
                        className={`text-xs font-medium ${
                          message.sender_id === currentUser?.id
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        {message.sender_id === currentUser?.id
                          ? "You"
                          : message.sender?.name ||
                            message.sender?.phone ||
                            "Unknown User"}
                      </span>
                      {message.sender_id === currentUser?.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(currentUser?.name || currentUser?.phone || "Y")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender_id === currentUser?.id
                          ? "bg-blue-500 text-white"
                          : "bg-white shadow-sm border border-gray-200"
                      }`}
                    >
                      {/* Display attachment if present */}
                      {message.attachment_type === "image" && message.image_url && (
                        <div className="mb-2">
                          <img
                            src={message.image_url}
                            alt="Attachment"
                            className="max-w-full max-h-64 rounded-lg object-contain"
                          />
                        </div>
                      )}
                      {message.attachment_type === "video" && message.video_url && (
                        <div className="mb-2">
                          <video
                            src={message.video_url}
                            controls
                            className="max-w-full max-h-64 rounded-lg"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      {message.message && (
                        <p className={`text-sm ${message.sender_id === currentUser?.id ? "text-white" : "text-gray-900"}`}>
                          {message.message}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
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
        {/* File Preview */}
        {filePreview && selectedFile && (
          <div className="mb-3 relative inline-block">
            <div className="relative">
              {selectedFile.type.startsWith("image/") ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-w-xs max-h-32 rounded-lg object-cover"
                />
              ) : (
                <video
                  src={filePreview}
                  className="max-w-xs max-h-32 rounded-lg"
                  controls={false}
                />
              )}
              <button
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{selectedFile.name}</p>
          </div>
        )}

        <div className="flex items-center space-x-3">
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSendingMessage}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach image or video"
          >
            {selectedFile?.type.startsWith("video/") ? (
              <Video size={20} />
            ) : (
              <ImageIcon size={20} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

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
            disabled={(!newMessage.trim() && !selectedFile) || isSendingMessage}
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
