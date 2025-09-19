"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Vendor, VendorFilters } from "@/types/vendor";
import { VendorCard } from "@/commonComponents/VendorCard";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { openAuthModal } from "@/store/slices/authModalSlice";
import { openChatModalWithUser } from "@/store/slices/chatModalSlice";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  Plus,
  Building2,
} from "lucide-react";
import { LoadingSpinner } from "@/commonComponents/LoadingSpinner";

interface VendorsContentProps {
  vendors: Vendor[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  filters: VendorFilters;
  selectedBusinessTypes: string[];
  selectedServices: string[];
}

export function VendorsContent({
  vendors,
  pagination,
  isLoading,
  isError,
  error,
  onPageChange,
  onClearFilters,
  filters,
  selectedBusinessTypes,
  selectedServices,
}: VendorsContentProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Relevance");
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleVendorClick = (vendorId: number) => {
    // Validate vendor ID before navigation
    if (!vendorId || vendorId <= 0) {
      console.error("Invalid vendor ID:", vendorId);
      return;
    }
    router.push(`/marketplace/vendors/${vendorId}`);
  };

  const handleCreateVendorProfile = () => {
    if (!isAuthenticated) {
      dispatch(openAuthModal({ redirectTo: "/marketplace/vendors/create" }));
    } else {
      router.push("/marketplace/vendors/create");
    }
  };

  const handleChatClick = (vendor: Vendor) => {
    if (!isAuthenticated || !user) {
      dispatch(openAuthModal({}));
      return;
    }

    dispatch(
      openChatModalWithUser({
        user_1: user.id,
        user_2: vendor.user_id,
      })
    );
  };

  const handleCallClick = (vendor: Vendor) => {
    if (vendor.contact_person_phone) {
      window.open(`tel:${vendor.contact_person_phone}`);
    }
  };

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "name_asc", label: "Name A-Z" },
    { value: "name_desc", label: "Name Z-A" },
  ];

  // Generate dynamic header text based on filters
  const generateHeaderText = () => {
    const totalResults = pagination?.total || 0;
    const parts = [];

    // Add business type info if selected
    if (selectedBusinessTypes.length > 0) {
      const businessTypeText =
        selectedBusinessTypes.length === 1
          ? selectedBusinessTypes[0]
          : selectedBusinessTypes.join(", ");
      parts.push(businessTypeText);
    }

    // Add services if selected
    if (selectedServices.length > 0) {
      const serviceText =
        selectedServices.length === 1
          ? selectedServices[0]
          : selectedServices.join(", ");
      parts.push(serviceText);
    }

    // Add location if available
    if (filters.location) {
      parts.push(`in ${filters.location}`);
    }

    // Add vendor type
    parts.push("vendors");

    const filterText = parts.length > 0 ? parts.join(" ") : "Vendors";
    const resultText = totalResults === 1 ? "result" : "results";

    return `${totalResults.toLocaleString()} ${resultText} | ${filterText}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Failed to Load Vendors
          </h3>
          <p className="text-red-600 mb-6">
            {(error as { message?: string })?.message ||
              "Something went wrong while loading vendors. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {generateHeaderText()}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Create Vendor Profile Button */}
            <button
              onClick={handleCreateVendorProfile}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Vendor Profile</span>
            </button>
          </div>
        </div>

        {/* No Results Message */}
        <div className="text-center py-12">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Vendors Found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find any vendors matching your criteria. Try
              adjusting your search filters or check back later.
            </p>
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {generateHeaderText()}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Options */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Sort by: {selectedSort}
                </span>
                <ChevronUp
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    isSortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <div key={option.value} className="relative">
                        <button
                          onClick={() => {
                            setSelectedSort(option.label);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between text-gray-700 transition-colors duration-150 ${
                            selectedSort === option.label
                              ? "bg-green-50 text-green-700 font-medium"
                              : ""
                          }`}
                        >
                          <span>{option.label}</span>
                          {selectedSort === option.label && (
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Create Vendor Profile Button */}
            <button
              onClick={handleCreateVendorProfile}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Vendor Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.map((vendor) => (
          <VendorCard
            key={vendor.ID || vendor.id}
            vendor={vendor}
            onClick={handleVendorClick}
            onChatClick={handleChatClick}
            onCallClick={handleCallClick}
            currentUserId={user?.id}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 pt-8">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {Array.from(
              { length: Math.min(5, pagination.total_pages) },
              (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === pagination.page;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-green-600 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}

            {pagination.total_pages > 5 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => onPageChange(pagination.total_pages)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {pagination.total_pages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.total_pages}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-center text-sm text-gray-500 pt-4">
        Page {pagination?.page || 1} of {pagination?.total_pages || 1} • Total{" "}
        {pagination?.total || 0} vendors found
      </div>
    </div>
  );
}
