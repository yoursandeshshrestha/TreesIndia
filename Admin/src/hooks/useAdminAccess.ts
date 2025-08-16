import { useAuth, useCurrentUser } from "@/services/api/auth";
import { authUtils } from "@/services/api/auth";

export const useAdminAccess = () => {
  const {
    data: authData,
    isLoading: authLoading,
    error: authError,
  } = useAuth();
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  const isAdmin = () => {
    const user = authUtils.getUser();
    return user?.role === "admin";
  };

  const isLoading = authLoading || userLoading;
  const hasError = authError || userError;

  return {
    isAdmin: isAdmin(),
    isLoading,
    hasError,
    user: authUtils.getUser(),
  };
};
