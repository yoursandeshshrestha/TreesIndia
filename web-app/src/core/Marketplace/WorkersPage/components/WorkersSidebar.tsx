"use client";

import { X } from "lucide-react";
import { WorkerFilters } from "@/types/worker";
import { Slider } from "@mui/material";

interface WorkersSidebarProps {
  filters: WorkerFilters;
  onFilterChange: (
    key: keyof WorkerFilters,
    value: string | number | boolean | undefined
  ) => void;
  onClearFilters: () => void;
  selectedWorkerTypes: string[];
  onWorkerTypeToggle: (workerType: string) => void;
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  onCloseMobileFilters?: () => void;
}

export function WorkersSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  selectedWorkerTypes,
  onWorkerTypeToggle,
  selectedSkills,
  onSkillToggle,
  onCloseMobileFilters,
}: WorkersSidebarProps) {
  // Count active filters (excluding default ones)
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedWorkerTypes.length > 0) count++;
    if (selectedSkills.length > 0) count++;
    if (filters.min_experience) count++;
    if (filters.max_experience) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const workerTypes = [
    { value: "normal", label: "Independent Workers" },
    { value: "treesindia_worker", label: "TreesIndia Workers" },
  ];

  const commonSkills = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Masonry",
    "Roofing",
    "Flooring",
    "Cleaning",
    "Gardening",
    "Security",
    "Cooking",
    "Driving",
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 sticky top-4 z-50 lg:z-auto">
      {/* Mobile Header */}
      {onCloseMobileFilters && (
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onCloseMobileFilters}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
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
            {selectedWorkerTypes.map((workerType) => (
              <span
                key={workerType}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
              >
                {workerType === "normal"
                  ? "Independent Workers"
                  : "TreesIndia Workers"}
                <button
                  onClick={() => onWorkerTypeToggle(workerType)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
              >
                {skill}
                <button
                  onClick={() => onSkillToggle(skill)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.min_experience && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {filters.min_experience}-{filters.max_experience || 20}y exp
                <button
                  onClick={() => {
                    onFilterChange("min_experience", undefined);
                    onFilterChange("max_experience", undefined);
                  }}
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
        {/* Search */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">
            Search Workers
          </h4>
          <input
            type="text"
            placeholder="Search by name or skills..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Worker Type */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">
            Worker Type
          </h4>
          <div className="flex flex-wrap gap-2">
            {workerTypes.map((type) => {
              const isSelected = selectedWorkerTypes.includes(type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => onWorkerTypeToggle(type.value)}
                  className={`px-3 py-2 text-xs font-medium rounded-full border transition-colors duration-200 whitespace-nowrap ${
                    isSelected
                      ? "bg-white text-green-600 border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-600"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">
            Popular Skills
          </h4>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {commonSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => onSkillToggle(skill)}
                  className={`px-3 py-2 text-xs font-medium rounded-full border transition-colors duration-200 whitespace-nowrap ${
                    isSelected
                      ? "bg-white text-green-600 border-green-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-600"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Range */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Experience Range (Years)
          </label>
          <div className="px-2">
            <Slider
              value={[
                filters.min_experience || 0,
                filters.max_experience || 20,
              ]}
              onChange={(_, newValue) => {
                const [min, max] = newValue as number[];
                onFilterChange("min_experience", min);
                onFilterChange("max_experience", max);
              }}
              min={0}
              max={20}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value} years`}
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
              <span>{filters.min_experience || 0} years</span>
              <span>{filters.max_experience || 20} years</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
