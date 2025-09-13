// Simple global store for conversation updates
import { Conversation } from "@/core/ChatManagementPage/services/conversationApi";

type ConversationUpdateData = {
  conversation_id: number;
  message: {
    id: number;
    conversation_id: number;
    sender_id: number;
    message: string;
    created_at: string;
    sender?: {
      user_type: string;
    };
  };
};

class ConversationStore {
  private listeners: Set<(data: ConversationUpdateData) => void> = new Set();
  private conversationListListeners: Set<
    (conversations: Conversation[]) => void
  > = new Set();
  private readStatusListeners: Set<(conversationId: number) => void> =
    new Set();
  private unreadCountListeners: Set<(count: number) => void> = new Set();
  private conversationUnreadCountListeners: Set<
    (conversationId: number, count: number) => void
  > = new Set();
  private openConversationListeners: Set<
    (conversationId: number | null) => void
  > = new Set();

  // Track which conversation is currently open
  private currentlyOpenConversationId: number | null = null;

  // Subscribe to conversation updates
  subscribeToUpdates(callback: (data: ConversationUpdateData) => void) {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  // Subscribe to conversation list updates
  subscribeToConversationList(
    callback: (conversations: Conversation[]) => void
  ) {
    this.conversationListListeners.add(callback);

    return () => {
      this.conversationListListeners.delete(callback);
    };
  }

  // Subscribe to read status updates
  subscribeToReadStatus(callback: (conversationId: number) => void) {
    this.readStatusListeners.add(callback);

    return () => {
      this.readStatusListeners.delete(callback);
    };
  }

  // Subscribe to unread count updates
  subscribeToUnreadCount(callback: (count: number) => void) {
    this.unreadCountListeners.add(callback);

    return () => {
      this.unreadCountListeners.delete(callback);
    };
  }

  // Subscribe to conversation unread count updates
  subscribeToConversationUnreadCount(
    callback: (conversationId: number, count: number) => void
  ) {
    this.conversationUnreadCountListeners.add(callback);

    return () => {
      this.conversationUnreadCountListeners.delete(callback);
    };
  }

  // Subscribe to open conversation changes
  subscribeToOpenConversation(
    callback: (conversationId: number | null) => void
  ) {
    this.openConversationListeners.add(callback);

    return () => {
      this.openConversationListeners.delete(callback);
    };
  }

  // Emit conversation update
  emitUpdate(data: ConversationUpdateData) {
    this.listeners.forEach((callback) => {
      callback(data);
    });
  }

  // Emit conversation list update
  emitConversationListUpdate(conversations: Conversation[]) {
    this.conversationListListeners.forEach((callback) => {
      callback(conversations);
    });
  }

  // Emit read status update
  emitReadStatusUpdate(conversationId: number) {
    this.readStatusListeners.forEach((callback) => {
      callback(conversationId);
    });
  }

  // Emit unread count update
  emitUnreadCountUpdate(count: number) {
    this.unreadCountListeners.forEach((callback) => {
      callback(count);
    });
  }

  // Emit conversation unread count update
  emitConversationUnreadCountUpdate(conversationId: number, count: number) {
    this.conversationUnreadCountListeners.forEach((callback) => {
      callback(conversationId, count);
    });
  }

  // Set currently open conversation
  setOpenConversation(conversationId: number | null) {
    this.currentlyOpenConversationId = conversationId;
    this.openConversationListeners.forEach((callback) => {
      callback(conversationId);
    });
  }

  // Get currently open conversation
  getOpenConversation(): number | null {
    return this.currentlyOpenConversationId;
  }

  // Check if a conversation is currently open
  isConversationOpen(conversationId: number): boolean {
    return this.currentlyOpenConversationId === conversationId;
  }
}

// Export singleton instance
export const conversationStore = new ConversationStore();
export type { ConversationUpdateData };
