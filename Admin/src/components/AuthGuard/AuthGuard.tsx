"use client";

import React, { useEffect, useState } from "react";
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

  const {
    isLoading: authLoading,
    error: authError,
  } = useAuth();
  const {
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check if user is authenticated
        if (!authUtils.isAuthenticated()) {
          router.push("/auth/sign-in");
          return;
        }

        // If auth is loading, wait
        if (authLoading || userLoading) {
          return;
        }

        // Check for auth errors
        if (authError || userError) {
          authUtils.clearAuth();
          router.push("/auth/sign-in");
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
            autoSignOut();
            router.push("/auth/sign-in");
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
              autoSignOut();
              router.push("/auth/sign-in");
              return;
            }
          } else if (rolesFromUser.length === 0) {
            // requireAdmin=true but user has no admin roles
            autoSignOut();
            router.push("/auth/sign-in");
            return;
          }
        }

        setHasAccess(true);
      } catch (error) {
        console.error("AuthGuard error:", error);
        authUtils.clearAuth();
        router.push("/auth/sign-in");
      } finally {
        setIsChecking(false);
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

  // Show loading state
  if (isChecking || authLoading || userLoading) {
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
  if (hasAccess) {
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
          Redirecting...
        </h2>
      </div>
    </div>
  );
};

export default AuthGuard;
