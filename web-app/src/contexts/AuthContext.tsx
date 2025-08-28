"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import {
  AuthContextType,
  LoginState,
  AuthUser,
  RequestOTPResponse,
  AuthResponse,
} from "@/types/auth";
import { authAPI } from "@/lib/auth-api";

// Action types
type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: AuthUser }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "LOGOUT" }
  | { type: "SET_AUTHENTICATED"; payload: boolean };

// Initial state
const initialState: LoginState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer function
const authReducer = (state: LoginState, action: AuthAction): LoginState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        // First check if we have any tokens
        const hasTokens = authAPI.hasTokens();

        if (!hasTokens) {
          dispatch({ type: "SET_AUTHENTICATED", payload: false });
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }

        // Then validate tokens and refresh if needed
        const isAuth = await authAPI.isAuthenticated();

        // Check if user is authenticated
        if (isAuth) {
          try {
            // Try to get current user
            const user = await authAPI.getCurrentUser();
            dispatch({ type: "SET_USER", payload: user });
          } catch {
            // If getting user fails, try to refresh token
            try {
              await authAPI.refreshToken();
              const user = await authAPI.getCurrentUser();
              dispatch({ type: "SET_USER", payload: user });
            } catch {
              // If refresh also fails, logout user
              await authAPI.logout();
              dispatch({ type: "LOGOUT" });
            }
          }
        } else {
          dispatch({ type: "SET_AUTHENTICATED", payload: false });
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch {
        // If token is invalid, clear it
        await authAPI.logout();
        dispatch({ type: "LOGOUT" });
      }
    };

    initializeAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await authAPI.refreshToken();
        // Optionally refresh user data
        const user = await authAPI.getCurrentUser();
        dispatch({ type: "SET_USER", payload: user });
      } catch {
        // If refresh fails, logout user
        await authAPI.logout();
        dispatch({ type: "LOGOUT" });
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes (tokens expire in 1 hour)

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated]);

  // Request OTP
  const requestOTP = useCallback(
    async (phone: string): Promise<RequestOTPResponse> => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "CLEAR_ERROR" });

        const response = await authAPI.requestOTP(phone);
        dispatch({ type: "SET_LOADING", payload: false });
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to request OTP";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        dispatch({ type: "SET_LOADING", payload: false });
        throw error;
      }
    },
    []
  );

  // Verify OTP
  const verifyOTP = useCallback(
    async (phone: string, otp: string): Promise<AuthResponse> => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "CLEAR_ERROR" });

        const response = await authAPI.verifyOTP(phone, otp);
        dispatch({ type: "SET_USER", payload: response.user });
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to verify OTP";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        dispatch({ type: "SET_LOADING", payload: false });
        throw error;
      }
    },
    []
  );

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error(error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  // Refresh token manually
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const response = await authAPI.refreshToken();
      dispatch({ type: "SET_USER", payload: response.user });
    } catch (error) {
      await authAPI.logout();
      dispatch({ type: "LOGOUT" });
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    requestOTP,
    verifyOTP,
    logout,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
