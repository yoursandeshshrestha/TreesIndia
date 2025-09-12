"use client";

import { Plus, RefreshCw } from "lucide-react";
import Button from "@/components/Button/Base/Button";
import SearchableDropdown from "@/components/SearchableDropdown/SearchableDropdown";

interface ProjectHeaderProps {
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onRefresh: () => void;
  onCreateProject: () => void;
  isLoading?: boolean;
}

export default function ProjectHeader({
  itemsPerPage,
  onItemsPerPageChange,
  onRefresh,
  onCreateProject,
  isLoading = false,
}: ProjectHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Project Management</h1>
        <p className="text-sm text-gray-500">
          Manage construction and development projects
        </p>
      </div>
      <div className="flex gap-2">
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
        <Button
          variant="outline"
          size="sm"
          className="w-30 h-10"
          leftIcon={<RefreshCw size={16} />}
          onClick={onRefresh}
          disabled={isLoading}
          loading={isLoading}
        >
          Refresh
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="w-40 h-10 whitespace-nowrap"
          leftIcon={<Plus size={16} />}
          onClick={onCreateProject}
        >
          Create Project
        </Button>
      </div>
    </div>
  );
}
