import { Plus, RefreshCw, Grid3X3, List } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button/Base/Button";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";

interface ServiceHeaderProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onRefresh: () => void;
  onCreateService?: () => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

const ServiceHeader = ({
  itemsPerPage,
  onItemsPerPageChange,
  onRefresh,
  onCreateService,
  viewMode,
  onViewModeChange,
}: ServiceHeaderProps) => {
  const router = useRouter();

  const handleCreateService = () => {
    if (onCreateService) {
      onCreateService();
    } else {
      router.push("/dashboard/services/create-service");
    }
  };
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Service Management</h1>
        <p className="text-sm text-gray-500">
          Manage and organize your services
        </p>
      </div>
      <div className="flex gap-2">
        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title="Grid View"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title="Table View"
          >
            <List size={16} />
          </button>
        </div>

        {/* Rows per page - only show in table view */}
        {viewMode === "table" && (
          <div className="flex items-center gap-2">
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
        )}

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
          variant="primary"
          size="sm"
          className="w-40 h-10 whitespace-nowrap"
          leftIcon={<Plus size={16} />}
          onClick={handleCreateService}
        >
          Create Service
        </Button>
      </div>
    </div>
  );
};

export default ServiceHeader;
