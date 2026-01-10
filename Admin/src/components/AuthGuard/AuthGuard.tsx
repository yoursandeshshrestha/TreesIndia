"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCurrentUser, type AdminRole } from "@/services/api/auth";
import { authUtils } from "@/services/api/auth";
import { Loader2 } from "lucide-react";
import { autoSignOut } from "@/utils/authUtils";

interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * @deprecated use requiredRoles instead for fine-grained access control.
   * If true and requiredRoles is not provided, any admin user with at least one admin role is allowed.
   */
  requireAdmin?: boolean;
  requiredRoles?: AdminRole[]; // if provided, user must have at least one of these roles (or be super_admin)
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAdmin = false,
  requiredRoles,
  fallback,
}) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const hasRedirected = useRef(false);
  const authFailureCount = useRef(0);
  const MAX_AUTH_FAILURES = 2;

  const {
    isLoading: authLoading,
    error: authError,
  } = useAuth();
  const {
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  // Helper to handle logout and redirect
  const handleAuthFailure = (reason: string, immediate: boolean = false) => {
    if (hasRedirected.current) return;

    console.error(`Auth failure: ${reason}`);
    authFailureCount.current++;

    // Immediate logout for critical failures
    if (immediate || authFailureCount.current >= MAX_AUTH_FAILURES) {
      console.error(`Forcing logout (${immediate ? 'immediate' : 'max failures reached'})`);
      hasRedirected.current = true;
      authUtils.clearAuth();
      autoSignOut();
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      // Prevent further checks if already redirected
      if (hasRedirected.current) return;

      try {
        // Check if user is authenticated - immediate logout if not
        if (!authUtils.isAuthenticated()) {
          console.warn("No authentication token found - logging out immediately");
          handleAuthFailure("Not authenticated", true); // Immediate logout
          return;
        }

        // If auth is loading, wait (but not indefinitely)
        if (authLoading || userLoading) {
          return;
        }

        // Check for auth errors - immediate redirect
        if (authError || userError) {
          console.error("Auth error detected:", authError || userError);
          handleAuthFailure("Auth or user error", true); // Immediate logout
          return;
        }

        // Check admin/role requirement
        if (requireAdmin || (Array.isArray(requiredRoles) && requiredRoles.length > 0)) {
          const user = authUtils.getUser() as
            | {
                role?: string;
                admin_roles?: AdminRole[];
              }
            | null;

          if (!user || user.role !== "admin") {
            console.warn("User is not admin - logging out immediately");
            handleAuthFailure("Not an admin user", true); // Immediate logout
            return;
          }

          const rolesFromUser = Array.isArray(user.admin_roles)
            ? user.admin_roles
            : [];

          // If specific roles are required, enforce them (super_admin is always allowed)
          if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
            const hasSuperAdmin = rolesFromUser.includes("super_admin");
            const hasRequiredRole = rolesFromUser.some((role) =>
              requiredRoles.includes(role),
            );

            if (!hasSuperAdmin && !hasRequiredRole) {
              console.warn("User missing required roles - logging out immediately");
              handleAuthFailure("Missing required roles", true); // Immediate logout
              return;
            }
          } else if (rolesFromUser.length === 0) {
            // requireAdmin=true but user has no admin roles
            console.warn("User has no admin roles - logging out immediately");
            handleAuthFailure("No admin roles", true); // Immediate logout
            return;
          }
        }

        // If we got here, user has access
        setHasAccess(true);
        setIsChecking(false);
      } catch (error) {
        console.error("AuthGuard error:", error);
        handleAuthFailure("Exception in auth check", true); // Immediate logout
      }
    };

    checkAccess();
  }, [
    router,
    requireAdmin,
    requiredRoles,
    authLoading,
    userLoading,
    authError,
    userError,
  ]);

  // Timeout to prevent infinite loading - force logout after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if ((authLoading || userLoading) && !hasAccess && !hasRedirected.current) {
        console.error("AuthGuard timeout - forcing logout after 5 seconds of loading");
        handleAuthFailure("Timeout", true); // Immediate logout on timeout
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [authLoading, userLoading, hasAccess]);

  // Show loading state
  if ((isChecking || authLoading || userLoading) && !hasRedirected.current) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="mt-6 text-center text-xl font-semibold text-gray-900">
              Verifying access...
            </h2>
          </div>
        </div>
      )
    );
  }

  // Show children if access is granted
  if (hasAccess && !hasRedirected.current) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="mt-6 text-center text-xl font-semibold text-gray-900">
          Redirecting to login...
        </h2>
      </div>
    </div>
  );
};

export default AuthGuard;
