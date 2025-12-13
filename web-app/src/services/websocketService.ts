import type {
  WebSocketMessage,
  StartTrackingMessage,
  StopTrackingMessage,
  LocationUpdateWebSocketMessage,
  TrackingStatusMessage,
  WorkerLocation,
  TrackingStatusResponse,
  WorkerJoinMessage,
} from "@/types/location-tracking";

interface WebSocketCallbacks {
  onLocationUpdate?: (location: WorkerLocation) => void;
  onTrackingStatus?: (status: {
    tracking_status: TrackingStatusResponse;
  }) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
  onWorkerLocationUpdate?: (location: WorkerLocation) => void; // For customers to see worker location
  onMyLocationUpdate?: (location: WorkerLocation) => void; // For workers to see their own location
  onWorkerLeave?: (userId: number) => void; // For when a worker leaves/disconnects
  onMessage?: (message: WebSocketMessage) => void; // For chat messages
}

class LocationTrackingWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private callbacks: WebSocketCallbacks = {};
  private currentRoomId: number | null = null;
  private currentUserId: number | null = null;
  private currentUserType: "worker" | "normal" | "admin" | null = null;
  private locationWatchId: number | null = null;
  private isTracking = false;
  private currentAssignmentId: number | null = null;
  private lastEmittedLocation: { latitude: number; longitude: number } | null =
    null;
  private minDistanceThreshold = 0.1; // Minimum distance in meters to trigger location update (reduced for testing)

  constructor() {
    // Bind methods to preserve context
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.startLocationTracking = this.startLocationTracking.bind(this);
    this.stopLocationTracking = this.stopLocationTracking.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
  }

  // Connect to WebSocket server
  connect(
    userId: number,
    roomId: number,
    userType: "worker" | "normal" | "admin",
    callbacks: WebSocketCallbacks = {}
  ) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      console.log(
        `[WebSocket] Already connecting or connected for user ${userId} (${userType})`
      );
      return;
    }

    console.log(
      `[WebSocket] Connecting user ${userId} (${userType}) to room ${roomId}`
    );
    this.isConnecting = true;
    this.currentUserId = userId;
    this.currentRoomId = roomId;
    this.currentUserType = userType;
    this.callbacks = callbacks;

    // Always derive protocol from API URL to ensure consistency
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const apiBase = apiUrl.replace(/\/api\/v1$/, ""); // Remove /api/v1 suffix
    const wsProtocol = apiBase.startsWith("https") ? "wss" : "ws";

    // If NEXT_PUBLIC_WS_URL is set, extract host/port from it, otherwise use API URL
    let hostAndPath = apiBase.replace(/^https?:\/\//, ""); // Remove http:// or https://
    if (process.env.NEXT_PUBLIC_WS_URL) {
      // Extract host/port from WS URL (ignore protocol)
      const wsUrlMatch =
        process.env.NEXT_PUBLIC_WS_URL.match(/^wss?:\/\/(.+)$/);
      if (wsUrlMatch) {
        hostAndPath = wsUrlMatch[1];
      }
    }

    const baseUrl = `${wsProtocol}://${hostAndPath}`;
    const wsUrl = `${baseUrl}/ws/location?user_id=${userId}&room_id=${roomId}&user_type=${userType}`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketEventHandlers();
    } catch (error) {
      this.isConnecting = false;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown connection error";
      this.callbacks.onError?.(`Failed to connect: ${errorMessage}`);
    }
  }

  private setupWebSocketEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = async () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.callbacks.onConnected?.();

      // Send worker join message with current location (only if user type is worker)
      if (this.currentUserType === "worker") {
        await this.sendWorkerJoinMessage();
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      } catch (error) {
        this.callbacks.onError?.(
          `Failed to parse WebSocket message: ${
            error instanceof Error ? error.message : "Unknown parsing error"
          }`
        );
      }
    };

    this.ws.onclose = (event) => {
      this.isConnecting = false;
      this.callbacks.onDisconnected?.();

      // Provide more detailed close reason
      let closeReason = "Connection closed";
      if (event.code === 1000) {
        closeReason = "Normal closure";
      } else if (event.code === 1001) {
        closeReason = "Going away";
      } else if (event.code === 1002) {
        closeReason = "Protocol error";
      } else if (event.code === 1003) {
        closeReason = "Unsupported data";
      } else if (event.code === 1006) {
        closeReason = "Abnormal closure";
      } else if (event.code === 1011) {
        closeReason = "Server error";
      } else if (event.code === 1012) {
        closeReason = "Service restart";
      } else if (event.code === 1013) {
        closeReason = "Try again later";
      } else if (event.code === 1014) {
        closeReason = "Bad gateway";
      } else if (event.code === 1015) {
        closeReason = "TLS handshake failed";
      }

      if (
        event.code !== 1000 &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.scheduleReconnect();
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.callbacks.onError?.(
          `Connection lost: ${closeReason}. Max reconnection attempts reached.`
        );
      }
    };

    this.ws.onerror = (error) => {
      this.isConnecting = false;
      // Properly handle the error event
      const errorMessage =
        error instanceof Error ? error.message : "WebSocket connection error";
      this.callbacks.onError?.(`WebSocket error: ${errorMessage}`);
    };
  }

  private handleWebSocketMessage(message: WebSocketMessage) {
    switch (message.type) {
      case "location_update":
        const locationMessage = message as LocationUpdateWebSocketMessage;

        // Extract location data - check multiple possible structures
        let locationData = locationMessage.data || locationMessage;

        // Handle different data structures from backend
        if (locationData && typeof locationData === "object") {
          // If data is nested, try to extract the actual location data
          if (
            "data" in locationData &&
            locationData.data &&
            typeof locationData.data === "object"
          ) {
            locationData = locationData.data;
          }

          // Try to get coordinates from various possible locations
          const latitude = locationData.latitude || locationMessage.latitude;
          const longitude = locationData.longitude || locationMessage.longitude;

          // Check if we have valid coordinates
          const hasValidCoords =
            latitude !== undefined &&
            longitude !== undefined &&
            typeof latitude === "number" &&
            typeof longitude === "number" &&
            !isNaN(latitude) &&
            !isNaN(longitude);

          if (hasValidCoords) {
            // Create WorkerLocation object from message
            const location: WorkerLocation = {
              worker_id: locationMessage.user_id || 0,
              assignment_id: locationMessage.room_id || 0, // Use room_id as assignment_id for consistency
              booking_id: locationMessage.room_id || 0,
              latitude: latitude,
              longitude: longitude,
              accuracy: locationData.accuracy || locationMessage.accuracy || 0,
              status: locationData.status || locationMessage.status || "active",
              last_updated: new Date().toISOString(),
            };

            // Emit to general location update callback
            this.callbacks.onLocationUpdate?.(location);

            // Always call both callbacks if they exist - let the UI decide what to do
            if (this.callbacks.onMyLocationUpdate) {
              this.callbacks.onMyLocationUpdate(location);
            }

            if (this.callbacks.onWorkerLocationUpdate) {
              this.callbacks.onWorkerLocationUpdate(location);
            }
          }
        }
        break;

      case "tracking_status":
        const statusMessage = message as TrackingStatusMessage;
        this.callbacks.onTrackingStatus?.(statusMessage.data);
        break;

      case "join":
        // Handle join message - user joining a room
        break;

      case "leave":
        // Handle leave message - user leaving a room
        if (message.user_id) {
          this.callbacks.onWorkerLeave?.(message.user_id);
        }
        break;

      case "worker_join":
        // Handle worker join message - worker joining with location
        const workerJoinMessage = message as WorkerJoinMessage;

        // Validate worker join data
        if (
          typeof workerJoinMessage.latitude !== "number" ||
          typeof workerJoinMessage.longitude !== "number"
        ) {
          return;
        }

        // Convert worker join data to WorkerLocation format
        const workerLocation: WorkerLocation = {
          worker_id: workerJoinMessage.user_id || 0,
          assignment_id: workerJoinMessage.room_id || 0, // Use room_id as assignment_id for worker_join
          booking_id: workerJoinMessage.room_id || 0,
          latitude: workerJoinMessage.latitude,
          longitude: workerJoinMessage.longitude,
          accuracy: workerJoinMessage.accuracy || 0,
          status: "active",
          last_updated: new Date().toISOString(),
        };

        // Emit location update for customers
        if (this.currentUserType === "normal") {
          this.callbacks.onWorkerLocationUpdate?.(workerLocation);
        }
        break;

      case "message":
        // Handle chat messages
        this.callbacks.onMessage?.(message);
        break;

      case "pong":
        // Handle pong response for keep-alive
        break;

      default:
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      if (this.currentUserId && this.currentRoomId && this.currentUserType) {
        this.connect(
          this.currentUserId,
          this.currentRoomId,
          this.currentUserType,
          this.callbacks
        );
      }
    }, delay);
  }

  // Send message through WebSocket
  private sendMessage(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const messageString = JSON.stringify(message);
      this.ws.send(messageString);
    } else {
      const error = "WebSocket is not connected";
      this.callbacks.onError?.(error);
    }
  }

  // Start location tracking
  startLocationTracking(assignmentId: number) {
    if (!this.currentUserId || !this.currentRoomId) {
      const error = "Not connected to WebSocket";
      this.callbacks.onError?.(error);
      return;
    }

    // Check if WebSocket is actually connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const error = `WebSocket not connected. State: ${this.ws?.readyState}`;
      this.callbacks.onError?.(error);
      return;
    }

    const message: StartTrackingMessage = {
      type: "start_tracking",
      room_id: this.currentRoomId,
      user_id: this.currentUserId,
      latitude: 0, // Will be updated with actual location
      longitude: 0, // Will be updated with actual location
      accuracy: 0, // Will be updated with actual location
      timestamp: new Date().toISOString(),
    };

    this.sendMessage(message);
    this.isTracking = true;
    this.currentAssignmentId = assignmentId;

    // Start watching position changes
    this.startLocationUpdates(assignmentId);
  }

  // Stop location tracking
  stopLocationTracking() {
    if (!this.currentUserId || !this.currentRoomId) {
      this.callbacks.onError?.("Not connected to WebSocket");
      return;
    }

    const message: StopTrackingMessage = {
      type: "stop_tracking",
      room_id: this.currentRoomId,
      user_id: this.currentUserId,
      timestamp: new Date().toISOString(),
    };

    this.sendMessage(message);
    this.isTracking = false;
    this.currentAssignmentId = null;

    // Stop periodic location updates
    this.stopLocationUpdates();
  }

  // Start watching position changes
  private startLocationUpdates(assignmentId: number) {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
    }

    // Send initial location update immediately
    this.sendInitialLocationUpdate(assignmentId);

    // Use watchPosition to get real-time location updates only when position changes
    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        if (this.isTracking && this.currentAssignmentId === assignmentId) {
          this.updateLocation(assignmentId, position);
        }
      },
      () => {
        // Fallback to periodic updates if watchPosition fails
        this.fallbackToPeriodicUpdates(assignmentId);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // Increased timeout for better GPS fix
        maximumAge: 60000, // Allow cached positions up to 1 minute old
      }
    );

    // Start periodic fallback updates (every 30 seconds) to ensure customer gets updates
    this.startPeriodicFallbackUpdates(assignmentId);
  }

  // Send initial location update immediately when tracking starts
  private async sendInitialLocationUpdate(assignmentId: number) {
    // Try to get position with retries
    let position: GeolocationPosition | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts && !position) {
      attempts++;

      try {
        position = await this.getCurrentPosition();
        break;
      } catch {
        if (attempts < maxAttempts) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (position) {
      // Force the first update by clearing last emitted location
      this.lastEmittedLocation = null;
      this.updateLocation(assignmentId, position);
    } else {
      // If all attempts failed, try to get a cached position with lower accuracy
      try {
        const cachedPosition = await this.getCachedPosition();

        // Force the first update by clearing last emitted location
        this.lastEmittedLocation = null;
        this.updateLocation(assignmentId, cachedPosition);
      } catch {}
    }
  }

  // Start periodic fallback updates to ensure customer gets location updates
  private startPeriodicFallbackUpdates(assignmentId: number) {
    // Send location update every 30 seconds regardless of position change
    const fallbackInterval = setInterval(() => {
      if (this.isTracking && this.currentAssignmentId === assignmentId) {
        this.getCurrentPosition()
          .then((position) => {
            // Force update by temporarily clearing last emitted location
            const originalLastLocation = this.lastEmittedLocation;
            this.lastEmittedLocation = null;
            this.updateLocation(assignmentId, position);
            // Restore original location
            this.lastEmittedLocation = originalLastLocation;
          })
          .catch(() => {});
      } else {
        clearInterval(fallbackInterval);
      }
    }, 30000); // Every 30 seconds
  }

  // Fallback to periodic updates if watchPosition fails
  private fallbackToPeriodicUpdates(assignmentId: number) {
    const intervalId = setInterval(async () => {
      if (this.isTracking && this.currentAssignmentId === assignmentId) {
        try {
          const position = await this.getCurrentPosition();
          this.updateLocation(assignmentId, position);
        } catch {}
      } else {
        clearInterval(intervalId);
      }
    }, 30000); // Update every 30 seconds as fallback
  }

  // Stop watching position changes
  private stopLocationUpdates() {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  // Get current position using Geolocation API
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 30000, // Increased from 10s to 30s for better GPS fix
        maximumAge: 60000, // Increased from 30s to 60s to allow cached positions
      });
    });
  }

  // Get cached position with lower accuracy as fallback
  private getCachedPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false, // Lower accuracy for faster response
        timeout: 15000, // Shorter timeout for cached position
        maximumAge: 300000, // Allow positions up to 5 minutes old
      });
    });
  }

  // Check if location has changed significantly enough to emit update
  private shouldEmitLocationUpdate(
    latitude: number,
    longitude: number
  ): boolean {
    if (!this.lastEmittedLocation) {
      return true; // First location update
    }

    const distance = this.calculateDistance(
      this.lastEmittedLocation.latitude,
      this.lastEmittedLocation.longitude,
      latitude,
      longitude
    );

    return distance >= this.minDistanceThreshold;
  }

  // Calculate distance between two coordinates in meters
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Update location
  updateLocation(assignmentId: number, position: GeolocationPosition) {
    if (!this.currentUserId || !this.currentRoomId) {
      const error = "Not connected to WebSocket";
      this.callbacks.onError?.(error);
      return;
    }

    // Check if WebSocket is actually connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const error = `WebSocket not connected. State: ${this.ws?.readyState}`;
      this.callbacks.onError?.(error);
      return;
    }

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Only emit if location has changed significantly
    if (!this.shouldEmitLocationUpdate(latitude, longitude)) {
      return;
    }

    // Create message with flat structure for backend
    const message: LocationUpdateWebSocketMessage = {
      type: "location_update",
      room_id: this.currentRoomId,
      user_id: this.currentUserId,
      latitude: latitude,
      longitude: longitude,
      accuracy: position.coords.accuracy,
      status: "active",
      timestamp: new Date().toISOString(),
    };

    // Update last emitted location
    this.lastEmittedLocation = { latitude, longitude };

    this.sendMessage(message);
  }

  // Check if currently tracking
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // Get current assignment ID being tracked
  getCurrentAssignmentId(): number | null {
    return this.currentAssignmentId;
  }

  // Force immediate location update for testing
  forceLocationUpdate(assignmentId: number) {
    if (!this.isTracking || this.currentAssignmentId !== assignmentId) {
      return;
    }

    this.getCurrentPosition()
      .then((position) => {
        // Temporarily clear last emitted location to force update
        this.lastEmittedLocation = null;
        this.updateLocation(assignmentId, position);
      })
      .catch(() => {});
  }

  // Send test location update for debugging
  sendTestLocationUpdate() {
    if (!this.currentUserId || !this.currentRoomId) {
      return;
    }

    // Create a test location update with flat structure
    const message: LocationUpdateWebSocketMessage = {
      type: "location_update",
      room_id: this.currentRoomId,
      user_id: this.currentUserId,
      latitude: 20.5937, // Test coordinates (India center)
      longitude: 78.9629,
      accuracy: 10,
      status: "active",
      timestamp: new Date().toISOString(),
    };

    this.sendMessage(message);
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.currentUserId && this.currentRoomId) {
      console.log(
        `[WebSocket] Disconnecting user ${this.currentUserId} (${this.currentUserType}) from room ${this.currentRoomId}`
      );
    }

    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }

    if (this.ws) {
      this.ws.close(1000, "User disconnected");
      this.ws = null;
    }

    this.isTracking = false;
    this.currentAssignmentId = null;
    this.currentRoomId = null;
    this.currentUserId = null;
    this.isConnecting = false;
  }

  // Get connection status
  getConnectionStatus(): "connected" | "connecting" | "disconnected" {
    if (this.ws?.readyState === WebSocket.OPEN) return "connected";
    if (this.isConnecting) return "connecting";
    return "disconnected";
  }

  // Setup callbacks for external use
  setupCallbacks(callbacks: WebSocketCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Send worker join message with current location
  private async sendWorkerJoinMessage() {
    if (!this.currentUserId || !this.currentRoomId) {
      return;
    }

    // First try to get a cached position to avoid geolocation violation
    try {
      const position = await this.getCachedPosition();

      const message: WorkerJoinMessage = {
        type: "worker_join",
        room_id: this.currentRoomId,
        user_id: this.currentUserId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
      };

      this.sendMessage(message);
    } catch {
      // Send join message without location if geolocation fails
      const message: WorkerJoinMessage = {
        type: "worker_join",
        room_id: this.currentRoomId,
        user_id: this.currentUserId,
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        timestamp: new Date().toISOString(),
      };
      this.sendMessage(message);
    }
  }
}

// Export singleton instance
export const locationTrackingWebSocket = new LocationTrackingWebSocketService();
