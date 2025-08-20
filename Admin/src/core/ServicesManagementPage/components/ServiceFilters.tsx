import React from "react";
import { Search, X } from "lucide-react";
import Input from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Button from "@/components/Button/Base/Button";
import { Category, Subcategory } from "../types";

interface ServiceFiltersProps {
  search: string;
  status: string;
  priceType: string;
  categoryId: string;
  subcategoryId: string;
  sortBy: string;
  sortOrder: string;
  categories: Category[];
  subcategories: Subcategory[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriceTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClear: () => void;
  onClearSearch: () => void;
  onCategoryDropdownOpen: () => void;
  onSubcategoryDropdownOpen: () => void;
  isSearching?: boolean;
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  search,
  status,
  priceType,
  categoryId,
  subcategoryId,
  sortBy,
  sortOrder,
  categories,
  subcategories,
  onSearchChange,
  onStatusChange,
  onPriceTypeChange,
  onCategoryChange,
  onSubcategoryChange,
  onSortByChange,
  onSortOrderChange,
  onClear,
  onClearSearch,
  onCategoryDropdownOpen,
  onSubcategoryDropdownOpen,
  isSearching = false,
}) => {
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const priceTypeOptions = [
    { value: "all", label: "All Price Types" },
    { value: "fixed", label: "Fixed Price" },
    { value: "inquiry", label: "Inquiry Based" },
  ];

  const sortByOptions = [
    { value: "name", label: "Name" },
    { value: "price", label: "Price" },
    { value: "createdAt", label: "Created Date" },
    { value: "updatedAt", label: "Updated Date" },
  ];

  const sortOrderOptions = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((category) => ({
      value: category.id.toString(),
      label: category.name,
    })),
  ];

  const subcategoryOptions = [
    { value: "", label: "All Subcategories" },
    ...subcategories.map((subcategory) => ({
      value: subcategory.id.toString(),
      label: subcategory.name,
    })),
  ];

  return (
    <div className="mt-6 mb-4 space-y-4 w-full">
      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search services..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 pr-10 bg-white"
          leftIcon={<Search size={16} />}
        />
        {isSearching ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : search ? (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-end gap-3">
        <SearchableDropdown
          options={statusOptions}
          value={status}
          onChange={(val) => onStatusChange(val as string)}
          placeholder="Status"
          className="w-44 h-10"
          width="13rem"
        />
        <SearchableDropdown
          options={priceTypeOptions}
          value={priceType}
          onChange={(val) => onPriceTypeChange(val as string)}
          placeholder="Price Type"
          className="w-44 h-10"
          width="13rem"
        />
        <SearchableDropdown
          options={categoryOptions}
          value={categoryId}
          onChange={(val) => onCategoryChange(val as string)}
          placeholder="Category"
          className="w-48 h-10"
          width="15rem"
          onOpen={onCategoryDropdownOpen}
        />
        <SearchableDropdown
          options={subcategoryOptions}
          value={subcategoryId}
          onChange={(val) => onSubcategoryChange(val as string)}
          placeholder="Subcategory"
          className="w-48 h-10"
          width="15rem"
          onOpen={onSubcategoryDropdownOpen}
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
};

export default ServiceFilters;
