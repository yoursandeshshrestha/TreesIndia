"use client";

import { useState, useEffect } from "react";
import { useVendors, useVendorStats } from "@/hooks/useVendors";
import { useProfile } from "@/hooks/useProfile";
import { VendorFilters } from "@/types/vendor";
import { Filter } from "lucide-react";
import { VendorsSidebar, VendorsContent } from "./components";
import { SubscriptionRequired } from "@/commonComponents/SubscriptionRequired";

export default function VendorsPage() {
  const [filters, setFilters] = useState<VendorFilters>({
    page: 1,
    limit: 12,
    is_active: true,
  });
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>(
    []
  );
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
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

  // Fetch vendor stats (always fetch, even without subscription to show in UI)
  const { data: statsResponse } = useVendorStats(true);

  // Only fetch vendors if user has active subscription
  const {
    data: response,
    isLoading,
    error,
    isError,
  } = useVendors(filters, hasActiveSubscription);

  const vendors = Array.isArray(response?.data?.vendors)
    ? response.data.vendors
    : [];
  const pagination = response?.data?.pagination;

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
        title="Subscription Required for Vendors"
        description="You need an active subscription to view and access vendor profiles."
        features={[
          "Access to detailed vendor information",
          "Contact details of vendors",
          "Business gallery and portfolio",
          "Service offerings and pricing",
          "Priority customer support",
        ]}
        vendorStats={statsResponse?.data}
      />
    );
  }

  const handleFilterChange = (
    key: keyof VendorFilters,
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

  const handleBusinessTypeToggle = (businessType: string) => {
    setSelectedBusinessTypes((prev) => {
      if (prev.includes(businessType)) {
        return prev.filter((type) => type !== businessType);
      } else {
        return [...prev, businessType];
      }
    });
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      is_active: true,
    });
    setSelectedBusinessTypes([]);
    setSelectedServices([]);
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
              <VendorsSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                selectedBusinessTypes={selectedBusinessTypes}
                selectedServices={selectedServices}
                onBusinessTypeToggle={handleBusinessTypeToggle}
                onServiceToggle={handleServiceToggle}
                onClearFilters={handleClearFilters}
                onCloseMobileFilters={() => setShowMobileFilters(false)}
                showMobileFilters={showMobileFilters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <VendorsContent
              vendors={vendors}
              pagination={pagination}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onPageChange={handlePageChange}
              onClearFilters={handleClearFilters}
              filters={filters}
              selectedBusinessTypes={selectedBusinessTypes}
              selectedServices={selectedServices}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
