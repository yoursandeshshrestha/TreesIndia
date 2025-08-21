import React from "react";
import { Search, X } from "lucide-react";
import CustomInput from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Button from "@/components/Button/Base/Button";

interface SubcategoryFiltersProps {
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

const SubcategoryFilters: React.FC<SubcategoryFiltersProps> = ({
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
    { label: "All", value: "" },
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

  return (
    <div className="mt-6 mb-4 flex items-end gap-3 w-full">
      <div className="relative flex-grow basis-0">
        <CustomInput
          placeholder="Search subcategories..."
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
      <SearchableDropdown
        options={STATUS_OPTIONS}
        value={status}
        onChange={(val) => onStatusChange(val as string)}
        placeholder="Status"
        className="w-44 h-10"
        width="13rem"
      />
      <SearchableDropdown
        options={SORT_OPTIONS}
        value={sortBy}
        onChange={(val) => onSortByChange(val as string)}
        placeholder="Sort by"
        className="w-48 h-10"
        width="15rem"
      />
      <SearchableDropdown
        options={SORT_ORDER_OPTIONS}
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
  );
};

export default SubcategoryFilters;
