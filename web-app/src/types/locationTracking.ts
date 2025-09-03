// Location tracking types for worker assignments

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface WorkerLocationResponse {
  worker_id: number;
  assignment_id: number;
  booking_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  status: string;
  last_updated: string;
  worker_name?: string;
  customer_name?: string;
  has_arrived?: boolean; // Whether worker has arrived at customer location
}

export interface CustomerLocationResponse {
  assignment_id: number;
  booking_id: number;
  customer_name: string;
  address: string;
  contact_person: string;
  contact_phone: string;
  latitude: number;
  longitude: number;
  description: string;
  scheduled_date?: string;
  scheduled_time?: string;
}

export interface LocationTrackingState {
  isTracking: boolean;
  currentLocation: WorkerLocationResponse | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export interface LocationTrackingActions {
  startTracking: (assignmentId: number) => Promise<void>;
  updateLocation: (
    assignmentId: number,
    location: LocationUpdate
  ) => Promise<void>;
  stopTracking: (assignmentId: number) => Promise<void>;
  getWorkerLocation: (
    assignmentId: number
  ) => Promise<WorkerLocationResponse | null>;
}

// WebSocket message types for location updates
export interface LocationWebSocketMessage {
  type: "worker_location" | "tracking_stopped";
  data:
    | WorkerLocationResponse
    | {
        assignment_id: number;
        worker_id: number;
        status: string;
      };
}

// Map configuration
export interface MapConfig {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  workerMarker?: {
    lat: number;
    lng: number;
    name: string;
  };
  customerMarker?: {
    lat: number;
    lng: number;
    name: string;
  };
}
