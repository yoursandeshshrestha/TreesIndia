import React from "react";
import { Edit2, Trash2, Layers, Image } from "lucide-react";
import Table from "@/components/Table/Table";
import Toggle from "@/components/Toggle";
import { Subcategory } from "../types";

interface SubcategoryTableProps {
  subcategories: Subcategory[];
  togglingItems: Set<number>;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onDeleteSubcategory: (subcategory: Subcategory) => void;
  onToggleSubcategoryStatus: (subcategory: Subcategory) => void;
}

const SubcategoryTable = ({
  subcategories,
  togglingItems,
  onEditSubcategory,
  onDeleteSubcategory,
  onToggleSubcategoryStatus,
}: SubcategoryTableProps) => {
  // Calculate statistics
  const stats = {
    total: subcategories.length,
    active: subcategories.filter((s) => s.is_active).length,
    inactive: subcategories.filter((s) => !s.is_active).length,
  };

  // Helper function to get parent category name
  const getParentCategoryName = (subcategory: Subcategory): string => {
    return subcategory.parent?.name || "Unknown Category";
  };

  return (
    <div className="mt-2">
      {/* Statistics Summary */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            Total Subcategories
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">Inactive</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.inactive}
          </div>
        </div>
      </div>

      {/* Subcategories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={[
            {
              header: "Icon",
              accessor: (subcategory: Subcategory) => (
                <div className="flex items-center justify-center">
                  {subcategory.image ? (
                    <img
                      src={subcategory.image}
                      alt={subcategory.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Image size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: "Subcategory",
              accessor: (subcategory: Subcategory) => (
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {subcategory.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {subcategory.slug}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: "Parent Category",
              accessor: (subcategory: Subcategory) => (
                <div className="text-sm text-gray-900">
                  {getParentCategoryName(subcategory)}
                </div>
              ),
            },

            {
              header: "Status",
              accessor: (subcategory: Subcategory) => (
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Toggle
                    checked={subcategory.is_active}
                    onChange={() => onToggleSubcategoryStatus(subcategory)}
                    disabled={togglingItems.has(subcategory.id)}
                    size="sm"
                  />
                  <span className="text-sm text-gray-600 w-16 text-center">
                    {subcategory.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ),
            },
          ]}
          data={subcategories}
          keyField="id"
          actions={[
            {
              label: "Edit",
              onClick: (subcategory: Subcategory) =>
                onEditSubcategory(subcategory),
              className: "text-blue-700 bg-blue-100 hover:bg-blue-200",
              icon: <Edit2 size={14} />,
            },
            {
              label: "Delete",
              onClick: (subcategory: Subcategory) =>
                onDeleteSubcategory(subcategory),
              className: "text-red-700 bg-red-100 hover:bg-red-200",
              icon: <Trash2 size={14} />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default SubcategoryTable;
