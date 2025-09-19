import React from "react";
import { Search } from "lucide-react";
import CustomInput from "@/components/Input/Base/Input";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";
import Button from "@/components/Button/Base/Button";

interface LedgerFiltersProps {
  search: string;
  entry_type: string;
  status: string;
  payment_source: string;
  onSearchChange: (value: string) => void;
  onEntryTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPaymentSourceChange: (value: string) => void;
  onClear: () => void;
  isSearching?: boolean;
}

const ENTRY_TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Pay", value: "pay" },
  { label: "Receive", value: "receive" },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Partial", value: "partial" },
  { label: "Completed", value: "completed" },
];

const PAYMENT_SOURCE_OPTIONS = [
  { label: "All Sources", value: "all" },
  { label: "Cash", value: "cash" },
  { label: "Bank", value: "bank" },
];

const LedgerFilters: React.FC<LedgerFiltersProps> = ({
  search,
  entry_type,
  status,
  payment_source,
  onSearchChange,
  onEntryTypeChange,
  onStatusChange,
  onPaymentSourceChange,
  onClear,
  isSearching = false,
}) => {
  return (
    <div className="mt-6 mb-4 flex items-end gap-3 w-full">
      <div className="relative flex-grow basis-0">
        <CustomInput
          placeholder="Search ledger entries..."
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
        options={ENTRY_TYPE_OPTIONS}
        value={entry_type}
        onChange={(val) => onEntryTypeChange(val as string)}
        placeholder="Type"
        className="w-60 h-10"
        width="15rem"
      />
      <SearchableDropdown
        options={STATUS_OPTIONS}
        value={status}
        onChange={(val) => onStatusChange(val as string)}
        placeholder="Status"
        className="w-44 h-10"
        width="13rem"
      />
      <SearchableDropdown
        options={PAYMENT_SOURCE_OPTIONS}
        value={payment_source}
        onChange={(val) => onPaymentSourceChange(val as string)}
        placeholder="Source"
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

export default LedgerFilters;
