import { Plus, RefreshCw, Layers } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";

interface CategoryHeaderProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onRefresh: () => void;
  onCreateCategory: () => void;
}

const CategoryHeader = ({
  itemsPerPage,
  onItemsPerPageChange,
  onRefresh,
  onCreateCategory,
}: CategoryHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Categories Management
        </h1>
        <p className="text-sm text-gray-500">
          Manage service categories and their subcategories
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
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
          className="h-9"
          leftIcon={<RefreshCw size={16} />}
          onClick={onRefresh}
        >
          Refresh
        </Button>

        <Button
          variant="primary"
          size="sm"
          className="h-9"
          leftIcon={<Plus size={16} />}
          onClick={onCreateCategory}
        >
          Add Category
        </Button>
      </div>
    </div>
  );
};

export default CategoryHeader;
