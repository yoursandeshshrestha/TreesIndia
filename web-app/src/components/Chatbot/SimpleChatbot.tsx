"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { useChatbot } from "@/hooks/useChatbot";
import { chatbotService, ChatMessage } from "@/services/chatbotService";
import { playSound } from "@/utils/soundUtils";

const SimpleChatbot: React.FC = () => {
  const { isOpen, toggleChatbot } = useChatbot();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize session when chat opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeSession();
    }
  }, [isOpen, sessionId]);

  const initializeSession = async () => {
    try {
      const response = await chatbotService.createSession({
        location: "Siliguri",
        context: {},
      });

      setSessionId(response.data.session_id);
      setMessages([
        {
          id: "welcome",
          session_id: response.data.session_id,
          role: "assistant",
          content:
            "Hello! I'm your TreesIndia assistant. I can help you find properties, book services, or answer any questions about our platform. How can I assist you today?",
          message_type: "text",
          created_at: new Date().toISOString(),
          suggestions: [
            "Find rental properties",
            "Book home services",
            "View ongoing projects",
            "Get help with booking",
            "Contact support",
          ],
        },
      ]);
    } catch (error) {
      console.error("Failed to initialize chatbot:", error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !sessionId || isLoading) return;

    const now = Date.now();
    const timestamp = new Date(now).toISOString();

    const userMessage: ChatMessage = {
      id: `user-${now}`,
      session_id: sessionId,
      role: "user",
      content: message,
      message_type: "text",
      created_at: timestamp,
    };

    // Add user message immediately and clear input
    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      console.log("Added user message:", userMessage);
      console.log("Current messages after user:", newMessages);
      return newMessages;
    });
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        session_id: sessionId,
        message: message,
        context: {},
      });

      // Play send sound after successful send
      playSound("send");

      // Create assistant message with timestamp after user message
      const assistantTimestamp = new Date(now + 1).toISOString(); // Ensure it's after user message
      const assistantMessage: ChatMessage = {
        ...response.data,
        id: `assistant-${now + 1}`,
        created_at: assistantTimestamp,
      };

      // Add assistant response in a single state update
      setMessages((prev) => {
        const newMessages = [...prev, assistantMessage];
        console.log("Added assistant message:", assistantMessage);
        console.log("Current messages after assistant:", newMessages);
        return newMessages;
      });

      // Play receive sound
      playSound("receive");
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorTimestamp = new Date(now + 1).toISOString();
      const errorMessage: ChatMessage = {
        id: `error-${now + 1}`,
        session_id: sessionId,
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        message_type: "text",
        created_at: errorTimestamp,
        suggestions: ["Try again", "Contact support"],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChatbot}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-xl transition-colors hover:scale-105 flex items-center space-x-2"
          aria-label="Open chatbot"
        >
          <MessageCircle size={20} />
          <span className="text-sm font-medium">Chat with AI</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 h-[600px] w-[400px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image
              src="/logo/logo.svg"
              alt="TreesIndia"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </div>
          <div>
            <h3 className="font-semibold text-base text-gray-900">
              TreesIndia Assistant
            </h3>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
        <button
          onClick={toggleChatbot}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {messages
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )
          .map((message, index) => (
            <div
              key={`${message.id}-${message.created_at}-${index}`}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-50 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-sm p-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl transition-colors cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Next Step */}
                {message.next_step && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    💡 {message.next_step}
                  </div>
                )}
              </div>
            </div>
          ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 text-gray-900 p-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4 bg-white flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2.5 rounded-full transition-colors"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SimpleChatbot;
