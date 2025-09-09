"use client";

import { MapPin, X } from "lucide-react";
import { PropertyFilters } from "@/types/property";
import { Toggle } from "@/commonComponents/Toggle";
import { Slider } from "@mui/material";

interface RentalPropertiesSidebarProps {
  filters: PropertyFilters;
  onFilterChange: (
    key: keyof PropertyFilters,
    value: string | number | boolean | undefined
  ) => void;
  onClearFilters: () => void;
  selectedBedrooms: number[];
  onBedroomToggle: (bedroomCount: number) => void;
  selectedPropertyTypes: string[];
  onPropertyTypeToggle: (propertyType: string) => void;
  selectedFurnishingStatus: string[];
  onFurnishingStatusToggle: (furnishingStatus: string) => void;
}

export function RentalPropertiesSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  selectedBedrooms,
  onBedroomToggle,
  selectedPropertyTypes,
  onPropertyTypeToggle,
  selectedFurnishingStatus,
  onFurnishingStatusToggle,
}: RentalPropertiesSidebarProps) {
  // Count active filters (excluding default ones)
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.listing_type) count++;
    if (selectedPropertyTypes.length > 0) count++;
    if (selectedBedrooms.length > 0) count++;
    if (selectedFurnishingStatus.length > 0) count++;
    if (filters.min_price) count++;
    if (filters.max_price) count++;
    if (filters.min_area) count++;
    if (filters.max_area) count++;
    if (filters.location) count++;
    if (filters.uploaded_by_admin) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 sticky top-4 z-50 lg:z-auto">
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
            {filters.listing_type && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {filters.listing_type === "rent" ? "Rental" : "Properties"}
                <button
                  onClick={() => onFilterChange("listing_type", undefined)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPropertyTypes.map((propertyType) => (
              <span
                key={propertyType}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
              >
                {propertyType}
                <button
                  onClick={() => onPropertyTypeToggle(propertyType)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedBedrooms.map((bedroom) => (
              <span
                key={bedroom}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
              >
                + {bedroom} BHK
                <button
                  onClick={() => onBedroomToggle(bedroom)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedFurnishingStatus.map((furnishingStatus) => (
              <span
                key={furnishingStatus}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
              >
                {furnishingStatus}
                <button
                  onClick={() => onFurnishingStatusToggle(furnishingStatus)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.uploaded_by_admin && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Assured by Trees India
                <button
                  onClick={() => onFilterChange("uploaded_by_admin", undefined)}
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
        {/* Property Type Tabs */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">
            Property Type
          </h4>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onFilterChange("listing_type", undefined)}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                !filters.listing_type
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => onFilterChange("listing_type", "sale")}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                filters.listing_type === "sale"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => onFilterChange("listing_type", "rent")}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                filters.listing_type === "rent"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Rental
            </button>
          </div>
        </div>

        {/* Assured by Trees India Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Assured by Trees India
              </h4>
              <p className="text-xs text-gray-500 mt-1 w-[80%]">
                Properties verified and assured by our team
              </p>
            </div>
            <Toggle
              checked={filters.uploaded_by_admin || false}
              onChange={(checked) =>
                onFilterChange("uploaded_by_admin", checked || undefined)
              }
              size="sm"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="City, State"
              value={filters.location || ""}
              onChange={(e) => onFilterChange("location", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">
            Property Type
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Residential", value: "residential" },
              { label: "Commercial", value: "commercial" },
            ].map((option) => {
              const isSelected = selectedPropertyTypes.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => onPropertyTypeToggle(option.value)}
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

        {/* Bedrooms */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">
            No. of Bedrooms
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "+ 1 RK/1 BHK", value: "1" },
              { label: "+ 2 BHK", value: "2" },
              { label: "+ 3 BHK", value: "3" },
              { label: "+ 4 BHK", value: "4" },
              { label: "+ 5 BHK", value: "5" },
              { label: "+ 6 BHK", value: "6" },
              { label: "+ 7 BHK", value: "7" },
              { label: "+ 8 BHK", value: "8" },
              { label: "+ 9 BHK", value: "9" },
            ].map((option) => {
              const isSelected = selectedBedrooms.includes(
                parseInt(option.value)
              );
              return (
                <button
                  key={option.value}
                  onClick={() => onBedroomToggle(parseInt(option.value))}
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

        {/* Price Range */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="px-2">
            <Slider
              value={[filters.min_price || 0, filters.max_price || 100000]}
              onChange={(_, newValue) => {
                const [min, max] = newValue as number[];
                onFilterChange("min_price", min);
                onFilterChange("max_price", max);
              }}
              min={0}
              max={100000}
              step={1000}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
              sx={{
                color: "#10b981",
                height: 6,
                "& .MuiSlider-thumb": {
                  height: 20,
                  width: 20,
                  backgroundColor: "#10b981",
                  border: "2px solid #ffffff",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  },
                },
                "& .MuiSlider-track": {
                  border: "none",
                  backgroundColor: "#10b981",
                },
                "& .MuiSlider-rail": {
                  backgroundColor: "#e5e7eb",
                },
                "& .MuiSlider-valueLabel": {
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 500,
                },
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>₹{(filters.min_price || 0).toLocaleString()}</span>
              <span>₹{(filters.max_price || 100000).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Area Range */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Area Range (sq ft)
          </label>
          <div className="px-2">
            <Slider
              value={[filters.min_area || 0, filters.max_area || 5000]}
              onChange={(_, newValue) => {
                const [min, max] = newValue as number[];
                onFilterChange("min_area", min);
                onFilterChange("max_area", max);
              }}
              min={0}
              max={5000}
              step={100}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value.toLocaleString()} sq ft`}
              sx={{
                color: "#10b981",
                height: 6,
                "& .MuiSlider-thumb": {
                  height: 20,
                  width: 20,
                  backgroundColor: "#10b981",
                  border: "2px solid #ffffff",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  },
                },
                "& .MuiSlider-track": {
                  border: "none",
                  backgroundColor: "#10b981",
                },
                "& .MuiSlider-rail": {
                  backgroundColor: "#e5e7eb",
                },
                "& .MuiSlider-valueLabel": {
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 500,
                },
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{(filters.min_area || 0).toLocaleString()} sq ft</span>
              <span>{(filters.max_area || 5000).toLocaleString()} sq ft</span>
            </div>
          </div>
        </div>

        {/* Furnishing Status */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">
            Furnishing Status
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Furnished", value: "furnished" },
              { label: "Semi-Furnished", value: "semi_furnished" },
              { label: "Unfurnished", value: "unfurnished" },
            ].map((option) => {
              const isSelected = selectedFurnishingStatus.includes(
                option.value
              );
              return (
                <button
                  key={option.value}
                  onClick={() => onFurnishingStatusToggle(option.value)}
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
      </div>
    </div>
  );
}
