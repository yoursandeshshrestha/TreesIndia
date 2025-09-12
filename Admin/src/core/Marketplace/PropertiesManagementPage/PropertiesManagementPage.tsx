"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useDebounce from "@/hooks/useDebounce";
import Pagination from "@/components/Pagination/Pagination";

// Components
import PropertyHeader from "./components/PropertyHeader";
import PropertyFilters from "./components/PropertyFilters";
import PropertyCards from "./components/PropertyCards";
import PropertyTabs from "./components/PropertyTabs";

// Hooks and types
import { useProperties } from "./hooks/useProperties";
import {
  PropertyFilters as PropertyFiltersType,
  PropertyTabType,
} from "./types";

function PropertiesManagementPage() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filters - simplified to match Services page
  const [filters, setFilters] = useState({
    search: "",
    propertyType: "all",
    listingType: "all",
    status: "all",
    sortBy: "created_at",
    sortOrder: "desc",
    activeTab: "all" as PropertyTabType,
  });

  const {
    properties,
    stats,
    isLoading,
    totalPages,
    fetchProperties,
    fetchStats,
    refreshProperties,
    approveProperty,
    rejectProperty,
  } = useProperties();

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  // Fetch properties when filters change
  useEffect(() => {
    // Convert simplified filters to the format expected by the API
    const apiFilters: PropertyFiltersType = {
      search: filters.search,
      property_type: filters.propertyType === "all" ? "" : filters.propertyType,
      listing_type: filters.listingType === "all" ? "" : filters.listingType,
      status: getStatusFromTab(filters.activeTab, filters.status),
      furnishing_status: "",
      state: "",
      city: "",
      min_price: "",
      max_price: "",
      min_area: "",
      max_area: "",
      bedrooms: "",
      bathrooms: "",
      is_approved: "",
      uploaded_by_admin: "",
      treesindia_assured: getTreesIndiaAssuredFromTab(filters.activeTab),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    fetchProperties(
      apiFilters,
      currentPage,
      itemsPerPage,
      filters.activeTab === "pending" ? "pending" : "all"
    );
  }, [filters, currentPage, itemsPerPage, fetchProperties]);

  // Helper function to get status filter based on active tab
  const getStatusFromTab = (
    activeTab: PropertyTabType,
    currentStatus: string
  ): string => {
    switch (activeTab) {
      case "rented":
        return "rented";
      case "sold":
        return "sold";
      case "pending":
        return ""; // Status filter not needed for pending (handled by API)
      case "treesindia_assured":
        return ""; // Status filter not needed for trees india assured
      case "all":
      default:
        return currentStatus === "all" ? "" : currentStatus;
    }
  };

  // Helper function to get treesindia_assured filter based on active tab
  const getTreesIndiaAssuredFromTab = (activeTab: PropertyTabType): string => {
    switch (activeTab) {
      case "treesindia_assured":
        return "true";
      case "all":
      case "rented":
      case "sold":
      case "pending":
      default:
        return "";
    }
  };

  // Helper function to create API filters from current state
  const createApiFilters = (): PropertyFiltersType => {
    return {
      search: filters.search,
      property_type: filters.propertyType === "all" ? "" : filters.propertyType,
      listing_type: filters.listingType === "all" ? "" : filters.listingType,
      status: getStatusFromTab(filters.activeTab, filters.status),
      furnishing_status: "",
      state: "",
      city: "",
      min_price: "",
      max_price: "",
      min_area: "",
      max_area: "",
      bedrooms: "",
      bathrooms: "",
      is_approved: "",
      uploaded_by_admin: "",
      treesindia_assured: getTreesIndiaAssuredFromTab(filters.activeTab),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
  };

  // Helper function to refresh properties with current state
  const refreshWithCurrentState = async () => {
    const apiFilters = createApiFilters();
    await refreshProperties(
      apiFilters,
      currentPage,
      itemsPerPage,
      filters.activeTab === "pending" ? "pending" : "all"
    );
  };

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const clearFilters = () => {
    setFilters({
      search: "",
      propertyType: "all",
      listingType: "all",
      status: "all",
      sortBy: "created_at",
      sortOrder: "desc",
      activeTab: "all",
    });
    setLocalSearch("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleCreatePropertyClick = () => {
    router.push("/dashboard/marketplace/rental-property/create");
  };

  const handleApproveProperty = async (propertyId: number) => {
    const success = await approveProperty(propertyId);
    if (success) {
      // Refresh the properties list to reflect the changes with current filters and tab state
      await refreshWithCurrentState();
    }
  };

  const handleRejectProperty = async (propertyId: number) => {
    const success = await rejectProperty(propertyId);
    if (success) {
      // Refresh the properties list to reflect the changes with current filters and tab state
      await refreshWithCurrentState();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <PropertyHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        onRefresh={refreshWithCurrentState}
        onCreateProperty={handleCreatePropertyClick}
        isLoading={isLoading}
      />

      {/* Filters - Show for all tabs */}
      <PropertyFilters
        search={localSearch}
        propertyType={filters.propertyType}
        listingType={filters.listingType}
        status={filters.status}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSearchChange={(value) => {
          setLocalSearch(value);
          setIsSearching(true);
        }}
        onPropertyTypeChange={(value) => {
          setFilters((prev) => ({ ...prev, propertyType: value }));
          setCurrentPage(1);
        }}
        onListingTypeChange={(value) => {
          setFilters((prev) => ({ ...prev, listingType: value }));
          setCurrentPage(1);
        }}
        onStatusChange={(value) => {
          setFilters((prev) => ({ ...prev, status: value }));
          setCurrentPage(1);
        }}
        onSortByChange={(value) => {
          setFilters((prev) => ({ ...prev, sortBy: value }));
          setCurrentPage(1);
        }}
        onSortOrderChange={(value) => {
          setFilters((prev) => ({ ...prev, sortOrder: value }));
          setCurrentPage(1);
        }}
        onClear={clearFilters}
        onClearSearch={() => {
          setLocalSearch("");
          setIsSearching(false);
        }}
        isSearching={isSearching}
      />

      {/* Property Tabs - Always show */}
      <PropertyTabs
        activeTab={filters.activeTab}
        onTabChange={(tab) => {
          setFilters((prev) => ({ ...prev, activeTab: tab }));
          setCurrentPage(1);
        }}
        stats={stats || undefined}
      />

      {/* Properties Cards */}
      <div className="mt-4">
        <PropertyCards
          properties={properties}
          isLoading={isLoading}
          onViewProperty={() => {}}
          onApproveProperty={handleApproveProperty}
          onRejectProperty={handleRejectProperty}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
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

export default PropertiesManagementPage;
