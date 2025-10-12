"use client";

import { useState, useEffect } from "react";
import { useProjects, useProjectStats } from "@/hooks/useProjects";
import { useProfile } from "@/hooks/useProfile";
import { ProjectFilters } from "@/types/project";
import { Filter, X } from "lucide-react";
import { ProjectsSidebar, ProjectsContent } from "./components";
import { SubscriptionRequired } from "@/commonComponents/SubscriptionRequired";

export default function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 12,
  });
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>(
    []
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // First, fetch user profile to check subscription status
  const { userProfile, isLoadingProfile } = useProfile();

  // Fix hydration issues by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscription?.status === "active";

  // Fetch project stats (always fetch, even without subscription to show in UI)
  const { data: statsResponse } = useProjectStats(true);

  // Only fetch projects if user has active subscription
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useProjects(filters, hasActiveSubscription);

  const projects = response?.data || [];
  const pagination = response?.pagination;

  // Show loading state while checking profile or during hydration
  if (!isClient || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show subscription required UI if user doesn't have active subscription
  if (!hasActiveSubscription) {
    return (
      <SubscriptionRequired
        title="Subscription Required for Projects"
        description="You need an active subscription to view and access projects."
        projectStats={statsResponse?.data}
      />
    );
  }

  const handleFilterChange = (
    key: keyof ProjectFilters,
    value: string | number | boolean | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleProjectTypeToggle = (projectType: string) => {
    setSelectedProjectTypes((prev) => {
      if (prev.includes(projectType)) {
        return prev.filter((t) => t !== projectType);
      } else {
        return [...prev, projectType];
      }
    });
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
    });
    setSelectedProjectTypes([]);
    setSelectedStatuses([]);
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 sm:mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Filters */}
          <div
            className={`${
              showMobileFilters
                ? "fixed inset-0 z-50 overflow-y-auto bg-white lg:relative lg:inset-auto lg:z-auto lg:overflow-visible"
                : "hidden lg:block"
            } lg:w-96 lg:flex-shrink-0`}
          >
            <div className="lg:sticky lg:top-4">
              <ProjectsSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                selectedProjectTypes={selectedProjectTypes}
                onProjectTypeToggle={handleProjectTypeToggle}
                selectedStatuses={selectedStatuses}
                onStatusToggle={handleStatusToggle}
                onCloseMobileFilters={() => setShowMobileFilters(false)}
                showMobileFilters={showMobileFilters}
              />
            </div>
          </div>

          {/* Right Content - Project Listings */}
          <div className="flex-1 min-w-0">
            <ProjectsContent
              projects={projects}
              pagination={pagination}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onPageChange={handlePageChange}
              onClearFilters={handleClearFilters}
              filters={filters}
              selectedProjectTypes={selectedProjectTypes}
              selectedStatuses={selectedStatuses}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
