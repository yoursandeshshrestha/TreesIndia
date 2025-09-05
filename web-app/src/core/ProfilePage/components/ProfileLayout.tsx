"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { ProfileSidebar } from "./ProfileSidebar";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const dispatch = useAppDispatch();
  const [isClient, setIsClient] = useState(false);

  // Set client flag after mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    // Wait for auth loading to complete before checking authentication
    if (!authLoading && !isAuthenticated) {
      // Open auth modal with redirect back to this page after login
      dispatch(openAuthModal({ redirectTo: `/profile` }));
      // Redirect to home page as fallback
      router.push("/");
    }
  }, [isAuthenticated, authLoading, dispatch, router]);

  // Scroll to top when pathname changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // Show loading state only if user is not authenticated (not during auth loading)
  if (isClient && !authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex gap-6 py-8 px-4">
        {/* Left Sidebar */}
        <ProfileSidebar />

        {/* Main Content Area */}
        <div
          className="flex-1 bg-white border border-gray-200 rounded-lg p-6"
          id="profile-content"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
