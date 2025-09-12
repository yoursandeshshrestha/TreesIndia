"use client";

import { useState } from "react";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFilters } from "@/types/property";
import { Filter, X } from "lucide-react";
import { RentalPropertiesSidebar, RentalPropertiesContent } from "./components";

export default function RentalPropertiesPage() {
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 12,
    is_approved: true,
    status: "available",
  });
  const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    []
  );
  const [selectedFurnishingStatus, setSelectedFurnishingStatus] = useState<
    string[]
  >([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Note: Not auto-populating city and state from user's location
  // Users need to manually select location through filters if needed

  const { data: response, isLoading, error, isError } = useProperties(filters);

  const properties = response?.data || [];
  const pagination = response?.pagination;

  const handleFilterChange = (
    key: keyof PropertyFilters,
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

  const handleBedroomToggle = (bedroomCount: number) => {
    setSelectedBedrooms((prev) => {
      if (prev.includes(bedroomCount)) {
        return prev.filter((b) => b !== bedroomCount);
      } else {
        return [...prev, bedroomCount];
      }
    });
  };

  const handlePropertyTypeToggle = (propertyType: string) => {
    setSelectedPropertyTypes((prev) => {
      if (prev.includes(propertyType)) {
        return prev.filter((p) => p !== propertyType);
      } else {
        return [...prev, propertyType];
      }
    });
  };

  const handleFurnishingStatusToggle = (furnishingStatus: string) => {
    setSelectedFurnishingStatus((prev) => {
      if (prev.includes(furnishingStatus)) {
        return prev.filter((f) => f !== furnishingStatus);
      } else {
        return [...prev, furnishingStatus];
      }
    });
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      is_approved: true,
      status: "available",
    });
    setSelectedBedrooms([]);
    setSelectedPropertyTypes([]);
    setSelectedFurnishingStatus([]);
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

            <RentalPropertiesSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              selectedBedrooms={selectedBedrooms}
              onBedroomToggle={handleBedroomToggle}
              selectedPropertyTypes={selectedPropertyTypes}
              onPropertyTypeToggle={handlePropertyTypeToggle}
              selectedFurnishingStatus={selectedFurnishingStatus}
              onFurnishingStatusToggle={handleFurnishingStatusToggle}
            />
          </div>

          {/* Right Content - Property Listings */}
          <div className="flex-1">
            <RentalPropertiesContent
              properties={properties}
              pagination={pagination}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onPageChange={handlePageChange}
              onClearFilters={handleClearFilters}
              filters={filters}
              selectedBedrooms={selectedBedrooms}
              selectedPropertyTypes={selectedPropertyTypes}
              selectedFurnishingStatus={selectedFurnishingStatus}
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
