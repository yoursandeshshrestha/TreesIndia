import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import type { RequestOTPRequest, VerifyOTPRequest } from "@/types/auth";

export const useAuth = () => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    requestOTP,
    clearError,
    setLoading,
  } = useAuthStore();

  // Request OTP mutation
  const requestOTPMutation = useMutation({
    mutationFn: (phone: string) => requestOTP(phone),
    onSuccess: () => {
      toast.success("OTP sent successfully!");
    },
    onError: (error: Error) => {
      console.error("OTP request failed:", error);
      toast.error(error.message || "Failed to send OTP");
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      login(phone, otp),
    onSuccess: () => {
      toast.success("Login successful!");
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
      toast.error(error.message || "Login failed");
    },
  });

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading:
      isLoading || requestOTPMutation.isPending || loginMutation.isPending,
    error:
      error ||
      requestOTPMutation.error?.message ||
      loginMutation.error?.message,

    // Actions
    requestOTP: requestOTPMutation.mutate,
    login: loginMutation.mutateAsync, // Changed to mutateAsync for proper async handling
    logout,
    clearError,
    setLoading,

    // Mutation states
    isRequestingOTP: requestOTPMutation.isPending,
    isLoggingIn: loginMutation.isPending,
  };
};
