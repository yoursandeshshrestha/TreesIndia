import React from "react";
import { RefreshCw } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";

interface WorkerHeaderProps {
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onRefresh: () => void;
}

function WorkerHeader({
  itemsPerPage,
  onItemsPerPageChange,
  onRefresh,
}: WorkerHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Workers</h1>
        <p className="text-sm text-gray-500">
          Manage and view all registered workers
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
      </div>
    </div>
  );
}

export default WorkerHeader;
