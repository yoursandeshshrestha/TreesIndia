import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  BrokerApplicationState,
  BrokerApplicationRequest,
  BrokerApplicationDetail,
} from "@/types/broker-application";
import { brokerApplicationApi } from "@/lib/brokerApplicationApi";

const initialState: BrokerApplicationState = {
  isLoading: false,
  error: null,
  success: false,
  application: null,
};

// Async thunk for submitting broker application
export const submitBrokerApplication = createAsyncThunk(
  "brokerApplication/submit",
  async (applicationData: BrokerApplicationRequest) => {
    const response = await brokerApplicationApi.submitBrokerApplication(
      applicationData
    );
    return response.data;
  }
);

// Async thunk for getting user's current application
export const getUserBrokerApplication = createAsyncThunk(
  "brokerApplication/getUser",
  async () => {
    const response = await brokerApplicationApi.getUserApplication();
    return response.data;
  }
);

const brokerApplicationSlice = createSlice({
  name: "brokerApplication",
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
    // Submit application
    builder
      .addCase(submitBrokerApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitBrokerApplication.fulfilled, (state, action: PayloadAction<BrokerApplicationDetail>) => {
        state.isLoading = false;
        state.success = true;
        state.application = action.payload;
        state.error = null;
      })
      .addCase(submitBrokerApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to submit broker application";
        state.success = false;
      });

    // Get user application
    builder
      .addCase(getUserBrokerApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserBrokerApplication.fulfilled, (state, action: PayloadAction<BrokerApplicationDetail>) => {
        state.isLoading = false;
        state.application = action.payload;
        state.error = null;
      })
      .addCase(getUserBrokerApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to get user application";
      });
  },
});

export const { clearError, clearSuccess, resetState } = brokerApplicationSlice.actions;
export default brokerApplicationSlice.reducer;
