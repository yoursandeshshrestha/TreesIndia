import {
  WebSocketMessage,
  WebSocketConnectionStatus,
  SimpleConversationMessage,
} from '../../types/chat';

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

type EventCallback = (data: WebSocketMessage) => void;

interface EventListeners {
  [event: string]: EventCallback[];
}

/**
 * Singleton WebSocket service for real-time chat messaging
 * Handles connection lifecycle, event broadcasting, and auto-reconnection
 */
class ChatWebSocketService {
  private static instance: ChatWebSocketService;
  private ws: WebSocket | null = null;
  private conversationId: number | null = null;
  private token: string | null = null;
  private status: WebSocketConnectionStatus = 'disconnected';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Start with 1 second
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
  static getInstance(): ChatWebSocketService {
    if (!ChatWebSocketService.instance) {
      ChatWebSocketService.instance = new ChatWebSocketService();
    }
    return ChatWebSocketService.instance;
  }

  /**
   * Connect to WebSocket for a specific conversation
   */
  connect(conversationId: number, token: string): void {
    // If already connected to the same conversation, don't reconnect
    if (
      this.ws &&
      this.ws.readyState === WebSocket.OPEN &&
      this.conversationId === conversationId
    ) {
      return;
    }

    // Disconnect any existing connection
    if (this.ws) {
      this.disconnect();
    }

    this.conversationId = conversationId;
    this.token = token;
    this.isManualDisconnect = false;
    this.reconnectAttempts = 0;

    this.establishConnection();
  }

  /**
   * Establish WebSocket connection
   */
  private establishConnection(): void {
    if (!this.conversationId || !this.token) {
      return;
    }

    this.setStatus('connecting');

    try {
      const wsUrl = `${getWebSocketUrl()}/ws/conversations/connect?conversation_id=${this.conversationId}&token=${this.token}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      this.setStatus('error');
      this.handleReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.setStatus('connected');
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000; // Reset delay

    // Start ping interval to keep connection alive
    this.startPingInterval();

    // Emit connection event
    this.emit('connection_status', {
      type: 'connection_status',
      data: { status: 'connected' },
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Backend uses 'event' field instead of 'type'
      const messageType = message.type || message.event;

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
      // Error parsing message
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event): void {
    this.setStatus('error');

    this.emit('error', {
      type: 'error',
      error: 'WebSocket connection error',
    });
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.stopPingInterval();

    if (!this.isManualDisconnect) {
      this.setStatus('disconnected');
      this.handleReconnect();
    } else {
      this.setStatus('disconnected');
    }

    this.emit('connection_status', {
      type: 'connection_status',
      data: { status: 'disconnected' },
    });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.isManualDisconnect) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('error');
      return;
    }

    this.reconnectAttempts++;
    this.setStatus('reconnecting');

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.reconnectTimeout = setTimeout(() => {
      this.establishConnection();
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
          this.ws.send(JSON.stringify({ event: 'ping' }));
        } catch (error) {
          // Error sending ping
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
  send(message: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const payload = {
        event: 'message',
        data: { message },
      };

      this.ws.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(isTyping: boolean): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const payload = {
        event: 'typing',
        data: { is_typing: isTyping },
      };

      this.ws.send(JSON.stringify(payload));
    } catch (error) {
      // Error sending typing indicator
    }
  }

  /**
   * Send message read status
   */
  sendMessageRead(messageId: number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const payload = {
        event: 'message_read',
        data: { message_id: messageId },
      };

      this.ws.send(JSON.stringify(payload));
    } catch (error) {
      // Error sending message read
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    this.stopPingInterval();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      try {
        this.ws.close(1000, 'Manual disconnect');
      } catch (error) {
        // Error closing WebSocket
      }
      this.ws = null;
    }

    this.conversationId = null;
    this.token = null;
    this.reconnectAttempts = 0;
    this.setStatus('disconnected');
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

    this.eventListeners[event] = this.eventListeners[event].filter((cb) => cb !== callback);
  }

  /**
   * Emit an event to all registered listeners
   */
  private emit(event: string, data: WebSocketMessage): void {
    if (!this.eventListeners[event]) {
      return;
    }

    this.eventListeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        // Error in event listener
      }
    });
  }

  /**
   * Set connection status
   */
  private setStatus(status: WebSocketConnectionStatus): void {
    this.status = status;
  }

  /**
   * Get current connection status
   */
  getStatus(): WebSocketConnectionStatus {
    return this.status;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get current conversation ID
   */
  getConversationId(): number | null {
    return this.conversationId;
  }
}

// Export singleton instance
export const chatWebSocketService = ChatWebSocketService.getInstance();
