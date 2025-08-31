import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  workerAssignmentApi,
  type WorkerAssignment,
  type WorkerAssignmentFilters,
} from "@/lib/workerAssignmentApi";

// State interface
interface WorkerAssignmentState {
  assignments: WorkerAssignment[];
  currentAssignment: WorkerAssignment | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  filters: WorkerAssignmentFilters;
}

// Initial state
const initialState: WorkerAssignmentState = {
  assignments: [],
  currentAssignment: null,
  pagination: null,
  isLoading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchWorkerAssignments = createAsyncThunk(
  "workerAssignment/fetchAssignments",
  async (filters?: WorkerAssignmentFilters) => {
    const response = await workerAssignmentApi.getWorkerAssignments(filters);
    return response;
  }
);

export const fetchWorkerAssignment = createAsyncThunk(
  "workerAssignment/fetchAssignment",
  async (assignmentId: number) => {
    const response = await workerAssignmentApi.getWorkerAssignment(
      assignmentId
    );
    return response.assignment;
  }
);

export const acceptAssignment = createAsyncThunk(
  "workerAssignment/acceptAssignment",
  async ({ assignmentId, notes }: { assignmentId: number; notes?: string }) => {
    const response = await workerAssignmentApi.acceptAssignment(assignmentId, {
      notes,
    });
    return response.assignment;
  }
);

export const rejectAssignment = createAsyncThunk(
  "workerAssignment/rejectAssignment",
  async ({
    assignmentId,
    reason,
    notes,
  }: {
    assignmentId: number;
    reason: string;
    notes?: string;
  }) => {
    const response = await workerAssignmentApi.rejectAssignment(assignmentId, {
      reason,
      notes,
    });
    return response.assignment;
  }
);

export const startAssignment = createAsyncThunk(
  "workerAssignment/startAssignment",
  async ({ assignmentId, notes }: { assignmentId: number; notes?: string }) => {
    const response = await workerAssignmentApi.startAssignment(assignmentId, {
      notes,
    });
    return response.assignment;
  }
);

export const completeAssignment = createAsyncThunk(
  "workerAssignment/completeAssignment",
  async ({ assignmentId, notes }: { assignmentId: number; notes?: string }) => {
    const response = await workerAssignmentApi.completeAssignment(
      assignmentId,
      { notes }
    );
    return response.assignment;
  }
);

// Slice
const workerAssignmentSlice = createSlice({
  name: "workerAssignment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.assignments = [];
      state.currentAssignment = null;
      state.pagination = null;
      state.isLoading = false;
      state.error = null;
      state.filters = {};
    },
    setFilters: (state, action: PayloadAction<WorkerAssignmentFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    // Fetch assignments
    builder
      .addCase(fetchWorkerAssignments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkerAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = action.payload.data.assignments;
        state.pagination = action.payload.data.pagination;
        state.error = null;
      })
      .addCase(fetchWorkerAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch assignments";
      });

    // Fetch single assignment
    builder
      .addCase(fetchWorkerAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkerAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAssignment = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkerAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch assignment";
      });

    // Accept assignment
    builder
      .addCase(acceptAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the assignment in the list
        const index = state.assignments.findIndex(
          (a) => a.ID === action.payload.ID
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        // Update current assignment if it's the same
        if (state.currentAssignment?.ID === action.payload.ID) {
          state.currentAssignment = action.payload;
        }
        state.error = null;
      })
      .addCase(acceptAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to accept assignment";
      });

    // Reject assignment
    builder
      .addCase(rejectAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the assignment in the list
        const index = state.assignments.findIndex(
          (a) => a.ID === action.payload.ID
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        // Update current assignment if it's the same
        if (state.currentAssignment?.ID === action.payload.ID) {
          state.currentAssignment = action.payload;
        }
        state.error = null;
      })
      .addCase(rejectAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to reject assignment";
      });

    // Start assignment
    builder
      .addCase(startAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the assignment in the list
        const index = state.assignments.findIndex(
          (a) => a.ID === action.payload.ID
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        // Update current assignment if it's the same
        if (state.currentAssignment?.ID === action.payload.ID) {
          state.currentAssignment = action.payload;
        }
        state.error = null;
      })
      .addCase(startAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to start assignment";
      });

    // Complete assignment
    builder
      .addCase(completeAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the assignment in the list
        const index = state.assignments.findIndex(
          (a) => a.ID === action.payload.ID
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        // Update current assignment if it's the same
        if (state.currentAssignment?.ID === action.payload.ID) {
          state.currentAssignment = action.payload;
        }
        state.error = null;
      })
      .addCase(completeAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to complete assignment";
      });
  },
});

export const {
  clearError,
  clearSuccess,
  resetState,
  setFilters,
  clearFilters,
} = workerAssignmentSlice.actions;
export default workerAssignmentSlice.reducer;
