import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthResponse, RequestOTPResponse } from '../../types/auth';
import { apiClient, tokenStorage } from '../../services';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  hasActiveSubscription: false,
  subscriptionExpiryDate: null,
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const hasTokens = await tokenStorage.hasTokens();

      if (!hasTokens) {
        return { isAuthenticated: false };
      }

      const isAuth = await apiClient.isAuthenticated();

      if (isAuth) {
        try {
          const user = await apiClient.getCurrentUser();
          return { user, isAuthenticated: true };
        } catch {
          try {
            await apiClient.refreshToken();
            const user = await apiClient.getCurrentUser();
            return { user, isAuthenticated: true };
          } catch {
            await apiClient.logout();
            return { isAuthenticated: false };
          }
        }
      } else {
        return { isAuthenticated: false };
      }
    } catch {
      await apiClient.logout();
      return rejectWithValue('Authentication failed');
    }
  }
);

export const requestOTP = createAsyncThunk(
  'auth/requestOTP',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.requestOTP(phone);
      return response as RequestOTPResponse;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to request OTP';
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (
    { phone, otp }: { phone: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.verifyOTP(phone, otp);
      // Fetch complete user profile after OTP verification
      const user = await apiClient.getCurrentUser();
      return { ...response, user } as AuthResponse;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to verify OTP';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await apiClient.logout();
    return true;
  } catch (err) {
    console.error('Logout error:', err);
    return true;
  }
});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.refreshToken();
      return response as AuthResponse;
    } catch {
      await apiClient.logout();
      return rejectWithValue('Token refresh failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await apiClient.getCurrentUser();
      return user;
    } catch {
      return rejectWithValue('Failed to get current user');
    }
  }
);

export const updateSubscriptionStatus = createAsyncThunk(
  'auth/updateSubscriptionStatus',
  async (_, { rejectWithValue }) => {
    try {
      const user = await apiClient.getCurrentUser();
      return {
        hasActiveSubscription: user.has_active_subscription || false,
        subscriptionExpiryDate: user.subscription_expiry_date || null,
      };
    } catch (err) {
      return rejectWithValue('Failed to update subscription status');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.user = null;
        state.isLoading = false;
      }
    },
    updateAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          avatar: action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.hasActiveSubscription = action.payload.user.has_active_subscription || false;
          state.subscriptionExpiryDate = action.payload.user.subscription_expiry_date || null;
        }
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      });

    // Request OTP
    builder
      .addCase(requestOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.hasActiveSubscription = action.payload.user?.has_active_subscription || false;
        state.subscriptionExpiryDate = action.payload.user?.subscription_expiry_date || null;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Refresh token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        // Check both has_active_subscription and subscription === "active"
        const hasActiveSub = action.payload?.has_active_subscription === true || 
                            action.payload?.subscription === 'active';
        state.hasActiveSubscription = hasActiveSub;
        state.subscriptionExpiryDate = action.payload?.subscription_expiry_date || null;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Update subscription status
    builder.addCase(updateSubscriptionStatus.fulfilled, (state, action) => {
      state.hasActiveSubscription = action.payload.hasActiveSubscription;
      state.subscriptionExpiryDate = action.payload.subscriptionExpiryDate;
    });
  },
});

export const { clearError, setLoading, setAuthenticated, updateAvatar } = authSlice.actions;
export default authSlice.reducer;

