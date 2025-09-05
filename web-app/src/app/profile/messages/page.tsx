"use client";

import { ChatList } from "@/core/BookingPage/components/chat/ChatList";
import { ChatRoom } from "@/core/BookingPage/components/chat/ChatRoom";
import { useState } from "react";

export default function ProfileMessagesPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(
    undefined
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Messages</h2>
          <p className="text-gray-600 mt-1">
            View and manage your conversations
          </p>
        </div>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversation List */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="h-full overflow-y-auto">
            <ChatList
              onRoomSelect={(roomId) => setSelectedRoomId(roomId)}
              selectedRoomId={selectedRoomId}
            />
          </div>
        </div>

        {/* Chat Room */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
          {selectedRoomId ? (
            <ChatRoom roomId={selectedRoomId} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
