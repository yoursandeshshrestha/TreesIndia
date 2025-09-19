"use client";

import { useEffect, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import Pagination from "@/components/Pagination/Pagination";

// Components
import VendorHeader from "./components/VendorHeader";
import VendorFilters from "./components/VendorFilters";
import VendorCards from "./components/VendorCards";
import VendorTabs from "./components/VendorTabs";
import VendorDetailPage from "./components/VendorDetailPage";

// Hooks and types
import { useVendors } from "./hooks/useVendors";
import {
  VendorFilters as VendorFiltersType,
  VendorTabType,
  Vendor,
} from "./types";

function VendorsManagementPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDetailView, setIsDetailView] = useState(false);

  // Filters - simplified to match Services page
  const [filters, setFilters] = useState({
    search: "",
    businessType: "all",
    state: "",
    city: "",
    isActive: "all",
    sortBy: "created_at",
    sortOrder: "desc",
    activeTab: "all" as VendorTabType,
  });

  const {
    vendors,
    stats,
    isLoading,
    totalPages,
    fetchVendors,
    fetchStats,
    refreshVendors,
    deleteVendor,
    toggleVendorStatus,
  } = useVendors();

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  // Fetch vendors when filters change
  useEffect(() => {
    // Convert simplified filters to the format expected by the API
    const apiFilters: VendorFiltersType = {
      search: filters.search,
      business_type: filters.businessType === "all" ? "" : filters.businessType,
      state: filters.state,
      city: filters.city,
      is_active: getActiveStatusFromTab(filters.activeTab, filters.isActive),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    fetchVendors(
      apiFilters,
      currentPage,
      itemsPerPage
    );
  }, [filters, currentPage, itemsPerPage, fetchVendors]);

  // Helper function to get active status filter based on active tab
  const getActiveStatusFromTab = (
    activeTab: VendorTabType,
    currentIsActive: string
  ): string => {
    switch (activeTab) {
      case "active":
        return "true";
      case "inactive":
        return "false";
      default:
        return currentIsActive === "all" ? "" : currentIsActive;
    }
  };


  // Load stats on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle search with loading state
  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    setFilters((prev) => ({ ...prev, search: "" }));
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: String(value) }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      businessType: "all",
      state: "",
      city: "",
      isActive: "all",
      sortBy: "created_at",
      sortOrder: "desc",
      activeTab: "all",
    });
    setLocalSearch("");
    setCurrentPage(1);
  };

  const handleTabChange = (tab: VendorTabType) => {
    setFilters((prev) => ({ ...prev, activeTab: tab }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refreshVendors(
      {
        search: filters.search,
        business_type:
          filters.businessType === "all" ? "" : filters.businessType,
        state: filters.state,
        city: filters.city,
        is_active: getActiveStatusFromTab(filters.activeTab, filters.isActive),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
      currentPage,
      itemsPerPage
    );
  };

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDetailView(true);
  };

  const handleBackFromDetail = () => {
    setIsDetailView(false);
    setSelectedVendor(null);
  };


  const handleToggleStatus = async (vendorId: number) => {
    await toggleVendorStatus(vendorId);
    handleRefresh();
  };

  const handleDeleteVendor = async (vendorId: number) => {
    await deleteVendor(vendorId);
    handleRefresh();
  };

  // Show detail view
  if (isDetailView && selectedVendor) {
    return (
      <VendorDetailPage
        vendor={selectedVendor}
        onBack={handleBackFromDetail}
        onDelete={() => handleDeleteVendor(selectedVendor.ID)}
        onToggleStatus={() => handleToggleStatus(selectedVendor.ID)}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <VendorHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Filters */}
      <VendorFilters
        search={localSearch}
        businessType={filters.businessType}
        state={filters.state}
        city={filters.city}
        isActive={filters.isActive}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSearchChange={handleSearchChange}
        onBusinessTypeChange={(value) =>
          handleFilterChange("businessType", value)
        }
        onStateChange={(value) => handleFilterChange("state", value)}
        onCityChange={(value) => handleFilterChange("city", value)}
        onIsActiveChange={(value) => handleFilterChange("isActive", value)}
        onSortByChange={(value) => handleFilterChange("sortBy", value)}
        onSortOrderChange={(value) => handleFilterChange("sortOrder", value)}
        onClear={handleClearFilters}
        onClearSearch={handleClearSearch}
        isSearching={isSearching}
      />

      {/* Tabs */}
      <VendorTabs
        activeTab={filters.activeTab}
        onTabChange={handleTabChange}
        stats={stats || undefined}
        isLoading={isLoading}
      />

      {/* Vendor Cards */}
      <VendorCards
        vendors={vendors}
        isLoading={isLoading}
        onViewVendor={handleViewVendor}
        onToggleStatus={handleToggleStatus}
        onDeleteVendor={handleDeleteVendor}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default VendorsManagementPage;
