import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Simple Conversation Types
export interface SimpleConversation {
  id: number;
  user_id: number;
  worker_id: number | null;
  admin_id: number | null;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  // Last message fields
  last_message_id?: number;
  last_message_text?: string;
  last_message_created_at?: string;
  last_message_sender_id?: number;
  user: {
    ID: number;
    name: string;
    user_type: string;
    avatar?: string;
    phone?: string;
  };
  worker?: {
    ID: number;
    name: string;
    user_type: string;
    avatar?: string;
    phone?: string;
  };
  admin?: {
    ID: number;
    name: string;
    user_type: string;
    avatar?: string;
    phone?: string;
  };
  unread_count?: number;
  last_message?: SimpleConversationMessage;
}

export interface SimpleConversationMessage {
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

// API Response Types
export interface SimpleConversationsResponse {
  conversations: SimpleConversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SimpleConversationResponse {
  conversation: SimpleConversation;
}

export interface SimpleMessagesResponse {
  messages: SimpleConversationMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SimpleMessageResponse {
  message: SimpleConversationMessage;
}

export interface CreateConversationRequest {
  user_id: number;
  worker_id?: number;
  admin_id?: number;
}

export interface SendMessageRequest {
  message: string;
}

// API Functions

// Get user's conversations
export async function fetchUserConversations(params?: {
  page?: number;
  limit?: number;
}): Promise<SimpleConversationsResponse> {
  try {
    const searchParams = new URLSearchParams();
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const url = `${API_BASE_URL}/conversations?${searchParams.toString()}`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

// Get conversation by ID
export async function fetchConversation(
  conversationId: number
): Promise<SimpleConversation> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/conversations/${conversationId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
}

// Get messages for a conversation
export async function fetchConversationMessages(
  conversationId: number,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<SimpleMessagesResponse> {
  try {
    const searchParams = new URLSearchParams();
    const page = params?.page || 1;
    const limit = params?.limit || 50;

    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const url = `${API_BASE_URL}/conversations/${conversationId}/messages?${searchParams.toString()}`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
}

// Create a new conversation
export async function createConversation(
  data: CreateConversationRequest
): Promise<SimpleConversation> {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data.conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

// Send a message
export async function sendConversationMessage(
  conversationId: number,
  messageData: SendMessageRequest
): Promise<SimpleConversationMessage> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(messageData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.message;
  } catch (error) {
    console.error("Error sending conversation message:", error);
    throw error;
  }
}

// Mark message as read
export async function markConversationMessageRead(
  conversationId: number,
  messageId: number
): Promise<void> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/conversations/messages/${messageId}/read`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
}

// Get unread count for a conversation
export async function getConversationUnreadCount(
  conversationId: number
): Promise<{ unread_count: number }> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/conversations/${conversationId}/unread-count`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
}

// Get total unread count for user
export async function getTotalUnreadCount(): Promise<{
  total_unread_count: number;
}> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/conversations/unread-count/total`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching total unread count:", error);
    throw error;
  }
}

// Mark conversation as read
export async function markConversationAsRead(
  conversationId: number
): Promise<void> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/conversations/${conversationId}/mark-read`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
}
