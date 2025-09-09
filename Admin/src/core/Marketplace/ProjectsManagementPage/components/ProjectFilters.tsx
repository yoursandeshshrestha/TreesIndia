"use client";

import { Search, X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Input from "@/components/Input/Base/Input";

interface ProjectFiltersProps {
  search: string;
  projectType: string;
  status: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onProjectTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClear: () => void;
  onClearSearch: () => void;
  isSearching?: boolean;
}

export default function ProjectFilters({
  search,
  projectType,
  status,
  sortBy,
  sortOrder,
  onSearchChange,
  onProjectTypeChange,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
  onClear,
  onClearSearch,
  isSearching = false,
}: ProjectFiltersProps) {
  const projectTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "infrastructure", label: "Infrastructure" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "starting_soon", label: "Starting Soon" },
    { value: "on_going", label: "On Going" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "on_hold", label: "On Hold" },
  ];

  const sortByOptions = [
    { value: "created_at", label: "Created Date" },
    { value: "title", label: "Title" },
    { value: "status", label: "Status" },
    { value: "project_type", label: "Project Type" },
  ];

  const sortOrderOptions = [
    { value: "desc", label: "Descending" },
    { value: "asc", label: "Ascending" },
  ];

  return (
    <div className="mt-6 mb-4 space-y-4 w-full">
      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 pr-10 bg-white"
          leftIcon={<Search size={16} />}
        />
        {isSearching ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-floating">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : search ? (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-floating text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-end gap-3">
        <SearchableDropdown
          options={projectTypeOptions}
          value={projectType}
          onChange={(val) => onProjectTypeChange(val as string)}
          placeholder="Project Type"
          className="w-44 h-10"
          width="13rem"
        />

        <SearchableDropdown
          options={statusOptions}
          value={status}
          onChange={(val) => onStatusChange(val as string)}
          placeholder="Status"
          className="w-44 h-10"
          width="13rem"
        />

        <SearchableDropdown
          options={sortByOptions}
          value={sortBy}
          onChange={(val) => onSortByChange(val as string)}
          placeholder="Sort by"
          className="w-48 h-10"
          width="15rem"
        />

        <SearchableDropdown
          options={sortOrderOptions}
          value={sortOrder}
          onChange={(val) => onSortOrderChange(val as string)}
          placeholder="Order"
          className="w-44 h-10"
          width="13rem"
        />

        <Button
          variant="outline"
          size="sm"
          className="w-40 h-10"
          onClick={onClear}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
