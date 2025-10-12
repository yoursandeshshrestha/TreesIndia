"use client";

import { X } from "lucide-react";
import { ProjectFilters } from "@/types/project";

interface ProjectsSidebarProps {
  filters: ProjectFilters;
  onFilterChange: (
    key: keyof ProjectFilters,
    value: string | number | boolean | undefined
  ) => void;
  onClearFilters: () => void;
  selectedProjectTypes: string[];
  onProjectTypeToggle: (projectType: string) => void;
  selectedStatuses: string[];
  onStatusToggle: (status: string) => void;
  onCloseMobileFilters?: () => void;
  showMobileFilters?: boolean;
}

export function ProjectsSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  selectedProjectTypes,
  onProjectTypeToggle,
  selectedStatuses,
  onStatusToggle,
  onCloseMobileFilters,
  showMobileFilters,
}: ProjectsSidebarProps) {
  // Count active filters (excluding default ones)
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedProjectTypes.length > 0) count++;
    if (selectedStatuses.length > 0) count++;
    if (filters.location) count++;
    if (filters.uploaded_by_admin) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div
      className={`bg-white ${
        showMobileFilters ? "h-full" : ""
      } lg:border lg:border-gray-200 lg:rounded-lg p-4 sm:p-6`}
    >
      {/* Mobile Header */}
      {showMobileFilters && onCloseMobileFilters && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 lg:hidden">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onCloseMobileFilters}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm sm:text-base font-medium text-gray-900">
              Applied Filters
            </h3>
          </div>
          <button
            onClick={onClearFilters}
            className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            {selectedProjectTypes.map((projectType) => (
              <span
                key={projectType}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium bg-green-100 text-green-800 rounded-full"
              >
                {projectType}
                <button
                  onClick={() => onProjectTypeToggle(projectType)}
                  className="ml-1.5 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedStatuses.map((status) => (
              <span
                key={status}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium bg-green-100 text-green-800 rounded-full"
              >
                {status}
                <button
                  onClick={() => onStatusToggle(status)}
                  className="ml-1.5 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.uploaded_by_admin && (
              <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Assured by Trees India
                <button
                  onClick={() => onFilterChange("uploaded_by_admin", undefined)}
                  className="ml-1.5 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-5 sm:space-y-6">
        {/* Project Type */}
        <div>
          <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">
            Project Type
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Residential", value: "residential" },
              { label: "Commercial", value: "commercial" },
              { label: "Infrastructure", value: "infrastructure" },
            ].map((option) => {
              const isSelected = selectedProjectTypes.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => onProjectTypeToggle(option.value)}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-full border transition-colors duration-200 whitespace-nowrap ${
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

        {/* Project Status */}
        <div>
          <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">
            Project Status
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Starting Soon", value: "starting_soon" },
              { label: "On Going", value: "on_going" },
              { label: "Completed", value: "completed" },
              { label: "On Hold", value: "on_hold" },
              { label: "Cancelled", value: "cancelled" },
            ].map((option) => {
              const isSelected = selectedStatuses.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => onStatusToggle(option.value)}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-full border transition-colors duration-200 whitespace-nowrap ${
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
