import React from "react";
import { Search, X, Filter } from "lucide-react";
import CustomInput from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Button from "@/components/Button/Base/Button";

interface CategoryFiltersProps {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClear: () => void;
  onClearSearch: () => void;
  isSearching?: boolean;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  search,
  status,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
  onClear,
  onClearSearch,
  isSearching = false,
}) => {
  const STATUS_OPTIONS = [
    { label: "All Status", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const SORT_OPTIONS = [
    { label: "Name", value: "name" },
    { label: "Created Date", value: "createdAt" },
    { label: "Updated Date", value: "updatedAt" },
  ];

  const SORT_ORDER_OPTIONS = [
    { label: "Ascending", value: "asc" },
    { label: "Descending", value: "desc" },
  ];

  const hasActiveFilters =
    search || status || sortBy !== "name" || sortOrder !== "asc";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-end gap-3">
        {/* Search Input */}
        <div className="relative flex-grow min-w-[200px]">
          <CustomInput
            placeholder="Search categories..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9"
            leftIcon={<Search size={16} />}
          />
          {isSearching ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-floating">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
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

        {/* Status Filter */}
        <div className="min-w-[140px]">
          <SearchableDropdown
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => onStatusChange(val as string)}
            placeholder="Status"
            className="h-9"
            width="140px"
          />
        </div>

        {/* Sort By */}
        <div className="min-w-[160px]">
          <SearchableDropdown
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(val) => onSortByChange(val as string)}
            placeholder="Sort by"
            className="h-9"
            width="160px"
          />
        </div>

        {/* Sort Order */}
        <div className="min-w-[140px]">
          <SearchableDropdown
            options={SORT_ORDER_OPTIONS}
            value={sortOrder}
            onChange={(val) => onSortOrderChange(val as string)}
            placeholder="Order"
            className="h-9"
            width="140px"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" className="h-9" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default CategoryFilters;
