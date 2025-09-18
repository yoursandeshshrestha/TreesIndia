"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeChatModal } from "@/store/slices/chatModalSlice";
import { createConversation } from "@/lib/simpleConversationApi";
import {
  ConversationsList,
  ConversationsListRef,
} from "@/core/SimpleConversationChat/ConversationsList";
import { SimpleConversationChat } from "@/core/SimpleConversationChat/SimpleConversationChat";
import { SimpleConversation } from "@/lib/simpleConversationApi";
import { conversationStore } from "@/utils/conversationStore";

export default function ChatModal() {
  const dispatch = useAppDispatch();
  const { isOpen, preselectedConversationId, createConversationWithUser } =
    useAppSelector((state) => state.chatModal);
  const [selectedConversation, setSelectedConversation] =
    useState<SimpleConversation | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const conversationsListRef = useRef<ConversationsListRef>(null);
  const hasCreatedConversationRef = useRef(false);

  // Note: WebSocket connection is now handled globally in GlobalWebSocketProvider

  // Handle conversation creation when modal opens with a user
  useEffect(() => {
    if (
      isOpen &&
      createConversationWithUser &&
      !isCreatingConversation &&
      !hasCreatedConversationRef.current
    ) {
      const createConversationWithUserAsync = async () => {
        setIsCreatingConversation(true);
        hasCreatedConversationRef.current = true;
        try {
          const newConversation = await createConversation(
            createConversationWithUser
          );
          setSelectedConversation(newConversation);

          // Refresh conversations list to include the new conversation
          if (conversationsListRef.current?.refetchConversations) {
            conversationsListRef.current.refetchConversations();
          }
        } catch (error) {
          console.error("Failed to create conversation:", error);
          // Don't reset hasCreatedConversationRef on error to prevent infinite retries
          // The modal will close and reset when user closes it
        } finally {
          setIsCreatingConversation(false);
        }
      };

      createConversationWithUserAsync();
    }
  }, [
    isOpen,
    createConversationWithUser?.user_1,
    createConversationWithUser?.user_2,
  ]);

  // Handle preselected conversation
  useEffect(() => {
    if (isOpen && preselectedConversationId && !selectedConversation) {
      // The conversation will be selected by the ConversationsList component
      // when it loads and finds the preselected conversation
    }
  }, [isOpen, preselectedConversationId, selectedConversation]);

  // Fetch fresh data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Refresh conversations list
      if (conversationsListRef.current?.refetchConversations) {
        conversationsListRef.current.refetchConversations();
      }

      // Refresh total unread count
      const refreshTotalUnreadCount = async () => {
        try {
          const response = await getTotalUnreadCount();
          conversationStore.setCurrentUnreadCount(response.total_unread_count);
        } catch (error) {
          console.error("Failed to refresh total unread count:", error);
        }
      };

      refreshTotalUnreadCount();

      // Emit refresh event to notify other components
      conversationStore.emitRefresh();
    }
  }, [isOpen]);

  const handleClose = () => {
    // Clear the open conversation when modal is closed
    conversationStore.setOpenConversation(null);
    dispatch(closeChatModal());
    setSelectedConversation(null);
    hasCreatedConversationRef.current = false; // Reset for next time
  };

  const handleConversationSelect = useCallback(
    (conversation: SimpleConversation) => {
      setSelectedConversation(conversation);
    },
    []
  );

  const handleCloseChat = () => {
    // Clear the open conversation when chat is closed
    conversationStore.setOpenConversation(null);
    setSelectedConversation(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99] p-4 "
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className="relative"
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring", damping: 20 }}
              onClick={handleClose}
              className="absolute -top-14 -right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-[100] cursor-pointer shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-black" />
            </motion.button>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="w-full min-w-6xl max-w-6xl h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden flex"
            >
              {/* Conversations Sidebar */}
              <div className="w-1/3 min-w-[350px] bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Messages
                  </h2>
                  <p className="text-sm text-gray-600">
                    Chat with workers and admins
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ConversationsList
                    ref={conversationsListRef}
                    onConversationSelect={handleConversationSelect}
                    selectedConversationId={
                      selectedConversation?.id || preselectedConversationId
                    }
                  />
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <SimpleConversationChat
                    conversationId={selectedConversation.id}
                    onClose={handleCloseChat}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <MessageCircle
                        size={64}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Welcome to Conversations
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        Select a conversation from the sidebar to start chatting
                        with workers or admins.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
