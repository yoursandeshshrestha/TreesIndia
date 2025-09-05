export interface WorkerLocation {
  worker_id: number;
  assignment_id: number;
  booking_id: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  status: string;
  last_updated: string;
}

export interface TrackingStatusResponse {
  assignment_id: number;
  booking_id: number;
  worker_id: number;
  is_tracking: boolean;
  status: string;
  tracking_started_at: string | null;
  worker_name: string;
  customer_name: string;
}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface WebSocketMessage {
  type: string;
  room_id?: number;
  user_id?: number;
  message?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

// Control messages for starting/stopping tracking
export interface StartTrackingMessage extends WebSocketMessage {
  type: "start_tracking";
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface StopTrackingMessage extends WebSocketMessage {
  type: "stop_tracking";
}

// Location update messages
export interface LocationUpdateWebSocketMessage extends WebSocketMessage {
  type: "location_update";
  latitude: number;
  longitude: number;
  accuracy: number;
  status: string;
}

// Tracking status messages
export interface TrackingStatusMessage extends WebSocketMessage {
  type: "tracking_status";
  data: {
    tracking_status: TrackingStatusResponse;
  };
}

// Worker join message with location
export interface WorkerJoinMessage extends WebSocketMessage {
  type: "worker_join";
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface TrackingStatus {
  assignmentId: number;
  isTracking: boolean;
  lastLocation?: WorkerLocation;
  trackingStartedAt?: string;
}
