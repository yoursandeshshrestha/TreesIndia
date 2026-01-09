import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ChatState,
  SimpleConversation,
  SimpleConversationMessage,
  PaginationInfo,
} from '../../types/chat';
import { chatService } from '../../services';

// Initial state
const initialState: ChatState = {
  conversations: [],
  messages: {},
  activeConversationId: null,
  pagination: {
    conversations: null,
    messages: {},
  },
  isLoading: false,
  isSendingMessage: false,
  error: null,
  unreadCounts: {},
  totalUnreadCount: 0,
  typingUsers: {},
};

// Async thunks

/**
 * Fetch user's conversations
 */
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (
    { page = 1, limit = 20 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await chatService.getConversations(page, limit);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch conversations';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch messages for a conversation
 */
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (
    {
      conversationId,
      page = 1,
      limit = 50,
    }: { conversationId: number; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await chatService.getMessages(conversationId, page, limit);
      return { conversationId, ...response };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch messages';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Send a chat message
 */
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    {
      conversationId,
      message,
      attachmentType,
      imageUrl,
      videoUrl,
    }: {
      conversationId: number;
      message: string;
      attachmentType?: 'image' | 'video';
      imageUrl?: string;
      videoUrl?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const messageData = {
        message,
        ...(attachmentType && { attachment_type: attachmentType }),
        ...(imageUrl && { image_url: imageUrl }),
        ...(videoUrl && { video_url: videoUrl }),
      };

      const sentMessage = await chatService.sendMessage(conversationId, messageData);
      return { conversationId, message: sentMessage };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Send a chat message with file attachment
 */
export const sendChatMessageWithFile = createAsyncThunk(
  'chat/sendMessageWithFile',
  async (
    {
      conversationId,
      messageText,
      fileUri,
      fileName,
      mimeType,
    }: {
      conversationId: number;
      messageText: string;
      fileUri: string;
      fileName: string;
      mimeType: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const sentMessage = await chatService.sendMessageWithFile(
        conversationId,
        messageText,
        fileUri,
        fileName,
        mimeType
      );
      return { conversationId, message: sentMessage };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message with file';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Create or get existing conversation between two users
 */
export const createOrGetConversation = createAsyncThunk(
  'chat/createOrGetConversation',
  async (
    { userId1, userId2 }: { userId1: number; userId2: number },
    { rejectWithValue }
  ) => {
    try {
      const conversation = await chatService.createConversation(userId1, userId2);
      return { conversation };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create conversation';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Mark conversation as read
 */
export const markConversationAsRead = createAsyncThunk(
  'chat/markAsRead',
  async ({ conversationId }: { conversationId: number }, { rejectWithValue }) => {
    try {
      await chatService.markAsRead(conversationId);
      return { conversationId };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to mark as read';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch unread count for conversation
 */
export const fetchUnreadCount = createAsyncThunk(
  'chat/fetchUnreadCount',
  async ({ conversationId }: { conversationId: number }, { rejectWithValue }) => {
    try {
      const count = await chatService.getUnreadCount(conversationId);
      return { conversationId, count };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch unread count';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch total unread count across all conversations
 */
export const fetchTotalUnreadCount = createAsyncThunk(
  'chat/fetchTotalUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await chatService.getTotalUnreadCount();
      return count;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch total unread count';
      return rejectWithValue(errorMessage);
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    /**
     * Add a message to the conversation (typically from WebSocket)
     */
    addMessage: (
      state,
      action: PayloadAction<{ conversationId: number; message: SimpleConversationMessage }>
    ) => {
      const { conversationId, message } = action.payload;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Check if message already exists (prevent duplicates)
      const exists = state.messages[conversationId].some((m) => m.id === message.id);
      if (!exists) {
        state.messages[conversationId].push(message);

        // Sort messages by created_at (newest last)
        state.messages[conversationId].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }

      // Update conversation's last message
      const conversation = state.conversations.find((c) => c.id === conversationId);
      if (conversation) {
        conversation.last_message_text = message.message || '';
        conversation.last_message_created_at = message.created_at;
        conversation.last_message_sender_id = message.sender_id;
      }
    },

    /**
     * Add optimistic pending message (before upload completes)
     */
    addOptimisticMessage: (
      state,
      action: PayloadAction<{
        conversationId: number;
        tempId: number;
        message: string;
        senderId: number;
        localFileUri?: string;
        attachmentType?: 'image' | 'video';
      }>
    ) => {
      const { conversationId, tempId, message, senderId, localFileUri, attachmentType } = action.payload;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      const optimisticMessage: SimpleConversationMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: senderId,
        message: message || null,
        is_read: false,
        read_at: null,
        attachment_type: attachmentType || null,
        image_url: localFileUri && attachmentType === 'image' ? localFileUri : null,
        video_url: localFileUri && attachmentType === 'video' ? localFileUri : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isPending: true,
        localFileUri,
      };

      state.messages[conversationId].push(optimisticMessage);
    },

    /**
     * Replace optimistic message with actual message from backend
     */
    replaceOptimisticMessage: (
      state,
      action: PayloadAction<{
        conversationId: number;
        tempId: number;
        actualMessage: SimpleConversationMessage;
      }>
    ) => {
      const { conversationId, tempId, actualMessage } = action.payload;

      if (state.messages[conversationId]) {
        const index = state.messages[conversationId].findIndex((m) => m.id === tempId);
        if (index !== -1) {
          // Replace the optimistic message with the actual one
          state.messages[conversationId][index] = actualMessage;

          // Sort messages by created_at (newest last)
          state.messages[conversationId].sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
      }

      // Update conversation's last message
      const conversation = state.conversations.find((c) => c.id === conversationId);
      if (conversation) {
        conversation.last_message_text = actualMessage.message || '';
        conversation.last_message_created_at = actualMessage.created_at;
        conversation.last_message_sender_id = actualMessage.sender_id;
      }
    },

    /**
     * Mark optimistic message as failed
     */
    markOptimisticMessageFailed: (
      state,
      action: PayloadAction<{
        conversationId: number;
        tempId: number;
        error: string;
      }>
    ) => {
      const { conversationId, tempId, error } = action.payload;

      if (state.messages[conversationId]) {
        const message = state.messages[conversationId].find((m) => m.id === tempId);
        if (message) {
          message.isPending = false;
          message.uploadError = error;
        }
      }
    },

    /**
     * Update typing status for a user in conversation
     */
    updateTypingStatus: (
      state,
      action: PayloadAction<{
        conversationId: number;
        userId: number;
        isTyping: boolean;
      }>
    ) => {
      const { conversationId, userId, isTyping } = action.payload;

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (isTyping) {
        // Add user if not already in typing list
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        // Remove user from typing list
        state.typingUsers[conversationId] = state.typingUsers[
          conversationId
        ].filter((id) => id !== userId);
      }
    },

    /**
     * Set active conversation
     */
    setActiveConversation: (state, action: PayloadAction<number | null>) => {
      state.activeConversationId = action.payload;
    },

    /**
     * Clear error
     */
    clearChatError: (state) => {
      state.error = null;
    },

    /**
     * Clear messages for a conversation
     */
    clearMessages: (state, action: PayloadAction<number>) => {
      const conversationId = action.payload;
      delete state.messages[conversationId];
      delete state.pagination.messages[conversationId];
    },

    /**
     * Clear all chat data
     */
    clearAllChatData: (state) => {
      state.conversations = [];
      state.messages = {};
      state.activeConversationId = null;
      state.pagination = {
        conversations: null,
        messages: {},
      };
      state.unreadCounts = {};
      state.totalUnreadCount = 0;
      state.typingUsers = {};
    },

    /**
     * Update message read status
     */
    updateMessageReadStatus: (
      state,
      action: PayloadAction<{ conversationId: number; messageId: number }>
    ) => {
      const { conversationId, messageId } = action.payload;

      if (state.messages[conversationId]) {
        const message = state.messages[conversationId].find((m) => m.id === messageId);
        if (message) {
          message.is_read = true;
          message.read_at = new Date().toISOString();
        }
      }
    },

    /**
     * Update total unread count (typically from WebSocket or API refresh)
     */
    updateTotalUnreadCount: (state, action: PayloadAction<number>) => {
      state.totalUnreadCount = action.payload;
    },

    /**
     * Increment total unread count (when new message arrives)
     */
    incrementTotalUnreadCount: (state) => {
      state.totalUnreadCount += 1;
    },

    /**
     * Decrement total unread count (when message is read)
     */
    decrementTotalUnreadCount: (state, action: PayloadAction<number>) => {
      const decrementBy = action.payload || 1;
      state.totalUnreadCount = Math.max(0, state.totalUnreadCount - decrementBy);
    },

    /**
     * Update unread count for a specific conversation
     */
    updateConversationUnreadCount: (
      state,
      action: PayloadAction<{ conversationId: number; count: number }>
    ) => {
      const { conversationId, count } = action.payload;
      state.unreadCounts[conversationId] = count;
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.data;
        state.pagination.conversations = action.payload.pagination || null;
        state.error = null;

        // Extract and store unread counts from conversations
        action.payload.data.forEach((conversation) => {
          if (conversation.unread_count !== undefined) {
            state.unreadCounts[conversation.id] = conversation.unread_count;
          }
        });
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { conversationId, data, pagination } = action.payload;

        // Initialize or replace messages for this conversation
        // Sort messages by created_at (newest last) for consistent ordering
        state.messages[conversationId] = data.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Store pagination info
        if (pagination) {
          state.pagination.messages[conversationId] = pagination;
        }

        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Send message
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isSendingMessage = false;
        const { conversationId, message } = action.payload;

        // Add message to conversation
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }

        // Check if message already exists (prevent duplicates)
        const exists = state.messages[conversationId].some((m) => m.id === message.id);
        if (!exists) {
          state.messages[conversationId].push(message);

          // Sort messages by created_at (newest last) for consistent ordering
          state.messages[conversationId].sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }

        // Update conversation's last message
        const conversation = state.conversations.find((c) => c.id === conversationId);
        if (conversation) {
          conversation.last_message_text = message.message || '';
          conversation.last_message_created_at = message.created_at;
          conversation.last_message_sender_id = message.sender_id;
        }

        state.error = null;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload as string;
      });

    // Send message with file
    builder
      .addCase(sendChatMessageWithFile.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendChatMessageWithFile.fulfilled, (state, action) => {
        state.isSendingMessage = false;
        const { conversationId, message } = action.payload;

        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }

        // First, check if this message already exists (from WebSocket)
        const existingIndex = state.messages[conversationId].findIndex((m) => m.id === message.id);

        if (existingIndex !== -1) {
          // Message already exists (likely from WebSocket), just remove the pending message
          const pendingIndex = state.messages[conversationId].findIndex((m) => m.isPending === true);
          if (pendingIndex !== -1) {
            state.messages[conversationId].splice(pendingIndex, 1);
          }
        } else {
          // Message doesn't exist, replace pending or add new
          const pendingIndex = state.messages[conversationId].findIndex((m) => m.isPending === true);

          if (pendingIndex !== -1) {
            // Replace the pending message with the actual message
            state.messages[conversationId][pendingIndex] = message;
          } else {
            state.messages[conversationId].push(message);
          }
        }

        // Sort messages by created_at (newest last) for consistent ordering
        state.messages[conversationId].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Update conversation's last message
        const conversation = state.conversations.find((c) => c.id === conversationId);
        if (conversation) {
          conversation.last_message_text = message.message || '';
          conversation.last_message_created_at = message.created_at;
          conversation.last_message_sender_id = message.sender_id;
        }

        state.error = null;
      })
      .addCase(sendChatMessageWithFile.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload as string;

        // Mark the last pending message as failed
        Object.keys(state.messages).forEach((convId) => {
          const messages = state.messages[parseInt(convId)];
          if (messages) {
            const pendingMessage = messages.find((m) => m.isPending === true);
            if (pendingMessage) {
              pendingMessage.isPending = false;
              pendingMessage.uploadError = action.payload as string || 'Upload failed';
            }
          }
        });
      });

    // Create or get conversation
    builder
      .addCase(createOrGetConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrGetConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        const { conversation } = action.payload;

        // Add conversation if it doesn't exist
        const exists = state.conversations.some((c) => c.id === conversation.id);
        if (!exists) {
          state.conversations.unshift(conversation);
        }

        state.error = null;
      })
      .addCase(createOrGetConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;

        // Get current unread count for this conversation before resetting
        const conversationUnreadCount = state.unreadCounts[conversationId] || 0;

        // Mark all messages as read
        if (state.messages[conversationId]) {
          state.messages[conversationId].forEach((message) => {
            message.is_read = true;
            if (!message.read_at) {
              message.read_at = new Date().toISOString();
            }
          });
        }

        // Decrement total unread count by the conversation's unread count
        state.totalUnreadCount = Math.max(0, state.totalUnreadCount - conversationUnreadCount);

        // Reset unread count for this conversation
        state.unreadCounts[conversationId] = 0;
      })
      .addCase(markConversationAsRead.rejected, (state, action) => {
        console.error('[chatSlice] markAsRead failed:', action.payload);
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        const { conversationId, count } = action.payload;
        state.unreadCounts[conversationId] = count;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        console.error('[chatSlice] fetchUnreadCount failed:', action.payload);
      });

    // Fetch total unread count
    builder
      .addCase(fetchTotalUnreadCount.fulfilled, (state, action) => {
        state.totalUnreadCount = action.payload;
      })
      .addCase(fetchTotalUnreadCount.rejected, (state, action) => {
        console.error('[chatSlice] fetchTotalUnreadCount failed:', action.payload);
      });
  },
});

export const {
  addMessage,
  addOptimisticMessage,
  replaceOptimisticMessage,
  markOptimisticMessageFailed,
  updateTypingStatus,
  setActiveConversation,
  clearChatError,
  clearMessages,
  clearAllChatData,
  updateMessageReadStatus,
  updateTotalUnreadCount,
  incrementTotalUnreadCount,
  decrementTotalUnreadCount,
  updateConversationUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;
