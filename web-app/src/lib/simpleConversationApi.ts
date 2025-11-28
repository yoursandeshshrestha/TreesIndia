import { authenticatedFetch } from "./auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Simple Conversation Types
export interface SimpleConversation {
  id: number;
  user_1: number;
  user_2: number;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  // Last message fields
  last_message_id?: number;
  last_message_text?: string;
  last_message_created_at?: string;
  last_message_sender_id?: number;
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
  attachment_type?: "image" | "video";
  image_url?: string;
  video_url?: string;
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
  user_1: number;
  user_2: number;
}

export interface SendMessageRequest {
  message?: string;
  file?: File;
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

// Send a message (supports file uploads)
export async function sendConversationMessage(
  conversationId: number,
  messageData: SendMessageRequest
): Promise<SimpleConversationMessage> {
  try {
    // If file is present, use FormData for multipart upload
    if (messageData.file) {
      const formData = new FormData();
      if (messageData.message) {
        formData.append("message", messageData.message);
      }
      formData.append("file", messageData.file);

      const response = await authenticatedFetch(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: formData,
          // Don't set Content-Type header - authenticatedFetch will handle FormData correctly
        }
      );

      // Check if response is ok
      if (!response.ok) {
        let errorText = "";
        try {
          errorText = await response.text();
        } catch {
          errorText = response.statusText || "Unknown error";
        }
        console.error("File upload failed:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Try to parse JSON response
      let data;
      try {
        const responseText = await response.text();
        if (!responseText || responseText.trim() === "") {
          console.warn("Empty response from server, but status is 200 OK. Message was likely sent successfully.");
          // If response is empty but status is OK, message was likely sent successfully
          // Throw a special error that the component can handle gracefully
          throw new Error("EMPTY_RESPONSE_BUT_SUCCESS");
        }
        data = JSON.parse(responseText);
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message === "EMPTY_RESPONSE_BUT_SUCCESS") {
          throw parseError; // Re-throw our special error
        }
        console.error("Failed to parse response:", parseError);
        // If we can't parse but got 200 OK, the message might have been sent
        // Throw a special error that the component can handle gracefully
        throw new Error("PARSE_ERROR_BUT_SUCCESS");
      }
      
      // Handle response structure: { success: true, message: "...", data: { message: {...} } }
      if (!data || typeof data !== "object") {
        console.error("Invalid response format:", data);
        // If status is OK, message was likely sent
        throw new Error("INVALID_FORMAT_BUT_SUCCESS");
      }
      
      if (data.success === false) {
        throw new Error(data.error || data.message || "Failed to send message");
      }
      
      // Check if we have the message in the expected structure
      if (data.data && data.data.message) {
        return data.data.message;
      }
      
      // Some responses might have message directly in data
      if (data.message && typeof data.message === "object" && data.message.id) {
        return data.message;
      }
      
      // If we have success but no message, log and throw special error (WebSocket will handle it)
      if (data.success) {
        console.warn("Response indicates success but no message data found. Will rely on WebSocket.");
        throw new Error("SUCCESS_BUT_NO_MESSAGE");
      }
      
      console.error("Unexpected response structure:", data);
      throw new Error("Invalid response structure: missing message data");
    } else {
      // Regular JSON request for text-only messages
      const response = await authenticatedFetch(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: messageData.message }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Message send failed:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      // Handle response structure: { success: true, message: "...", data: { message: {...} } }
      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to send message");
      }
      
      if (!data.data || !data.data.message) {
        console.error("Unexpected response structure:", data);
        throw new Error("Invalid response structure: missing message data");
      }
      
      return data.data.message;
    }
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
