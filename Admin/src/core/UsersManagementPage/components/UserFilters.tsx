import React from "react";
import { Search } from "lucide-react";
import CustomInput from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Button from "@/components/Button/Base/Button";
import {
  USER_TYPE_FILTER_OPTIONS,
  STATUS_OPTIONS,
  ROLE_APPLICATION_FILTER_OPTIONS,
  SUBSCRIPTION_OPTIONS,
} from "@/utils/userUtils";

interface UserFiltersProps {
  search: string;
  user_type: string;
  is_active: string;
  role_application_status: string;
  has_active_subscription: string;
  onSearchChange: (value: string) => void;
  onUserTypeChange: (value: string) => void;
  onIsActiveChange: (value: string) => void;
  onRoleApplicationStatusChange: (value: string) => void;
  onHasActiveSubscriptionChange: (value: string) => void;
  onClear: () => void;
  isSearching?: boolean;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  search,
  user_type,
  is_active,
  role_application_status,
  has_active_subscription,
  onSearchChange,
  onUserTypeChange,
  onIsActiveChange,
  onRoleApplicationStatusChange,
  onHasActiveSubscriptionChange,
  onClear,
  isSearching = false,
}) => {
  return (
    <div className="mt-6 mb-4 flex items-end gap-3 w-full">
      <div className="relative flex-grow basis-0">
        <CustomInput
          placeholder="Search users..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 pr-10 bg-white"
          leftIcon={<Search size={16} />}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      <SearchableDropdown
        options={USER_TYPE_FILTER_OPTIONS}
        value={user_type}
        onChange={(val) => onUserTypeChange(val as string)}
        placeholder="Type"
        className="w-60 h-10"
        width="15rem"
      />
      <SearchableDropdown
        options={STATUS_OPTIONS}
        value={is_active}
        onChange={(val) => onIsActiveChange(val as string)}
        placeholder="Status"
        className="w-44 h-10"
        width="13rem"
      />
      <SearchableDropdown
        options={ROLE_APPLICATION_FILTER_OPTIONS}
        value={role_application_status}
        onChange={(val) => onRoleApplicationStatusChange(val as string)}
        placeholder="Role Application"
        className="w-48 h-10"
        width="15rem"
      />
      <SearchableDropdown
        options={SUBSCRIPTION_OPTIONS}
        value={has_active_subscription}
        onChange={(val) => onHasActiveSubscriptionChange(val as string)}
        placeholder="Subscription"
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

export default UserFilters;
