"use client";

import React from "react";
import { Search, X } from "lucide-react";
import CustomInput from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Button from "@/components/Button/Base/Button";
import { type BannerFilters } from "../types";

interface BannerFiltersProps {
  filters: BannerFilters;
  onFiltersChange: (filters: BannerFilters) => void;
  onSearch: (search: string) => void;
  isSearching?: boolean;
  localSearch?: string;
}

export const BannerFiltersComponent: React.FC<BannerFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  isSearching = false,
  localSearch = "",
}) => {
  const STATUS_OPTIONS = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const SORT_OPTIONS = [
    { label: "Title", value: "title" },
    { label: "Created Date", value: "createdAt" },
    { label: "Updated Date", value: "updatedAt" },
  ];

  const SORT_ORDER_OPTIONS = [
    { label: "Ascending", value: "asc" },
    { label: "Descending", value: "desc" },
  ];

  const handleSearchChange = (value: string) => {
    onSearch(value);
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value as "active" | "inactive" | "all",
    });
  };

  const handleSortByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as "title" | "createdAt" | "updatedAt",
    });
  };

  const handleSortOrderChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortOrder: value as "asc" | "desc",
    });
  };

  const handleClear = () => {
    onFiltersChange({
      search: "",
      status: "all",
      sortBy: "title",
      sortOrder: "asc",
    });
    onSearch("");
  };

  const handleClearSearch = () => {
    onSearch("");
  };

  return (
    <div className="mt-6 mb-4 flex items-end gap-3 w-full">
      <div className="relative flex-grow basis-0">
        <CustomInput
          placeholder="Search banners..."
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-10 pr-10 bg-white"
          leftIcon={<Search size={16} />}
        />
        {isSearching ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-floating">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : localSearch ? (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-floating text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
      <SearchableDropdown
        options={STATUS_OPTIONS}
        value={filters.status || "all"}
        onChange={(val) => handleStatusChange(val as string)}
        placeholder="Status"
        className="w-44 h-10"
        width="13rem"
      />
      <SearchableDropdown
        options={SORT_OPTIONS}
        value={filters.sortBy || "title"}
        onChange={(val) => handleSortByChange(val as string)}
        placeholder="Sort by"
        className="w-48 h-10"
        width="15rem"
      />
      <SearchableDropdown
        options={SORT_ORDER_OPTIONS}
        value={filters.sortOrder || "asc"}
        onChange={(val) => handleSortOrderChange(val as string)}
        placeholder="Order"
        className="w-44 h-10"
        width="13rem"
      />
      <Button
        variant="outline"
        size="sm"
        className="w-40 h-10"
        onClick={handleClear}
      >
        Clear filters
      </Button>
    </div>
  );
};
