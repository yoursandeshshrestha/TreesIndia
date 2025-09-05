import { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  requestOTP,
  verifyOTP,
  logout,
  refreshToken,
  clearError,
  getCurrentUser,
} from "@/store/slices/authSlice";
import { RequestOTPResponse, AuthResponse } from "@/types/auth";

// Custom hook to use auth state and actions
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  // Request OTP
  const handleRequestOTP = useCallback(
    async (phone: string): Promise<RequestOTPResponse> => {
      const result = await dispatch(requestOTP(phone));
      if (requestOTP.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
    },
    [dispatch]
  );

  // Verify OTP
  const handleVerifyOTP = useCallback(
    async (phone: string, otp: string): Promise<AuthResponse> => {
      const result = await dispatch(verifyOTP({ phone, otp }));
      if (verifyOTP.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
    },
    [dispatch]
  );

  // Logout
  const handleLogout = useCallback(async (): Promise<void> => {
    await dispatch(logout());
  }, [dispatch]);

  // Refresh token
  const handleRefreshToken = useCallback(async (): Promise<void> => {
    const result = await dispatch(refreshToken());
    if (refreshToken.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  }, [dispatch]);

  // Clear error
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Get current user
  const handleGetCurrentUser = useCallback(async () => {
    const result = await dispatch(getCurrentUser());
    if (getCurrentUser.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error(result.payload as string);
    }
  }, [dispatch]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await handleRefreshToken();
        // Optionally refresh user data
        await handleGetCurrentUser();
      } catch {
        // If refresh fails, logout user
        await handleLogout();
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes (tokens expire in 1 hour)

    return () => clearInterval(refreshInterval);
  }, [
    authState.isAuthenticated,
    handleRefreshToken,
    handleGetCurrentUser,
    handleLogout,
  ]);

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,

    // Actions
    requestOTP: handleRequestOTP,
    verifyOTP: handleVerifyOTP,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    clearError: handleClearError,
    getCurrentUser: handleGetCurrentUser,
  };
};
