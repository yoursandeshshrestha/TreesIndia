import { InAppNotification } from "@/types/notification";

interface NotificationStoreState {
  notifications: InAppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

type NotificationStoreListener = (state: NotificationStoreState) => void;

class NotificationStore {
  private state: NotificationStoreState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  };

  private listeners: Set<NotificationStoreListener> = new Set();

  // Subscribe to state changes
  subscribe(listener: NotificationStoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Get current state
  getState(): NotificationStoreState {
    return { ...this.state };
  }

  // Update state and notify listeners
  private setState(newState: Partial<NotificationStoreState>): void {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Actions
  setNotifications(notifications: InAppNotification[]): void {
    this.setState({ notifications });
  }

  addNotification(notification: InAppNotification): void {
    const notifications = [notification, ...this.state.notifications];
    this.setState({ notifications });
  }

  updateNotification(notificationId: number, updates: Partial<InAppNotification>): void {
    const notifications = this.state.notifications.map((notification) =>
      notification.id === notificationId ? { ...notification, ...updates } : notification
    );
    this.setState({ notifications });
  }

  setUnreadCount(count: number): void {
    this.setState({ unreadCount: count });
  }

  setLoading(loading: boolean): void {
    this.setState({ isLoading: loading });
  }

  setError(error: string | null): void {
    this.setState({ error });
  }

  // Mark notification as read
  markAsRead(notificationId: number): void {
    this.updateNotification(notificationId, { 
      is_read: true, 
      read_at: new Date().toISOString() 
    });
    
    // Update unread count
    const unreadCount = this.state.notifications.filter(n => !n.is_read).length;
    this.setUnreadCount(unreadCount);
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    const notifications = this.state.notifications.map((notification) => ({
      ...notification,
      is_read: true,
      read_at: new Date().toISOString(),
    }));
    this.setState({ notifications, unreadCount: 0 });
  }

  // Clear all notifications
  clear(): void {
    this.setState({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
    });
  }
}

// Create and export singleton instance
export const notificationStore = new NotificationStore();
