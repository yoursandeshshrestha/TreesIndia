"use client";

import { Search, X } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import Input from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";

interface PropertyFiltersProps {
  search: string;
  propertyType: string;
  listingType: string;
  status: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onPropertyTypeChange: (value: string) => void;
  onListingTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClear: () => void;
  onClearSearch: () => void;
  isSearching?: boolean;
}

export default function PropertyFilters({
  search,
  propertyType,
  listingType,
  status,
  sortBy,
  sortOrder,
  onSearchChange,
  onPropertyTypeChange,
  onListingTypeChange,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
  onClear,
  onClearSearch,
  isSearching = false,
}: PropertyFiltersProps) {
  const propertyTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
  ];

  const listingTypeOptions = [
    { value: "all", label: "All Listings" },
    { value: "sale", label: "For Sale" },
    { value: "rent", label: "For Rent" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
    { value: "rented", label: "Rented" },
    { value: "under_contract", label: "Under Contract" },
    { value: "off_market", label: "Off Market" },
    { value: "expired", label: "Expired" },
  ];

  const sortByOptions = [
    { value: "created_at", label: "Created Date" },
    { value: "title", label: "Title" },
    { value: "sale_price", label: "Sale Price" },
    { value: "monthly_rent", label: "Monthly Rent" },
    { value: "area", label: "Area" },
    { value: "status", label: "Status" },
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
          placeholder="Search properties..."
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
          options={propertyTypeOptions}
          value={propertyType}
          onChange={(val) => onPropertyTypeChange(val as string)}
          placeholder="Property Type"
          className="w-44 h-10"
          width="13rem"
        />
        <SearchableDropdown
          options={listingTypeOptions}
          value={listingType}
          onChange={(val) => onListingTypeChange(val as string)}
          placeholder="Listing Type"
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
