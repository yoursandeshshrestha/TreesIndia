import React from "react";
import { Plus, RefreshCw, IndianRupee } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";

interface LedgerHeaderProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onRefresh: () => void;
  onCreateEntry: () => void;
  onUpdateBalance: () => void;
}

const LedgerHeader = ({
  itemsPerPage,
  onItemsPerPageChange,
  onRefresh,
  onCreateEntry,
  onUpdateBalance,
}: LedgerHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Ledger Management</h1>
        <p className="text-sm text-gray-500">
          Track payments, receivables, and financial transactions
        </p>
      </div>
      <div className="flex gap-2">
        <div className="flex items-center gap-2 ">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <SearchableDropdown
            options={[
              { label: "10", value: "10" },
              { label: "20", value: "20" },
              { label: "30", value: "30" },
              { label: "40", value: "40" },
            ]}
            value={itemsPerPage.toString()}
            onChange={(val) => onItemsPerPageChange(Number(val))}
            className="w-20"
            width="5rem"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-30 h-10"
          leftIcon={<RefreshCw size={16} />}
          onClick={onRefresh}
        >
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-44 h-10"
          leftIcon={<IndianRupee size={16} />}
          onClick={onUpdateBalance}
        >
          Update Balance
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="w-34 h-10 whitespace-nowrap"
          leftIcon={<Plus size={16} />}
          onClick={onCreateEntry}
        >
          New Entry
        </Button>
      </div>
    </div>
  );
};

export default LedgerHeader;
