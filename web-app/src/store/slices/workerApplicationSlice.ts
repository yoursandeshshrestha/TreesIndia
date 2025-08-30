import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  WorkerApplicationState,
  WorkerApplicationRequest,
  WorkerApplicationDetail,
} from "@/types/worker-application";
import { workerApplicationApi } from "@/lib/workerApplicationApi";

const initialState: WorkerApplicationState = {
  isLoading: false,
  error: null,
  success: false,
  application: null,
};

// Async thunk for submitting worker application
export const submitWorkerApplication = createAsyncThunk(
  "workerApplication/submit",
  async (applicationData: WorkerApplicationRequest) => {
    const response = await workerApplicationApi.submitWorkerApplication(
      applicationData
    );
    return response.data;
  }
);

// Async thunk for getting user's current application
export const getUserApplication = createAsyncThunk(
  "workerApplication/getUserApplication",
  async () => {
    const response = await workerApplicationApi.getUserApplication();
    return response.data;
  }
);

const workerApplicationSlice = createSlice({
  name: "workerApplication",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
      state.application = null;
    },
  },
  extraReducers: (builder) => {
    // Submit worker application
    builder
      .addCase(submitWorkerApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        submitWorkerApplication.fulfilled,
        (state, action: PayloadAction<WorkerApplicationDetail>) => {
          state.isLoading = false;
          state.success = true;
          state.application = action.payload;
          state.error = null;
        }
      )
      .addCase(submitWorkerApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to submit application";
        state.success = false;
      });

    // Get user application
    builder
      .addCase(getUserApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getUserApplication.fulfilled,
        (state, action: PayloadAction<WorkerApplicationDetail>) => {
          state.isLoading = false;
          state.application = action.payload;
          state.error = null;
        }
      )
      .addCase(getUserApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to get application";
      });
  },
});

export const { clearError, clearSuccess, resetState } =
  workerApplicationSlice.actions;
export default workerApplicationSlice.reducer;
