import React from "react";
import { Search } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import CustomInput from "@/components/Input/Base/Input";

interface WorkerFiltersProps {
  search: string;
  is_active: string;
  worker_type: string;
  onSearchChange: (value: string) => void;
  onActiveChange: (value: string) => void;
  onWorkerTypeChange: (value: string) => void;
  onClear: () => void;
  isSearching: boolean;
}

function WorkerFilters({
  search,
  is_active,
  worker_type,
  onSearchChange,
  onActiveChange,
  onWorkerTypeChange,
  onClear,
  isSearching,
}: WorkerFiltersProps) {
  return (
    <div className="mt-6 mb-4 flex items-end gap-3 w-full">
      <div className="relative flex-grow basis-0">
        <CustomInput
          placeholder="Search workers..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 pr-10 bg-white"
          leftIcon={<Search size={16} />}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-floating">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      <SearchableDropdown
        options={[
          { label: "All Status", value: "" },
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ]}
        value={is_active}
        onChange={(val) => onActiveChange(val as string)}
        placeholder="Status"
        className="w-44 h-10"
        width="13rem"
      />

      <SearchableDropdown
        options={[
          { label: "All Types", value: "" },
          { label: "Normal", value: "normal" },
          { label: "TreesIndia", value: "treesindia_worker" },
        ]}
        value={worker_type}
        onChange={(val) => onWorkerTypeChange(val as string)}
        placeholder="Worker Type"
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
}

export default WorkerFilters;
