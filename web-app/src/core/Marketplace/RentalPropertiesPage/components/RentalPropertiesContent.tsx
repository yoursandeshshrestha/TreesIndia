"use client";

import { useRouter } from "next/navigation";
import { HorizontalPropertyCard } from "@/commonComponents/PropertyCard";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
} from "lucide-react";
import {
  Property,
  PropertiesResponse,
  PropertyFilters,
} from "@/types/property";
import { useState, useEffect, useRef } from "react";

interface RentalPropertiesContentProps {
  properties: Property[];
  pagination?: PropertiesResponse["pagination"];
  isLoading: boolean;
  isError: boolean;
  error: any;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
  filters: PropertyFilters;
  selectedBedrooms: number[];
  selectedPropertyTypes: string[];
  selectedFurnishingStatus: string[];
}

export function RentalPropertiesContent({
  properties,
  pagination,
  isLoading,
  isError,
  error,
  onPageChange,
  onClearFilters,
  filters,
  selectedBedrooms,
  selectedPropertyTypes,
  selectedFurnishingStatus,
}: RentalPropertiesContentProps) {
  const router = useRouter();
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

  const handlePropertyClick = (propertyId: number) => {
    router.push(`/marketplace/properties/${propertyId}`);
  };

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "newest", label: "Newest first" },
    { value: "price_low", label: "Price Low to High" },
    { value: "price_high", label: "Price High to Low" },
    { value: "price_per_sqft_low", label: "Price / sq.ft. : Low to High" },
    { value: "price_per_sqft_high", label: "Price / sq.ft. : High to Low" },
  ];

  // Generate dynamic header text based on filters
  const generateHeaderText = () => {
    const totalResults = pagination?.total || 0;
    const parts = [];

    // Add bedroom info if selected
    if (selectedBedrooms.length > 0) {
      const bedroomText =
        selectedBedrooms.length === 1
          ? `${selectedBedrooms[0]} BHK`
          : `${selectedBedrooms.join(", ")} BHK`;
      parts.push(bedroomText);
    }

    // Add property type if selected
    if (selectedPropertyTypes.length > 0) {
      const propertyTypeText =
        selectedPropertyTypes.length === 1
          ? selectedPropertyTypes[0]
          : selectedPropertyTypes.join(", ");
      parts.push(propertyTypeText);
    }

    // Add location if available
    if (filters.location) {
      parts.push(`in ${filters.location}`);
    }

    // Add listing type
    let listingType;
    if (filters.uploaded_by_admin) {
      // When "Assured by Trees India" is applied, always show "rental and properties"
      listingType = "rental and properties";
    } else if (!filters.listing_type) {
      listingType = "rental and properties"; // All
    } else if (filters.listing_type === "sale") {
      listingType = "Properties"; // Properties tab
    } else {
      listingType = "Properties"; // Rental tab
    }
    parts.push(listingType);

    // Add "assured by trees india" if the filter is applied
    if (filters.uploaded_by_admin) {
      parts.push("assured by trees india");
    }

    const filterText = parts.length > 0 ? parts.join(" ") : "Properties";
    const resultText = totalResults === 1 ? "result" : "results";

    return `${totalResults.toLocaleString()} ${resultText} | ${filterText}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-80 h-48 md:h-64 bg-gray-200"></div>
                <div className="flex-1 p-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
                      <div className="h-10 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Failed to Load Properties
          </h3>
          <p className="text-red-600 mb-6">
            {error?.message ||
              "Something went wrong while loading rental properties. Please try again."}
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

  if (properties.length === 0) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {generateHeaderText()}
            </h2>
          </div>
        </div>

        {/* No Results Message */}
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any properties matching your criteria. Try
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {generateHeaderText()}
          </h2>
        </div>

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
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {properties.map((property) => (
          <HorizontalPropertyCard
            key={property.id}
            property={property}
            onClick={() => handlePropertyClick(property.id)}
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
        {pagination?.total || 0} properties found
      </div>
    </div>
  );
}
