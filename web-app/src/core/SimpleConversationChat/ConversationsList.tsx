"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import Image from "next/image";
import { Loader2, MessageCircle } from "lucide-react";
import {
  useUserConversations,
  useMarkConversationAsRead,
} from "@/hooks/useSimpleConversations";
import { useAuth } from "@/hooks/useAuth";
import { SimpleConversation } from "@/lib/simpleConversationApi";
import { displayChatDateTime } from "@/utils/displayUtils";
import { conversationStore } from "@/utils/conversationStore";

interface ConversationsListProps {
  onConversationSelect: (conversation: SimpleConversation) => void;
  selectedConversationId?: number;
}

export interface ConversationsListRef {
  refetchConversations: () => void;
}

export const ConversationsList = forwardRef<
  ConversationsListRef,
  ConversationsListProps
>(({ onConversationSelect, selectedConversationId }, ref) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState<SimpleConversation[]>([]);
  const [currentlyOpenConversationId, setCurrentlyOpenConversationId] =
    useState<number | null>(null);
  const { user: currentUser } = useAuth();
  const hasAutoSelectedRef = useRef(false);

  // Get the mark conversation as read mutation
  const { mutate: markConversationAsRead } = useMarkConversationAsRead();

  // Get conversations
  const {
    data: conversationsData,
    isLoading,
    error,
    refetch: refetchConversations,
  } = useUserConversations({ page: 1, limit: 50 });

  // Expose refetch function to parent component
  useImperativeHandle(ref, () => ({
    refetchConversations,
  }));

  // Subscribe to open conversation changes
  useEffect(() => {
    const unsubscribeOpenConversation =
      conversationStore.subscribeToOpenConversation((conversationId) => {
        setCurrentlyOpenConversationId(conversationId);
      });
    return () => {
      unsubscribeOpenConversation();
    };
  }, []);

  // Update conversations when data changes
  useEffect(() => {
    if (conversationsData?.conversations) {
      setConversations(conversationsData.conversations);

      // Auto-select preselected conversation if it exists
      if (
        selectedConversationId &&
        !currentlyOpenConversationId &&
        !hasAutoSelectedRef.current
      ) {
        const preselectedConversation = conversationsData.conversations.find(
          (conv) => conv.id === selectedConversationId
        );
        if (preselectedConversation) {
          hasAutoSelectedRef.current = true;
          onConversationSelect(preselectedConversation);
        }
      }

      // Emit conversation list update to the global store
      // Note: Total unread count is managed by the backend via WebSocket
      // and handled in UserMenu.tsx to avoid conflicts
      conversationStore.emitConversationListUpdate(
        conversationsData.conversations
      );
    }
  }, [
    conversationsData,
    currentlyOpenConversationId,
    selectedConversationId,
    onConversationSelect,
  ]);

  // Reset auto-selection ref when selectedConversationId changes
  useEffect(() => {
    hasAutoSelectedRef.current = false;
  }, [selectedConversationId]);

  // Real-time conversation updates
  const updateConversationList = useCallback(
    (data: {
      conversation_id: number;
      message: {
        message: string;
        created_at: string;
        sender_id: number;
      };
    }) => {
      const conversationId = data.conversation_id;
      const message = data.message;

      // If this conversation is currently open, automatically mark it as read
      if (conversationStore.isConversationOpen(conversationId)) {
        markConversationAsRead(conversationId, {
          onSuccess: () => {
            conversationStore.emitReadStatusUpdate(conversationId);
          },
          onError: (error) => {
            console.error("Failed to auto-mark conversation as read:", error);
          },
        });
      }

      setConversations((prevConversations) => {
        // Find the conversation that was updated
        const conversationIndex = prevConversations.findIndex(
          (conv) => conv.id === conversationId
        );

        if (conversationIndex === -1) {
          // If conversation doesn't exist in the list, reload conversations
          refetchConversations();
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
          // If conversation is open, unread count should be 0, otherwise increment if not from current user
          unread_count: conversationStore.isConversationOpen(conversationId)
            ? 0
            : message.sender_id !== currentUser?.id
            ? (updatedConversations[conversationIndex].unread_count || 0) + 1
            : updatedConversations[conversationIndex].unread_count || 0,
        };

        // Move updated conversation to the top
        updatedConversations.splice(conversationIndex, 1);
        updatedConversations.unshift(updatedConversation);

        // Emit conversation list update to the global store
        // Note: Total unread count is managed by the backend via WebSocket
        // and handled in UserMenu.tsx to avoid conflicts
        conversationStore.emitConversationListUpdate(updatedConversations);

        return updatedConversations;
      });
    },
    [
      currentUser?.id,
      refetchConversations,
      markConversationAsRead,
    ]
  );

  // Handle read status updates
  const handleReadStatusUpdate = useCallback(
    (conversationId: number) => {
      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conv) => {
          if (conv.id === conversationId) {
            return { ...conv, unread_count: 0 };
          }
          return conv;
        });

        // Calculate and emit updated total unread count (filtering out open conversation)
        const totalUnreadCount = updatedConversations.reduce((total, conv) => {
          if (conv.id !== currentlyOpenConversationId) {
            return total + (conv.unread_count || 0);
          }
          return total;
        }, 0);

        // Use setTimeout to defer the state update to avoid render phase issues
        setTimeout(() => {
          conversationStore.emitTotalUnreadCountUpdate(totalUnreadCount);
        }, 0);

        return updatedConversations;
      });
    },
    [currentlyOpenConversationId]
  );

  // Listen to conversation updates from global store
  useEffect(() => {
    const unsubscribeConversationUpdate = conversationStore.subscribeToUpdates(
      (data) => {
        updateConversationList(data);
      }
    );

    const unsubscribeReadStatus = conversationStore.subscribeToReadStatus(
      (conversationId) => {
        handleReadStatusUpdate(conversationId);
      }
    );

    return () => {
      unsubscribeConversationUpdate();
      unsubscribeReadStatus();
    };
  }, [updateConversationList, handleReadStatusUpdate]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm) return true;

    // Get the other participant (not current user)
    let otherParticipant = null;

    if (conversation.user_1_data.ID === currentUser?.id) {
      // Current user is user_1, so other participant is user_2
      otherParticipant = conversation.user_2_data;
    } else {
      // Current user is user_2, so other participant is user_1
      otherParticipant = conversation.user_1_data;
    }

    if (!otherParticipant) return false;

    const name = otherParticipant.name || "";
    const phone = otherParticipant.phone || "";
    const searchLower = searchTerm.toLowerCase();

    return (
      name.toLowerCase().includes(searchLower) || phone.includes(searchTerm)
    );
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p>Failed to load conversations</p>
          <p className="text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium">
              {searchTerm ? "No conversations found" : "No conversations"}
            </p>
            <p className="text-sm">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start a conversation with a worker, admin, or other user"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              // Get the other participant (not current user)
              let otherParticipant = null;

              if (conversation.user_1_data.ID === currentUser?.id) {
                // Current user is user_1, so other participant is user_2
                otherParticipant = conversation.user_2_data;
              } else {
                // Current user is user_2, so other participant is user_1
                otherParticipant = conversation.user_1_data;
              }

              if (!otherParticipant) return null;

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    // Set this conversation as currently open
                    conversationStore.setOpenConversation(conversation.id);

                    // Mark conversation as read in backend if it has unread messages
                    if (
                      conversation.unread_count &&
                      conversation.unread_count > 0
                    ) {
                      markConversationAsRead(conversation.id);
                    }

                    onConversationSelect(conversation);
                  }}
                  className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedConversationId === conversation.id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      {otherParticipant.avatar ? (
                        <Image
                          src={otherParticipant.avatar}
                          alt={otherParticipant.name}
                          width={48}
                          height={48}
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
                            {conversation.last_message_created_at
                              ? displayChatDateTime(
                                  conversation.last_message_created_at
                                )
                              : displayChatDateTime(conversation.updated_at)}
                          </span>
                          {conversation.unread_count !== undefined &&
                            conversation.unread_count !== null &&
                            Number(conversation.unread_count) > 0 &&
                            currentlyOpenConversationId !== conversation.id && (
                              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {Number(conversation.unread_count)}
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
    </div>
  );
});

ConversationsList.displayName = "ConversationsList";
