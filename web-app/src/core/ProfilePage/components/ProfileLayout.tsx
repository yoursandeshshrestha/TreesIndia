"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { ProfileSidebar } from "./ProfileSidebar";
import { Menu, X } from "lucide-react";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const dispatch = useAppDispatch();
  const [isClient, setIsClient] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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

  // Close mobile sidebar when pathname changes
  useEffect(() => {
    setShowMobileSidebar(false);
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
      {/* Mobile Menu Button */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          {showMobileSidebar ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
          <span className="font-medium">Profile Menu</span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 py-8 px-4">
        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block">
          <ProfileSidebar />
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`lg:hidden fixed top-0 left-0 z-50 h-full w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            showMobileSidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Menu
              </h2>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProfileSidebar
              onCloseMobileSidebar={() => setShowMobileSidebar(false)}
            />
          </div>
        </div>

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
