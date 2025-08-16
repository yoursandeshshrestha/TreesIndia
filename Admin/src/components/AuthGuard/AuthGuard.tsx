"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCurrentUser } from "@/services/api/auth";
import { authUtils } from "@/services/api/auth";
import { Loader2 } from "lucide-react";
import { autoSignOut } from "@/utils/authUtils";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAdmin = false,
  fallback,
}) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

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

        // Check admin requirement
        if (requireAdmin) {
          const user = authUtils.getUser();
          if (!user || user.role !== "admin") {
            // Auto sign out non-admin users
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
  }, [router, requireAdmin, authLoading, userLoading, authError, userError]);

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
