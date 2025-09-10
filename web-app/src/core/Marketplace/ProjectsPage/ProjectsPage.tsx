"use client";

import { useState } from "react";
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

  // First, fetch user profile to check subscription status
  const { userProfile, isLoadingProfile } = useProfile();

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

  // Show loading state while checking profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <div
            className={`lg:w-96 flex-shrink-0 ${
              showMobileFilters ? "block" : "hidden lg:block"
            }`}
          >
            {/* Mobile Filter Header */}
            {showMobileFilters && (
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <ProjectsSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              selectedProjectTypes={selectedProjectTypes}
              onProjectTypeToggle={handleProjectTypeToggle}
              selectedStatuses={selectedStatuses}
              onStatusToggle={handleStatusToggle}
              onCloseMobileFilters={() => setShowMobileFilters(false)}
            />
          </div>

          {/* Right Content - Project Listings */}
          <div className="flex-1">
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

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
        )}
      </div>
    </div>
  );
}
