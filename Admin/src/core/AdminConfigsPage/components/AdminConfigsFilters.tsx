import React from "react";
import { Search } from "lucide-react";
import CustomInput from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import { CONFIG_CATEGORIES } from "../types";

interface AdminConfigsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

const AdminConfigsFilters: React.FC<AdminConfigsFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const categoryOptions = [
    { label: "All Categories", value: "all" },
    ...CONFIG_CATEGORIES.map((cat) => ({
      label: cat.label,
      value: cat.value,
    })),
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <CustomInput
            placeholder="Search configurations by key, description, or value..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 bg-white"
            leftIcon={<Search size={16} />}
          />
        </div>

        {/* Category Filter */}
        <div className="lg:w-64">
          <SearchableDropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={(val) => onCategoryChange(val as string)}
            placeholder="Filter by category"
            className="h-10"
            width="16rem"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminConfigsFilters;
