import {
  authUtils as apiAuthUtils,
  type AdminRole,
} from "@/services/api/auth";

/**
 * Automatically signs out a user and clears all authentication data
 * This is used when a non-admin user tries to access admin areas
 */
export const autoSignOut = (): void => {
  performLogout();
};

/**
 * Checks if the current user is an admin
 */
export const isAdminUser = (): boolean => {
  const user = apiAuthUtils.getUser() as
    | {
        role?: string;
        admin_roles?: AdminRole[];
      }
    | null;

  if (!user) {
    return false;
  }

  if (user.role !== "admin") {
    return false;
  }

  if (!Array.isArray(user.admin_roles)) {
    return false;
  }

  return user.admin_roles.length > 0;
};

export const hasAdminRole = (required: AdminRole | AdminRole[]): boolean => {
  const user = apiAuthUtils.getUser() as
    | {
        role?: string;
        admin_roles?: AdminRole[];
      }
    | null;

  if (!user || user.role !== "admin" || !Array.isArray(user.admin_roles)) {
    return false;
  }

  const requiredList: AdminRole[] = Array.isArray(required)
    ? required
    : [required];

  // super_admin always allowed
  if (user.admin_roles.includes("super_admin")) {
    return true;
  }

  return user.admin_roles.some((role) => requiredList.includes(role));
};

/**
 * Checks if the current user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return apiAuthUtils.isAuthenticated();
};

/**
 * Gets the current user data
 */
export const getCurrentUser = () => {
  return apiAuthUtils.getUser();
};

/**
 * Comprehensive logout function that clears all state
 */
export const performLogout = (): void => {
  // Clear all auth data using the API auth utils
  apiAuthUtils.clearAuth();

  // Additional cookie cleanup for extra security
  document.cookie =
    "treesindia_access_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
  document.cookie =
    "treesindia_refresh_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
  document.cookie =
    "treesindia_user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";

  // Clear any localStorage or sessionStorage if used
  if (typeof window !== "undefined") {
    localStorage.removeItem("treesindia_auth");
    sessionStorage.removeItem("treesindia_auth");

    // Clear any other potential auth-related storage
    localStorage.clear();
    sessionStorage.clear();
  }

  // Force a page reload to ensure all state is cleared
  if (typeof window !== "undefined") {
    window.location.href = "/auth/sign-in";
  }
};
