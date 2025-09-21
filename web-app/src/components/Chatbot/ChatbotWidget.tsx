"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Loader2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  needsMoreInfo?: boolean;
  nextStep?: string;
}

interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize chatbot session
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeSession();
    }
  }, [isOpen, sessionId]);

  const initializeSession = async () => {
    try {
      const response = await fetch("/api/v1/chatbot/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: "Siliguri", // You can get this from user's location or profile
          context: {},
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.data.session_id);

        // Add welcome message
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content:
              "Hello! I'm your TreesIndia assistant. I can help you find properties, book services, or answer any questions about our platform. How can I assist you today?",
            timestamp: new Date(),
            suggestions: [
              "Find rental properties",
              "Book home services",
              "View ongoing projects",
              "Get help with booking",
              "Contact support",
            ],
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to initialize chatbot session:", error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !sessionId || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/v1/chatbot/session/${sessionId}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            context: {},
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const botMessage: ChatMessage = {
          id: data.data.id.toString(),
          role: "assistant",
          content: data.data.content,
          timestamp: new Date(data.data.created_at),
          suggestions: data.data.suggestions || [],
          needsMoreInfo: data.data.needs_more_info,
          nextStep: data.data.next_step,
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
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

  const quickActions = [
    {
      icon: "🏠",
      text: "Find Properties",
      action: "Find rental properties in Siliguri",
    },
    { icon: "🔧", text: "Book Services", action: "Book home cleaning service" },
    {
      icon: "🏗️",
      text: "View Projects",
      action: "Show ongoing construction projects",
    },
    { icon: "💰", text: "Get Credit", action: "How to get property loans" },
    { icon: "📞", text: "Contact Support", action: "Contact customer support" },
    { icon: "❓", text: "Other", action: "Help with other queries" },
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggle}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          aria-label="Open chatbot"
        >
          <MessageCircle size={24} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isMinimized ? "h-16" : "h-[600px]"
      } w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">T</span>
          </div>
          <div>
            <h3 className="font-semibold">TreesIndia Assistant</h3>
            <p className="text-xs text-green-100">AI-powered help</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🤖</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Hi, welcome to TreesIndia!
                </h4>
                <p className="text-gray-600 text-sm mb-6">
                  I&apos;m your AI assistant. How can I help you today?
                </p>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(action.action)}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors"
                    >
                      <div className="text-lg mb-1">{action.icon}</div>
                      <div className="text-xs font-medium text-gray-800">
                        {action.text}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-800"
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
                            className="block w-full text-left text-xs p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Next Step */}
                    {message.nextStep && (
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        💡 {message.nextStep}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-center space-x-2"
            >
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Menu"
              >
                <div className="w-4 h-4 flex flex-col justify-center">
                  <div className="w-3 h-0.5 bg-current mb-1"></div>
                  <div className="w-3 h-0.5 bg-current mb-1"></div>
                  <div className="w-3 h-0.5 bg-current"></div>
                </div>
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question here..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-2">
              All responses are generated by AI
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotWidget;
