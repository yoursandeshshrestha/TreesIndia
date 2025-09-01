"use client";

import React, { useState } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { ChatRoom as ChatRoomType } from "@/lib/supabase";
import { MessageCircle, ArrowLeft } from "lucide-react";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<ChatRoomType | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  const handleSelectChat = (chatRoom: ChatRoomType) => {
    setSelectedChat(chatRoom);
    setIsMobileView(true);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setIsMobileView(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-6">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-500">
                  Chat with workers and view your conversations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex h-[calc(100vh-120px)]">
          {/* Chat List - Hidden on mobile when chat is selected */}
          <div
            className={`w-full md:w-1/3 lg:w-1/4 border-r bg-white ${
              isMobileView ? "hidden md:block" : "block"
            }`}
          >
            <div className="p-4">
              <ChatList
                onSelectChat={handleSelectChat}
                selectedChatId={selectedChat?.id}
              />
            </div>
          </div>

          {/* Chat Room - Full width on mobile, hidden when no chat selected */}
          <div
            className={`flex-1 bg-white ${
              isMobileView ? "block" : "hidden md:block"
            }`}
          >
            {selectedChat ? (
              <ChatRoom
                roomId={selectedChat.id}
                onClose={isMobileView ? handleBackToList : undefined}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a chat from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Back Button */}
        {isMobileView && selectedChat && (
          <div className="md:hidden fixed top-4 left-4 z-10">
            <button
              onClick={handleBackToList}
              className="bg-white rounded-full p-2 shadow-lg border"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
