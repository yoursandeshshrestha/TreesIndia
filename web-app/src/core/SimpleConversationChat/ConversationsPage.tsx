"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ConversationsList } from "./ConversationsList";
import { SimpleConversationChat } from "./SimpleConversationChat";
import { SimpleConversation } from "@/lib/simpleConversationApi";

export const ConversationsPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<SimpleConversation | null>(null);

  const handleConversationSelect = (conversation: SimpleConversation) => {
    setSelectedConversation(conversation);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="h-full flex bg-white">
      {/* Conversations Sidebar */}
      <div className="w-1/3 min-w-[350px] bg-white border-r border-gray-200 flex flex-col">
        <ConversationsList
          onConversationSelect={handleConversationSelect}
          selectedConversationId={selectedConversation?.id}
        />
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
              <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Conversations
              </h3>
              <p className="text-gray-500 max-w-md">
                Select a conversation from the sidebar to start chatting with
                workers, admins, or other users.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
