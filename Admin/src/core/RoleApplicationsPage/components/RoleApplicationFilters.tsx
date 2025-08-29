import React from "react";
import { Search } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import CustomInput from "@/components/Input/Base/Input";

interface RoleApplicationFiltersProps {
  search: string;
  status: string;
  requested_role: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRequestedRoleChange: (value: string) => void;
  onClear: () => void;
  isSearching: boolean;
}

function RoleApplicationFilters({
  search,
  status,
  requested_role,
  onSearchChange,
  onStatusChange,
  onRequestedRoleChange,
  onClear,
  isSearching,
}: RoleApplicationFiltersProps) {
  return (
    <div className="mt-6 mb-4 flex items-end gap-3 w-full">
      <div className="relative flex-grow basis-0">
        <CustomInput
          placeholder="Search applications..."
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
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
        ]}
        value={status}
        onChange={(val) => onStatusChange(val as string)}
        placeholder="Status"
        className="w-44 h-10"
        width="13rem"
      />

      <SearchableDropdown
        options={[
          { label: "All Roles", value: "" },
          { label: "Worker", value: "worker" },
          { label: "Broker", value: "broker" },
        ]}
        value={requested_role}
        onChange={(val) => onRequestedRoleChange(val as string)}
        placeholder="Role"
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

export default RoleApplicationFilters;
