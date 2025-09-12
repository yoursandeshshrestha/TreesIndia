"use client";

import { X } from "lucide-react";
import { VendorFilters } from "@/types/vendor";

interface VendorsSidebarProps {
  filters: VendorFilters;
  onFilterChange: (
    key: keyof VendorFilters,
    value: string | number | boolean | undefined
  ) => void;
  onClearFilters: () => void;
  selectedBusinessTypes: string[];
  onBusinessTypeToggle: (businessType: string) => void;
  selectedServices: string[];
  onServiceToggle: (service: string) => void;
  onCloseMobileFilters?: () => void;
}

export function VendorsSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  selectedBusinessTypes,
  onBusinessTypeToggle,
  selectedServices,
  onServiceToggle,
  onCloseMobileFilters,
}: VendorsSidebarProps) {
  // Count active filters (excluding default ones)
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedBusinessTypes.length > 0) count++;
    if (selectedServices.length > 0) count++;
    if (filters.location) count++;
    if (filters.city) count++;
    if (filters.state) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 sticky top-4 z-50 lg:z-auto">
      {/* Mobile Header */}
      {onCloseMobileFilters && (
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onCloseMobileFilters}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-medium text-gray-900">
              Applied Filters
            </h3>
          </div>
          <button
            onClick={onClearFilters}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {selectedBusinessTypes.map((businessType) => (
              <span
                key={businessType}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
              >
                {businessType}
                <button
                  onClick={() => onBusinessTypeToggle(businessType)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedServices.map((service) => (
              <span
                key={service}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
              >
                {service}
                <button
                  onClick={() => onServiceToggle(service)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.location && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {filters.location}
                <button
                  onClick={() => onFilterChange("location", undefined)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.city && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {filters.city}
                <button
                  onClick={() => onFilterChange("city", undefined)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.state && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {filters.state}
                <button
                  onClick={() => onFilterChange("state", undefined)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Business Type */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">
            Business Type
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Individual", value: "individual" },
              { label: "Partnership", value: "partnership" },
              { label: "Company", value: "company" },
              { label: "LLP", value: "llp" },
              { label: "Private Limited", value: "pvt_ltd" },
              { label: "Public Limited", value: "public_ltd" },
              { label: "Other", value: "other" },
            ].map((option) => {
              const isSelected = selectedBusinessTypes.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => onBusinessTypeToggle(option.value)}
                  className={`px-3 py-2 text-xs font-medium rounded-full border transition-colors duration-200 whitespace-nowrap ${
                    isSelected
                      ? "bg-white text-green-600 border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-600"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">Services</h4>
          <div className="flex flex-wrap gap-2">
            {[
              "Plumbing",
              "Electrical",
              "Carpentry",
              "Painting",
              "Cleaning",
              "Gardening",
              "Security",
              "Maintenance",
              "Renovation",
              "Interior Design",
              "Construction",
              "Roofing",
              "Flooring",
              "HVAC",
              "Appliance Repair",
            ].map((service) => {
              const isSelected = selectedServices.includes(service);
              return (
                <button
                  key={service}
                  onClick={() => onServiceToggle(service)}
                  className={`px-3 py-2 text-xs font-medium rounded-full border transition-colors duration-200 whitespace-nowrap ${
                    isSelected
                      ? "bg-white text-green-600 border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-600"
                  }`}
                >
                  {service}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">Location</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search by location..."
              value={filters.location || ""}
              onChange={(e) =>
                onFilterChange("location", e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City"
                value={filters.city || ""}
                onChange={(e) =>
                  onFilterChange("city", e.target.value || undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="State"
                value={filters.state || ""}
                onChange={(e) =>
                  onFilterChange("state", e.target.value || undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
