"use client";

import { Search, Filter, ArrowUpDown } from "lucide-react";
import { SubscriptionFilters as SubscriptionFiltersType } from "../types";
import {
  STATUS_OPTIONS,
  DURATION_FILTER_OPTIONS,
  SORT_OPTIONS,
} from "../types";

interface SubscriptionFiltersProps {
  filters: SubscriptionFiltersType;
  onFiltersChange: (filters: SubscriptionFiltersType) => void;
  localSearch: string;
  onLocalSearchChange: (search: string) => void;
  isSearching: boolean;
  onSearchingChange: (isSearching: boolean) => void;
}

export function SubscriptionFilters({
  filters,
  onFiltersChange,
  localSearch,
  onLocalSearchChange,
  isSearching,
  onSearchingChange,
}: SubscriptionFiltersProps) {
  const handleFilterChange = (
    key: keyof SubscriptionFiltersType,
    value: any
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleSortChange = (sortBy: string) => {
    const newSortOrder =
      filters.sortBy === sortBy && filters.sortOrder === "asc" ? "desc" : "asc";

    onFiltersChange({
      ...filters,
      sortBy: sortBy as any,
      sortOrder: newSortOrder,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      duration: "all",
      sortBy: "name",
      sortOrder: "asc",
    });
    onLocalSearchChange("");
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.duration !== "all" ||
    filters.sortBy !== "name" ||
    filters.sortOrder !== "asc";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                onLocalSearchChange(e.target.value);
                onSearchingChange(true);
              }}
              placeholder="Search plans..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Duration
          </label>
          <select
            value={filters.duration}
            onChange={(e) => handleFilterChange("duration", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {DURATION_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sort by
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleSortChange(filters.sortBy || "name")}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title={`Sort ${
                filters.sortOrder === "asc" ? "Descending" : "Ascending"
              }`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Search: "{filters.search}"
                <button
                  onClick={() => {
                    onLocalSearchChange("");
                    handleFilterChange("search", "");
                  }}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Status:{" "}
                {STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
                <button
                  onClick={() => handleFilterChange("status", "all")}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.duration !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Duration:{" "}
                {
                  DURATION_FILTER_OPTIONS.find(
                    (d) => d.value === filters.duration
                  )?.label
                }
                <button
                  onClick={() => handleFilterChange("duration", "all")}
                  className="ml-1 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
              Sort:{" "}
              {SORT_OPTIONS.find((s) => s.value === filters.sortBy)?.label} (
              {filters.sortOrder})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
