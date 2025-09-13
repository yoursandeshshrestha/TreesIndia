import { SimpleConversation } from "@/lib/simpleConversationApi";

type ConversationUpdateData = {
  event: string;
  conversation_id: number;
  message: {
    id: number;
    message: string;
    created_at: string;
    sender_id: number;
    sender?: {
      user_type: string;
    };
  };
};

class ConversationStore {
  private listeners: Set<(data: ConversationUpdateData) => void> = new Set();
  private conversationListListeners: Set<
    (conversations: SimpleConversation[]) => void
  > = new Set();
  private readStatusListeners: Set<(conversationId: number) => void> =
    new Set();
  private totalUnreadCountListeners: Set<(count: number) => void> = new Set();
  private conversationUnreadCountListeners: Set<
    (conversationId: number, count: number) => void
  > = new Set();
  private currentUnreadCount: number = 0;
  private openConversationListeners: Set<
    (conversationId: number | null) => void
  > = new Set();

  // Track which conversation is currently open
  private currentlyOpenConversationId: number | null = null;
  private refreshListeners: Set<() => void> = new Set();

  // Subscribe to conversation updates
  subscribeToUpdates(callback: (data: ConversationUpdateData) => void) {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  // Subscribe to conversation list updates
  subscribeToConversationList(
    callback: (conversations: SimpleConversation[]) => void
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

  // Subscribe to total unread count updates
  subscribeToTotalUnreadCount(callback: (count: number) => void) {
    this.totalUnreadCountListeners.add(callback);

    return () => {
      this.totalUnreadCountListeners.delete(callback);
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
  emitConversationListUpdate(conversations: SimpleConversation[]) {
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

  // Emit total unread count update
  emitTotalUnreadCountUpdate(count: number) {
    this.currentUnreadCount = count;
    this.totalUnreadCountListeners.forEach((callback) => {
      callback(count);
    });
  }

  // Emit conversation unread count update
  emitConversationUnreadCountUpdate(conversationId: number, count: number) {
    this.conversationUnreadCountListeners.forEach((callback) => {
      callback(conversationId, count);
    });
  }

  // Get current unread count
  getCurrentUnreadCount() {
    return this.currentUnreadCount;
  }

  // Set current unread count
  setCurrentUnreadCount(count: number) {
    this.currentUnreadCount = count;
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

  // Subscribe to refresh events
  subscribeToRefresh(callback: () => void) {
    this.refreshListeners.add(callback);
    return () => {
      this.refreshListeners.delete(callback);
    };
  }

  // Emit refresh event
  emitRefresh() {
    this.refreshListeners.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("Error in refresh listener:", error);
      }
    });
  }
}

// Export singleton instance
export const conversationStore = new ConversationStore();
