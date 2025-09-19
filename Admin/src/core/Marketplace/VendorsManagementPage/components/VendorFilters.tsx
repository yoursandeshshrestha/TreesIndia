"use client";

import { Search, X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";

interface VendorFiltersProps {
  search: string;
  businessType: string;
  state: string;
  city: string;
  isActive: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onBusinessTypeChange: (value: string | number) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onIsActiveChange: (value: string | number) => void;
  onSortByChange: (value: string | number) => void;
  onSortOrderChange: (value: string | number) => void;
  onClear: () => void;
  onClearSearch: () => void;
  isSearching?: boolean;
}

export default function VendorFilters({
  search,
  businessType,
  state,
  city,
  isActive,
  sortBy,
  sortOrder,
  onSearchChange,
  onBusinessTypeChange,
  onStateChange,
  onCityChange,
  onIsActiveChange,
  onSortByChange,
  onSortOrderChange,
  onClear,
  onClearSearch,
  isSearching = false,
}: VendorFiltersProps) {
  const businessTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "individual", label: "Individual" },
    { value: "partnership", label: "Partnership" },
    { value: "company", label: "Company" },
    { value: "llp", label: "LLP" },
    { value: "pvt_ltd", label: "Private Limited" },
    { value: "public_ltd", label: "Public Limited" },
    { value: "other", label: "Other" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  const sortByOptions = [
    { value: "created_at", label: "Created Date" },
    { value: "vendor_name", label: "Vendor Name" },
    { value: "business_type", label: "Business Type" },
    { value: "years_in_business", label: "Years in Business" },
    { value: "is_active", label: "Status" },
  ];

  const sortOrderOptions = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

  return (
    <div className="mt-6 mb-4 space-y-4 w-full">
      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search vendors..."
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

      {/* Filter Row */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Type
          </label>
          <SearchableDropdown
            options={businessTypeOptions}
            value={businessType}
            onChange={onBusinessTypeChange}
            placeholder="Select business type"
            className="w-full"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <Input
            placeholder="Enter state"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            className="h-10 bg-white"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <Input
            placeholder="Enter city"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="h-10 bg-white"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <SearchableDropdown
            options={statusOptions}
            value={isActive}
            onChange={onIsActiveChange}
            placeholder="Select status"
            className="w-full"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <SearchableDropdown
            options={sortByOptions}
            value={sortBy}
            onChange={onSortByChange}
            placeholder="Select sort field"
            className="w-full"
          />
        </div>

        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <SearchableDropdown
            options={sortOrderOptions}
            value={sortOrder}
            onChange={onSortOrderChange}
            placeholder="Select order"
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="h-10 px-4"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
