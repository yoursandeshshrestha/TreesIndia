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
  private hasConnectedOnce: boolean = false;
  private hasAuthError: boolean = false;

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
      return;
    }

    if (this.isConnecting) {
      return;
    }

    // Disconnect any existing connection
    if (this.ws) {
      this.disconnect();
    }

    this.isManualDisconnect = false;
    this.reconnectAttempts = 0;
    this.hasAuthError = false;
    this.isConnecting = true;

    try {
      // Get auth token
      this.token = await tokenStorage.getAccessToken();
      if (!this.token) {
        this.isConnecting = false;
        return;
      }

      await this.establishConnection();
    } catch (error) {
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  /**
   * Establish WebSocket connection
   */
  private async establishConnection(): Promise<void> {
    // Always fetch fresh token from storage before connecting
    // This ensures we use refreshed tokens from HTTP interceptor
    this.token = await tokenStorage.getAccessToken();

    if (!this.token) {
      this.isConnecting = false;
      return;
    }

    try {
      const baseWsUrl = getWebSocketUrl();
      const wsUrl = `${baseWsUrl}/ws/conversations/monitor?token=${this.token}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.hasConnectedOnce = true;
    this.hasAuthError = false;

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
      // Silent error handling
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(_error: Event): void {
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
    this.stopPingInterval();
    this.isConnecting = false;

    // Check if it's a HTTP error (400, 401, 403, 404, etc.)
    const is400Error = event.reason && event.reason.includes('400');
    const is404Error = event.reason && event.reason.includes('404');
    const isHttpError =
      is400Error || is404Error || (event.reason && /\b[4-5]\d{2}\b/.test(event.reason));

    // Don't retry if:
    // 1. It's a manual disconnect
    // 2. It's an HTTP error (endpoint doesn't exist or bad request)
    // 3. It's an authentication error (close code 1008 or 4401)
    // 4. Close code 1006 with reason suggesting auth failure
    // 5. We never successfully connected and have multiple failed attempts
    const isAuthError =
      event.code === 1008 || // Policy violation (often used for auth failures)
      event.code === 4401 || // Custom 401 code
      (event.code === 1006 && !this.hasConnectedOnce && this.reconnectAttempts >= 1) || // Connection closed abnormally before first success
      (!this.hasConnectedOnce && this.reconnectAttempts >= 3); // Multiple failures without ever connecting

    const shouldNotRetry = this.isManualDisconnect || isHttpError || isAuthError;

    if (shouldNotRetry) {
      if (isHttpError && !this.hasConnectedOnce) {
        // WebSocket endpoint doesn't exist or configuration error - fail silently
        this.hasAuthError = true; // Mark as auth error to prevent future retries
      } else if (isAuthError) {
        this.hasAuthError = true;
      }
    } else {
      this.handleReconnect();
    }

    this.emit('disconnected', { event: 'disconnected' });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.isManualDisconnect || this.hasAuthError) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1);

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
          // Silent error handling
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
      return false;
    }

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
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
        // Silent error handling
      }
      this.ws = null;
    }

    this.token = null;
    this.reconnectAttempts = 0;
    this.hasConnectedOnce = false;
    this.hasAuthError = false;
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
  private emit(event: string, data: ConversationMonitorMessage): void {
    if (!this.eventListeners[event]) {
      return;
    }

    this.eventListeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        // Silent error handling
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
