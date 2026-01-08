import { tokenStorage } from '../api/base';

// Get WebSocket URL from environment
const getWebSocketUrl = (): string => {
  const EXPO_ENVIRONMENT = process.env.EXPO_ENVIRONMENT || 'dev';

  let baseUrl: string;
  if (EXPO_ENVIRONMENT === 'prod') {
    baseUrl = process.env.EXPO_PUBLIC_PROD_API_URL || 'ws://localhost:8080/api/v1';
  } else {
    baseUrl = process.env.EXPO_PUBLIC_DEV_API_URL || 'ws://localhost:8080/api/v1';
  }

  // Convert http/https to ws/wss
  baseUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');

  // Remove /api/v1 if present to add it back correctly
  baseUrl = baseUrl.replace(/\/api\/v1$/, '');

  return `${baseUrl}/api/v1`;
};

interface ConversationMonitorMessage {
  event: string;
  data?: {
    total_unread_count?: number;
    conversation_id?: number;
    unread_count?: number;
    [key: string]: unknown;
  };
}

type EventCallback = (data: ConversationMonitorMessage) => void;

interface EventListeners {
  [event: string]: EventCallback[];
}

/**
 * Singleton WebSocket service for monitoring all conversations
 * Broadcasts real-time updates for total unread count and conversation updates
 */
class ConversationMonitorWebSocketService {
  private static instance: ConversationMonitorWebSocketService;
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private eventListeners: EventListeners = {};
  private isManualDisconnect: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ConversationMonitorWebSocketService {
    if (!ConversationMonitorWebSocketService.instance) {
      ConversationMonitorWebSocketService.instance = new ConversationMonitorWebSocketService();
    }
    return ConversationMonitorWebSocketService.instance;
  }

  /**
   * Connect to global conversation monitor WebSocket
   */
  async connect(): Promise<void> {
    // If already connected or connecting, don't reconnect
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[ConversationMonitor] Already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('[ConversationMonitor] Connection already in progress');
      return;
    }

    // Disconnect any existing connection
    if (this.ws) {
      this.disconnect();
    }

    this.isManualDisconnect = false;
    this.reconnectAttempts = 0;
    this.isConnecting = true;

    try {
      // Get auth token
      this.token = await tokenStorage.getAccessToken();
      if (!this.token) {
        console.error('[ConversationMonitor] No auth token available');
        this.isConnecting = false;
        return;
      }

      await this.establishConnection();
    } catch (error) {
      console.error('[ConversationMonitor] Error connecting:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  /**
   * Establish WebSocket connection
   */
  private async establishConnection(): Promise<void> {
    if (!this.token) {
      console.error('[ConversationMonitor] Missing token');
      this.isConnecting = false;
      return;
    }

    try {
      const wsUrl = `${getWebSocketUrl()}/ws/conversations/monitor?token=${this.token}`;
      console.log('[ConversationMonitor] Connecting to:', wsUrl.replace(this.token, '***'));

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('[ConversationMonitor] Error establishing connection:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('[ConversationMonitor] Connected successfully');
    this.isConnecting = false;
    this.reconnectAttempts = 0;

    // Start ping interval to keep connection alive
    this.startPingInterval();

    // Send test connection message
    this.send({ event: 'test_connection' });

    // Request initial conversations data
    this.send({ event: 'get_conversations' });

    // Emit connection event
    this.emit('connected', { event: 'connected' });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: ConversationMonitorMessage = JSON.parse(event.data);
      const messageType = message.event;

      console.log('[ConversationMonitor] Received message:', messageType, message.data);

      // Handle pong response
      if (messageType === 'pong') {
        return;
      }

      // Emit the message to all registered listeners
      if (messageType) {
        this.emit(messageType, message);

        // Also emit to generic 'message' event for convenience
        if (messageType !== 'error') {
          this.emit('message', message);
        }
      }
    } catch (error) {
      console.error('[ConversationMonitor] Error parsing message:', error);
      console.error('[ConversationMonitor] Raw data was:', event.data);
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event): void {
    console.error('[ConversationMonitor] WebSocket error:', error);
    this.isConnecting = false;

    this.emit('error', {
      event: 'error',
      data: { error: 'WebSocket connection error' },
    });
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log('[ConversationMonitor] Connection closed:', event.code, event.reason);
    this.stopPingInterval();
    this.isConnecting = false;

    if (!this.isManualDisconnect) {
      this.handleReconnect();
    }

    this.emit('disconnected', { event: 'disconnected' });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.isManualDisconnect) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[ConversationMonitor] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[ConversationMonitor] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.stopPingInterval(); // Clear any existing interval

    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.send({ event: 'ping' });
        } catch (error) {
          console.error('[ConversationMonitor] Error sending ping:', error);
        }
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Send a message through WebSocket
   */
  private send(data: Record<string, unknown>): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[ConversationMonitor] WebSocket is not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('[ConversationMonitor] Error sending message:', error);
      return false;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    console.log('[ConversationMonitor] Disconnecting...');
    this.isManualDisconnect = true;
    this.isConnecting = false;
    this.stopPingInterval();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      try {
        this.ws.close(1000, 'Manual disconnect');
      } catch (error) {
        console.error('[ConversationMonitor] Error closing WebSocket:', error);
      }
      this.ws = null;
    }

    this.token = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Register an event listener
   */
  on(event: string, callback: EventCallback): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Unregister an event listener
   */
  off(event: string, callback: EventCallback): void {
    if (!this.eventListeners[event]) {
      return;
    }

    this.eventListeners[event] = this.eventListeners[event].filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Emit an event to all registered listeners
   */
  private emit(event: string, data: ConversationMonitorMessage): void {
    if (!this.eventListeners[event]) {
      return;
    }

    this.eventListeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[ConversationMonitor] Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const conversationMonitorWebSocket = ConversationMonitorWebSocketService.getInstance();
