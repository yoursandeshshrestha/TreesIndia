import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import CustomInput from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Button from "@/components/Button/Base/Button";
import { useTransactions } from "@/hooks/useTransactions";
import { FilterOptions } from "@/types/transaction";

interface TransactionFiltersProps {
  search: string;
  status: string;
  type: string;
  method: string;
  sort_by: string;
  sort_order: "asc" | "desc";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onMethodChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  onClear: () => void;
  isSearching: boolean;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  search,
  status,
  type,
  method,
  sort_by,
  sort_order,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onMethodChange,
  onSortByChange,
  onSortOrderChange,
  onClear,
  isSearching = false,
}) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null
  );
  const { fetchFilterOptions } = useTransactions();

  useEffect(() => {
    const loadFilterOptions = async () => {
      const options = await fetchFilterOptions();
      setFilterOptions(options);
    };

    loadFilterOptions();
  }, [fetchFilterOptions]);

  // Default options in case API doesn't return data
  const defaultStatusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "cancelled", label: "Cancelled" },
    { value: "abandoned", label: "Abandoned" },
  ];

  const defaultTypeOptions = [
    { value: "", label: "All Types" },
    { value: "booking", label: "Booking" },
    { value: "subscription", label: "Subscription" },
    { value: "wallet_recharge", label: "Wallet Recharge" },
    { value: "wallet_debit", label: "Wallet Debit" },
    { value: "refund", label: "Refund" },
    { value: "segment_pay", label: "Segment Pay" },
    { value: "quote", label: "Quote" },
  ];

  const defaultMethodOptions = [
    { value: "", label: "All Methods" },
    { value: "razorpay", label: "Razorpay" },
    { value: "wallet", label: "Wallet" },
    { value: "cash", label: "Cash" },
    { value: "admin", label: "Admin" },
  ];

  const defaultSortOptions = [
    { value: "created_at", label: "Created At" },
    { value: "amount", label: "Amount" },
    { value: "status", label: "Status" },
    { value: "type", label: "Type" },
    { value: "method", label: "Method" },
  ];

  const statusOptions =
    filterOptions?.payment_statuses?.map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
    })) || defaultStatusOptions;

  const typeOptions =
    filterOptions?.payment_types?.map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace("_", " "),
    })) || defaultTypeOptions;

  const methodOptions =
    filterOptions?.payment_methods?.map((method) => ({
      value: method,
      label: method.charAt(0).toUpperCase() + method.slice(1),
    })) || defaultMethodOptions;

  const sortOptions =
    filterOptions?.sort_fields?.map((field) => ({
      value: field,
      label: field.charAt(0).toUpperCase() + field.slice(1).replace("_", " "),
    })) || defaultSortOptions;

  // const hasActiveFilters =
  //   search ||
  //   status ||
  //   type ||
  //   method ||
  //   user_email ||
  //   user_phone ||
  //   min_amount ||
  //   max_amount ||
  //   start_date ||
  //   end_date;

  return (
    <div className=" mb-6 space-y-4 w-full">
      {/* Search Bar */}
      <div className="relative">
        <CustomInput
          placeholder="Search transactions, users, references..."
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
          options={typeOptions}
          value={type}
          onChange={(val) => onTypeChange(val as string)}
          placeholder="Type"
          className="w-44 h-10"
          width="13rem"
        />

        <SearchableDropdown
          options={methodOptions}
          value={method}
          onChange={(val) => onMethodChange(val as string)}
          placeholder="Method"
          className="w-44 h-10"
          width="13rem"
        />

        <SearchableDropdown
          options={sortOptions}
          value={sort_by}
          onChange={(val) => onSortByChange(val as string)}
          placeholder="Sort By"
          className="w-44 h-10"
          width="13rem"
        />

        <SearchableDropdown
          options={[
            { value: "desc", label: "Descending" },
            { value: "asc", label: "Ascending" },
          ]}
          value={sort_order}
          onChange={(val) => onSortOrderChange(val as "asc" | "desc")}
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

export default TransactionFilters;
