"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, Phone, Loader2, Image as ImageIcon, Video, X } from "lucide-react";
import {
  Conversation,
  Message,
  conversationApi,
} from "../services/conversationApi";
import { toast } from "sonner";
import { useSimpleConversationWebSocket } from "@/hooks/useSimpleConversationWebSocket";
import { displayChatDateTime } from "@/utils/displayUtils";
import { playSound, initializeAudio } from "@/utils/soundUtils";
import { getCurrentUser } from "@/utils/authUtils";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      // Add or update message in the list
      setMessages((prev) => {
        const messageData = message as unknown as Message;
        
        // Debug logging for attachment fields
        if (messageData.attachment_type || messageData.image_url || messageData.video_url) {
          console.log("Received message with attachment:", {
            id: messageData.id,
            attachment_type: messageData.attachment_type,
            image_url: messageData.image_url,
            video_url: messageData.video_url,
          });
        }
        
        // Check if message already exists
        const existingIndex = prev.findIndex((msg) => msg.id === messageData.id);
        
        if (existingIndex !== -1) {
          // Update existing message (merge to preserve any fields that might be missing in WebSocket message)
          const updated = [...prev];
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
          return updated;
        }

        // Play receive sound for messages from other users (not admin)
        if (
          messageData.sender &&
          typeof messageData.sender === "object" &&
          "user_type" in messageData.sender &&
          (messageData.sender as { user_type: string }).user_type !== "admin"
        ) {
          playSound("receive");
        }
        // Note: Sound effects removed as requested

        return [...prev, messageData];
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
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation || isSending) return;

    const messageText = newMessage.trim();
    const fileToSend = selectedFile;
    const previewUrl = filePreview; // Save preview before clearing
    
    // Clear inputs immediately for better UX
    setNewMessage("");
    setSelectedFile(null);
    setFilePreview(null);
    setIsSending(true);

    // Get current admin user for optimistic update
    const currentUser = getCurrentUser() as {
      id?: number;
      ID?: number;
      user_id?: number;
      name?: string;
      phone?: string;
      user_type?: string;
      avatar?: string;
    } | null;

    // Create optimistic message for immediate UI update
    const tempMessageId = Date.now(); // Temporary ID until we get the real one
    const isImage = fileToSend?.type.startsWith("image/");
    const isVideo = fileToSend?.type.startsWith("video/");
    
    const optimisticMessage: Message = {
      id: tempMessageId,
      conversation_id: selectedConversation.id,
      sender_id: currentUser?.id || currentUser?.ID || currentUser?.user_id || 0,
      message: messageText || "",
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachment_type: isImage ? "image" : isVideo ? "video" : undefined,
      image_url: isImage && previewUrl ? previewUrl : undefined,
      video_url: isVideo && previewUrl ? previewUrl : undefined,
      sender: {
        ID: currentUser?.id || currentUser?.ID || currentUser?.user_id || 0,
        name: currentUser?.name || "Admin",
        user_type: currentUser?.user_type || "admin",
        avatar: currentUser?.avatar,
        phone: currentUser?.phone,
      },
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      // Send message via API (with file if present)
      let sentMessage: Message | null = null;
      try {
        sentMessage = await conversationApi.adminSendMessage(selectedConversation.id, {
          message: messageText || undefined,
          file: fileToSend || undefined,
        });
      } catch (uploadError) {
        // Handle special case where upload timed out but may have succeeded
        if (
          uploadError instanceof Error &&
          uploadError.message === "UPLOAD_TIMEOUT_BUT_SUCCESS"
        ) {
          console.log("Upload request timed out but file may have been uploaded. Relying on WebSocket for message update.");
          // Keep the optimistic message - WebSocket will update it when it arrives
          sendTypingIndicator(false);
          return;
        }
        // Re-throw other errors
        throw uploadError;
      }

      // Sound effects removed as requested

      // Replace optimistic message with real message from server
      setMessages((prev) => {
        // Find optimistic message to preserve preview URL if needed
        const optimisticMsg = prev.find((msg) => msg.id === tempMessageId);
        const optimisticImageUrl = optimisticMsg?.image_url;
        const optimisticVideoUrl = optimisticMsg?.video_url;
        
        // Remove the optimistic message
        const filtered = prev.filter((msg) => msg.id !== tempMessageId);
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
          return updated;
        } else {
          // Add the real message if WebSocket hasn't already added it
          // Use real URL if available, otherwise keep preview URL as fallback
          const messageToAdd: Message = {
            ...sentMessage,
            image_url: sentMessage.image_url || optimisticImageUrl,
            video_url: sentMessage.video_url || optimisticVideoUrl,
          };
          return [...filtered, messageToAdd];
        }
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      // Sound effects removed as requested
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
      // Restore the message if sending failed
      setNewMessage(messageText);
      setSelectedFile(fileToSend);
      if (fileToSend) {
        setFilePreview(URL.createObjectURL(fileToSend));
      }
    } finally {
      setIsSending(false);
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
      toast.error("Only images (max 5MB) and videos (max 50MB) are allowed");
      return;
    }

    // Validate file size
    if (isImage && file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    if (isVideo && file.size > 50 * 1024 * 1024) {
      toast.error("Video size must be less than 50MB");
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
                        <p className={`text-sm ${message.sender.user_type === "admin" ? "text-white" : "text-gray-900"}`}>
                          {message.message}
                        </p>
                      )}
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
            disabled={isSending}
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
              disabled={isSending}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || isSending}
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
