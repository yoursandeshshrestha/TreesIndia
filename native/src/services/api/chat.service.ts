import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';
import {
  SimpleConversation,
  SimpleConversationMessage,
  CreateConversationRequest,
  CreateConversationResponse,
  GetConversationsResponse,
  GetConversationByIdResponse,
  GetMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
  MarkAsReadResponse,
  PaginationInfo,
} from '../../types/chat';

class ChatService {
  /**
   * Create a new conversation between two users
   * If conversation already exists, returns existing conversation
   */
  async createConversation(
    userId1: number,
    userId2: number
  ): Promise<SimpleConversation> {
    try {
      const requestBody: CreateConversationRequest = {
        user_1: userId1,
        user_2: userId2,
      };

      const response = await authenticatedFetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await handleResponse<CreateConversationResponse | SimpleConversation>(response);

      // handleResponse already unwraps data.data, so result is either:
      // 1. { conversation: SimpleConversation } (if backend returns data.conversation)
      // 2. SimpleConversation directly (if backend returns the conversation object)

      // Check if result has a 'conversation' property
      if (result && typeof result === 'object' && 'conversation' in result) {
        return result.conversation as SimpleConversation;
      }

      // Check if result is the conversation directly (has 'id' property)
      if (result && typeof result === 'object' && 'id' in result) {
        return result as SimpleConversation;
      }

      throw new Error('Invalid conversation response format');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's conversations with pagination
   */
  async getConversations(
    page: number = 1,
    limit: number = 20
  ): Promise<GetConversationsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await authenticatedFetch(
        `${API_BASE_URL}/conversations?${params.toString()}`
      );

      const rawData = await handleResponse<GetConversationsResponse | { data: SimpleConversation[] } | { conversations: SimpleConversation[]; pagination?: PaginationInfo }>(response);

      // Handle format with 'conversations' field (actual backend format)
      if ('conversations' in rawData && Array.isArray(rawData.conversations)) {
        return {
          success: true,
          data: rawData.conversations,
          pagination: 'pagination' in rawData ? rawData.pagination : {
            page,
            limit,
            total: rawData.conversations.length,
            total_pages: 1,
          },
        };
      }

      // Handle format with 'data' field
      if ('data' in rawData && Array.isArray(rawData.data)) {
        return {
          success: true,
          data: rawData.data,
          pagination: 'pagination' in rawData ? rawData.pagination : {
            page,
            limit,
            total: rawData.data.length,
            total_pages: 1,
          },
        };
      }

      // Handle array response
      if (Array.isArray(rawData)) {
        return {
          success: true,
          data: rawData,
          pagination: {
            page,
            limit,
            total: rawData.length,
            total_pages: 1,
          },
        };
      }

      // Fallback
      return {
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          total_pages: 0,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversationById(conversationId: number): Promise<SimpleConversation> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/conversations/${conversationId}`
      );

      const result = await handleResponse<GetConversationByIdResponse | SimpleConversation>(response);

      // Handle wrapped response
      if ('data' in result && result.data && 'conversation' in result.data) {
        return result.data.conversation;
      }

      // Handle direct conversation response
      return result as SimpleConversation;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<GetMessagesResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await authenticatedFetch(
        `${API_BASE_URL}/conversations/${conversationId}/messages?${params.toString()}`
      );

      const rawData = await handleResponse<GetMessagesResponse | { data: SimpleConversationMessage[] } | { messages: SimpleConversationMessage[]; pagination?: PaginationInfo }>(response);

      // Handle format with 'messages' field (actual backend format)
      if ('messages' in rawData && Array.isArray(rawData.messages)) {
        return {
          success: true,
          data: rawData.messages,
          pagination: 'pagination' in rawData ? rawData.pagination : {
            page,
            limit,
            total: rawData.messages.length,
            total_pages: 1,
          },
        };
      }

      // Handle format with 'data' field (type definition format)
      if ('data' in rawData && Array.isArray(rawData.data)) {
        return {
          success: true,
          data: rawData.data,
          pagination: 'pagination' in rawData ? rawData.pagination : {
            page,
            limit,
            total: rawData.data.length,
            total_pages: 1,
          },
        };
      }

      // Handle array response
      if (Array.isArray(rawData)) {
        return {
          success: true,
          data: rawData,
          pagination: {
            page,
            limit,
            total: rawData.length,
            total_pages: 1,
          },
        };
      }

      // Fallback
      return {
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          total_pages: 0,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: number,
    messageData: SendMessageRequest
  ): Promise<SimpleConversationMessage> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        }
      );

      const result = await handleResponse<SendMessageResponse | SimpleConversationMessage>(response);

      // Handle wrapped response with data.message
      if ('data' in result && result.data && 'message' in result.data) {
        return result.data.message;
      }

      // Handle wrapped response with just message (backend format after handleResponse)
      if ('message' in result && result.message && typeof result.message === 'object' && 'id' in result.message) {
        return result.message as SimpleConversationMessage;
      }

      // Handle direct message response
      return result as SimpleConversationMessage;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send a message with file attachment
   */
  async sendMessageWithFile(
    conversationId: number,
    messageText: string,
    fileUri: string,
    fileName: string,
    mimeType: string
  ): Promise<SimpleConversationMessage> {
    try {
      const formData = new FormData();

      // Add message text if provided
      if (messageText) {
        formData.append('message', messageText);
      }

      // Add file
      const file = {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      } as unknown as Blob;

      formData.append('file', file);

      const response = await authenticatedFetch(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await handleResponse<SendMessageResponse | SimpleConversationMessage>(response);

      // Handle wrapped response with data.message
      if ('data' in result && result.data && 'message' in result.data) {
        return result.data.message;
      }

      // Handle wrapped response with just message (backend format after handleResponse)
      if ('message' in result && result.message && typeof result.message === 'object' && 'id' in result.message) {
        return result.message as SimpleConversationMessage;
      }

      // Handle direct message response
      return result as SimpleConversationMessage;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markAsRead(conversationId: number): Promise<MarkAsReadResponse> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/conversations/${conversationId}/mark-read`,
        {
          method: 'PUT',
        }
      );

      const result = await handleResponse<MarkAsReadResponse>(response);

      return {
        success: true,
        message: result.message || 'Messages marked as read',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread count for a specific conversation
   */
  async getUnreadCount(conversationId: number): Promise<number> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/conversations/${conversationId}/unread-count`
      );

      const result = await handleResponse<{ count: number; unread_count?: number }>(response);

      return result.unread_count || result.count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get total unread count across all conversations
   */
  async getTotalUnreadCount(): Promise<number> {
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/conversations/unread-count/total`
      );

      const result = await handleResponse<{ total_unread_count?: number; total_unread?: number; total?: number }>(response);

      // Backend returns { total_unread_count: number }
      const count = result.total_unread_count || result.total_unread || result.total || 0;

      return count;
    } catch (error) {
      return 0;
    }
  }
}

export const chatService = new ChatService();
