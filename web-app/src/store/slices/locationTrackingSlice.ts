import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { locationTrackingWebSocket } from "@/services/websocketService";
import type { WorkerLocation, TrackingStatus } from "@/types/location-tracking";

interface LocationTrackingState {
  isConnected: boolean;
  isTracking: boolean;
  currentAssignmentId: number | null;
  currentRoomId: number | null;
  currentUserId: number | null;
  trackingStatuses: Record<number, TrackingStatus>;
  lastKnownLocations: Record<number, WorkerLocation>;
  error: string | null;
  isLoading: boolean;
}

const initialState: LocationTrackingState = {
  isConnected: false,
  isTracking: false,
  currentAssignmentId: null,
  currentRoomId: null,
  currentUserId: null,
  trackingStatuses: {},
  lastKnownLocations: {},
  error: null,
  isLoading: false,
};

// Async thunks
export const connectToWebSocket = createAsyncThunk(
  "locationTracking/connect",
  async ({
    userId,
    roomId,
    userType,
  }: {
    userId: number;
    roomId: number;
    userType: "worker" | "user";
  }) => {
    return new Promise<void>((resolve, reject) => {
      locationTrackingWebSocket.connect(userId, roomId, userType, {
        onConnected: () => resolve(),
        onError: (error) => reject(new Error(error)),
      });
    });
  }
);

export const disconnectFromWebSocket = createAsyncThunk(
  "locationTracking/disconnect",
  async () => {
    locationTrackingWebSocket.disconnect();
  }
);

export const startLocationTracking = createAsyncThunk(
  "locationTracking/startTracking",
  async (assignmentId: number) => {
    locationTrackingWebSocket.startLocationTracking(assignmentId);
    return assignmentId;
  }
);

export const stopLocationTracking = createAsyncThunk(
  "locationTracking/stopTracking",
  async (assignmentId: number) => {
    locationTrackingWebSocket.stopLocationTracking(assignmentId);
    return assignmentId;
  }
);

const locationTrackingSlice = createSlice({
  name: "locationTracking",
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setTrackingStatus: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setCurrentAssignment: (state, action: PayloadAction<number | null>) => {
      state.currentAssignmentId = action.payload;
    },
    updateLocation: (state, action: PayloadAction<WorkerLocation>) => {
      const location = action.payload;
      console.log("Location update:", {
        location,
        assignmentId: location.assignment_id,
        workerId: location.worker_id,
        coordinates: `${location.latitude}, ${location.longitude}`,
      });

      // Validate location data
      if (
        !location ||
        typeof location !== "object" ||
        !location.assignment_id ||
        !location.worker_id ||
        typeof location.latitude !== "number" ||
        typeof location.longitude !== "number"
      ) {
        console.error("[Redux] Invalid location data received:", location);
        return;
      }

      state.lastKnownLocations[location.assignment_id] = location;
      console.log(
        "[Redux] Location stored in state for assignment",
        location.assignment_id
      );

      // Update tracking status if this is the current assignment
      if (state.currentAssignmentId === location.assignment_id) {
        state.trackingStatuses[location.assignment_id] = {
          assignmentId: location.assignment_id,
          isTracking: true,
          lastLocation: location,
          trackingStartedAt:
            state.trackingStatuses[location.assignment_id]?.trackingStartedAt ||
            new Date().toISOString(),
        };
        console.log(
          "[Redux] Tracking status updated for assignment",
          location.assignment_id
        );
      }
    },
    updateTrackingStatus: (
      state,
      action: PayloadAction<{ assignmentId: number; status: TrackingStatus }>
    ) => {
      const { assignmentId, status } = action.payload;
      state.trackingStatuses[assignmentId] = status;

      if (status.isTracking) {
        state.currentAssignmentId = assignmentId;
        state.isTracking = true;
      } else if (state.currentAssignmentId === assignmentId) {
        state.currentAssignmentId = null;
        state.isTracking = false;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    resetState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectToWebSocket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectToWebSocket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isConnected = true;
        state.currentUserId = action.meta.arg.userId;
        state.currentRoomId = action.meta.arg.roomId;
      })
      .addCase(connectToWebSocket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to connect to WebSocket";
        state.isConnected = false;
      })
      .addCase(disconnectFromWebSocket.fulfilled, (state) => {
        state.isConnected = false;
        state.isTracking = false;
        state.currentAssignmentId = null;
        state.currentRoomId = null;
        state.currentUserId = null;
        state.trackingStatuses = {};
        state.lastKnownLocations = {};
      })
      .addCase(startLocationTracking.fulfilled, (state, action) => {
        const assignmentId = action.payload;
        state.isTracking = true;
        state.currentAssignmentId = assignmentId;

        // Initialize tracking status
        if (!state.trackingStatuses[assignmentId]) {
          state.trackingStatuses[assignmentId] = {
            assignmentId,
            isTracking: true,
            trackingStartedAt: new Date().toISOString(),
          };
        } else {
          state.trackingStatuses[assignmentId].isTracking = true;
          state.trackingStatuses[assignmentId].trackingStartedAt =
            new Date().toISOString();
        }
      })
      .addCase(stopLocationTracking.fulfilled, (state, action) => {
        const assignmentId = action.payload;
        state.isTracking = false;

        if (state.currentAssignmentId === assignmentId) {
          state.currentAssignmentId = null;
        }

        if (state.trackingStatuses[assignmentId]) {
          state.trackingStatuses[assignmentId].isTracking = false;
        }
      });
  },
});

export const {
  setConnectionStatus,
  setTrackingStatus,
  setCurrentAssignment,
  updateLocation,
  updateTrackingStatus,
  clearError,
  setError,
  resetState,
} = locationTrackingSlice.actions;

export default locationTrackingSlice.reducer;
