"use client";

import { useState, useEffect } from "react";
import { useWorkers, useWorkerStats } from "@/hooks/useWorkers";
import { useProfile } from "@/hooks/useProfile";
import { WorkerFilters } from "@/types/worker";
import { Filter } from "lucide-react";
import { WorkersSidebar, WorkersContent } from "./components";
import { SubscriptionRequired } from "@/commonComponents/SubscriptionRequired";

export default function WorkersPage() {
  const [filters, setFilters] = useState<WorkerFilters>({
    page: 1,
    limit: 12,
    is_active: true,
  });
  const [selectedWorkerTypes, setSelectedWorkerTypes] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // First, fetch user profile to check subscription status
  const { userProfile, isLoadingProfile } = useProfile();

  // Check if user has active subscription
  const hasActiveSubscription = userProfile?.subscription?.status === "active";

  // Fetch worker stats (always fetch, even without subscription to show in UI)
  const { data: statsResponse } = useWorkerStats(true);

  // Only fetch workers if user has active subscription
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useWorkers(filters, hasActiveSubscription);

  const workers = response?.data?.workers || [];
  const pagination = response?.data?.pagination;

  // Ensure this only runs on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update filters when selectedWorkerTypes or selectedSkills change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      worker_type:
        selectedWorkerTypes.length === 1
          ? (selectedWorkerTypes[0] as "normal" | "treesindia_worker")
          : undefined,
      skills: selectedSkills.length > 0 ? selectedSkills.join(",") : undefined,
      page: 1, // Reset to first page when filters change
    }));
  }, [selectedWorkerTypes, selectedSkills]);

  // Always show loading state during SSR and initial client render
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
        title="Subscription Required for Workers"
        description="You need an active subscription to view and access worker profiles."
        features={[
          "Access to detailed worker information",
          "Contact details of workers",
          "Skills and experience details",
          "Availability and ratings",
          "Priority customer support",
        ]}
        workerStats={statsResponse?.data}
      />
    );
  }

  const handleFilterChange = (
    key: keyof WorkerFilters,
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

  const handleWorkerTypeToggle = (workerType: string) => {
    setSelectedWorkerTypes((prev) => {
      if (prev.includes(workerType)) {
        return prev.filter((type) => type !== workerType);
      } else {
        return [...prev, workerType];
      }
    });
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      is_active: true,
    });
    setSelectedWorkerTypes([]);
    setSelectedSkills([]);
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1, // Reset to first page when sorting changes
    }));
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 sm:mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div
            className={`${
              showMobileFilters
                ? "fixed inset-0 z-50 overflow-y-auto bg-white lg:relative lg:inset-auto lg:z-auto lg:overflow-visible"
                : "hidden lg:block"
            } lg:w-96 lg:flex-shrink-0`}
          >
            <div className="lg:sticky lg:top-4">
              <WorkersSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                selectedWorkerTypes={selectedWorkerTypes}
                selectedSkills={selectedSkills}
                onWorkerTypeToggle={handleWorkerTypeToggle}
                onSkillToggle={handleSkillToggle}
                onClearFilters={handleClearFilters}
                onCloseMobileFilters={() => setShowMobileFilters(false)}
                showMobileFilters={showMobileFilters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <WorkersContent
              workers={workers}
              pagination={pagination}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onPageChange={handlePageChange}
              onClearFilters={handleClearFilters}
              onSortChange={handleSortChange}
              filters={filters}
              selectedWorkerTypes={selectedWorkerTypes}
              selectedSkills={selectedSkills}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
