import { api } from "@/lib/api-client";

// Types
export interface Conversation {
  id: number;
  user_1: number;
  user_2: number;
  is_active: boolean;
  last_message_at: string | null;
  last_message_text?: string | null;
  last_message_created_at?: string | null;
  last_message_sender_id?: number | null;
  unread_count?: number;
  created_at: string;
  updated_at: string;
  user_1_data: {
    ID: number;
    name: string;
    user_type: string;
    avatar?: string;
    phone?: string;
  };
  user_2_data: {
    ID: number;
    name: string;
    user_type: string;
    avatar?: string;
    phone?: string;
  };
  last_message?: Message;
}

// Keep ConversationParticipant for backward compatibility if needed
export interface ConversationParticipant {
  id: number;
  conversation_id: number;
  user_id: number;
  user_type: "user" | "worker" | "broker" | "admin";
  joined_at: string;
  last_read_at?: string;
  is_active: boolean;
  user: {
    ID: number;
    name: string;
    email?: string;
    phone: string;
    avatar?: string;
  };
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender: {
    ID: number;
    name: string;
    user_type: string;
    avatar?: string;
    phone?: string;
  };
}

// Note: Conversation creation is handled locally, no request interface needed

export interface SendMessageRequest {
  message: string;
}

export interface CreateConversationRequest {
  user_1: number;
  user_2: number;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// API Functions
export const conversationApi = {
  // Create a new conversation
  createConversation: async (
    data: CreateConversationRequest
  ): Promise<{ conversation: Conversation }> => {
    try {
      const response = await api.post(
        `/conversations`,
        data as unknown as Record<string, unknown>
      );
      // The backend returns { success: true, message: "...", data: { conversation: ... } }
      const responseData = (
        response as unknown as { data: { conversation: Conversation } }
      ).data;

      if (!responseData || !responseData.conversation) {
        throw new Error(
          "Invalid response structure: missing conversation data"
        );
      }

      return { conversation: responseData.conversation };
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  },

  // Get admin's conversations (where admin is a participant)
  getAllConversations: async (
    page: number = 1,
    limit: number = 20
  ): Promise<ConversationsResponse> => {
    try {
      const response = await api.get(
        `/admin/conversations?page=${page}&limit=${limit}`
      );
      return (
        (response as unknown as { data: ConversationsResponse })?.data || {
          conversations: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
        }
      );
    } catch (error) {
      console.error("Error fetching admin conversations:", error);
      throw error;
    }
  },

  // Get all conversations for oversight (all conversations in the system)
  getAllConversationsForOversight: async (
    page: number = 1,
    limit: number = 20
  ): Promise<ConversationsResponse> => {
    try {
      const response = await api.get(
        `/admin/conversations/oversight?page=${page}&limit=${limit}`
      );
      return (
        (response as unknown as { data: ConversationsResponse })?.data || {
          conversations: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
        }
      );
    } catch (error) {
      console.error("Error fetching conversations for oversight:", error);
      throw error;
    }
  },

  // Get user conversations
  getUserConversations: async (
    page: number = 1,
    limit: number = 20
  ): Promise<ConversationsResponse> => {
    const response = await api.get(
      `/conversations?page=${page}&limit=${limit}`
    );
    return (
      (response as unknown as { data: ConversationsResponse })?.data || {
        conversations: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        },
      }
    );
  },

  // Get conversation by ID
  getConversation: async (conversationId: number): Promise<Conversation> => {
    const response = await api.get(`/conversations/${conversationId}`);
    return (response as unknown as { data: { conversation: Conversation } })
      ?.data.conversation;
  },

  // Get messages for a conversation
  getMessages: async (
    conversationId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: Message[]; pagination: unknown }> => {
    const response = await api.get(
      `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return (
      (
        response as unknown as {
          data: {
            messages: Message[];
            pagination: unknown;
          };
        }
      )?.data || {
        messages: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        },
      }
    );
  },

  // Send a message
  sendMessage: async (
    conversationId: number,
    data: SendMessageRequest
  ): Promise<Message> => {
    const response = await api.post(
      `/conversations/${conversationId}/messages`,
      data as unknown as Record<string, unknown>
    );
    return (response as unknown as { data: { message: Message } }).data.message;
  },

  // Admin send message
  adminSendMessage: async (
    conversationId: number,
    data: SendMessageRequest
  ): Promise<Message> => {
    const response = await api.post(
      `/admin/conversations/${conversationId}/messages`,
      data as unknown as Record<string, unknown>
    );
    return (response as unknown as { data: { message: Message } }).data.message;
  },

  // Mark message as read
  markMessageRead: async (messageId: number): Promise<void> => {
    await api.put(`/conversations/messages/${messageId}/read`);
  },

  // Mark all messages in conversation as read
  markConversationAsRead: async (conversationId: number): Promise<void> => {
    await api.put(`/conversations/${conversationId}/mark-read`);
  },

  // Get unread count for a conversation
  getUnreadCount: async (
    conversationId: number
  ): Promise<{ unread_count: number }> => {
    const response = await api.get(
      `/conversations/${conversationId}/unread-count`
    );
    return (
      (response as unknown as { data: { unread_count: number } })?.data || {
        unread_count: 0,
      }
    );
  },

  // Close conversation (admin only)
  closeConversation: async (
    conversationId: number,
    reason: string
  ): Promise<void> => {
    await api.post(`/admin/conversations/${conversationId}/close`, { reason });
  },

  // Get admin total unread count
  getAdminTotalUnreadCount: async (): Promise<{
    total_unread_count: number;
  }> => {
    const response = await api.get("/admin/conversations/unread-count/total");
    return (
      (response as unknown as { data: { total_unread_count: number } })
        ?.data || {
        total_unread_count: 0,
      }
    );
  },
};
