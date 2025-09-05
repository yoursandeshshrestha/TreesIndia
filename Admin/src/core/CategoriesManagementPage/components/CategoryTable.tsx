import React from "react";
import { Edit2, Trash2, Plus, Layers } from "lucide-react";
import Table from "@/components/Table/Table";
import Toggle from "@/components/Toggle";
import { Category, Subcategory } from "../types";

interface CategoryTableProps {
  categories: Category[];
  expandedCategories: Set<number>;
  togglingItems: Set<number>;
  onToggleExpansion: (categoryId: number) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onDeleteSubcategory: (subcategory: Subcategory) => void;
  onAddSubcategory: (categoryId: number) => void;
  onToggleCategoryStatus: (category: Category) => void;
  onToggleSubcategoryStatus: (subcategory: Subcategory) => void;
}

const CategoryTable = ({
  categories,
  expandedCategories,
  togglingItems,
  onEditCategory,
  onDeleteCategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onAddSubcategory,
  onToggleCategoryStatus,
  onToggleSubcategoryStatus,
}: CategoryTableProps) => {
  // Calculate statistics
  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.is_active).length,
    inactive: categories.filter((c) => !c.is_active).length,
    withSubcategories: categories.filter(
      (c) => c.subcategories && c.subcategories.length > 0
    ).length,
    totalSubcategories: categories.reduce(
      (sum, c) => sum + (c.subcategories?.length || 0),
      0
    ),
  };

  return (
    <div className="mt-2">
      {/* Statistics Summary */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            Total Categories
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
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            With Subcategories
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.withSubcategories}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-500">
            Total Subcategories
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalSubcategories}
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={[
            {
              header: "Category",
              accessor: (category: Category) => (
                <div className="flex items-center">
                  <div className="flex items-center">
                    <div>
                      <div
                        className="text-sm font-medium text-gray-900 truncate"
                        title={category.name}
                      >
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {category.slug}
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },

            {
              header: "Subcategories",
              accessor: (category: Category) => (
                <div className="flex items-center">
                  <span className="text-sm text-gray-900">
                    {category.subcategories?.length || 0} subcategories
                  </span>
                </div>
              ),
            },
            {
              header: "Status",
              accessor: (category: Category) => (
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Toggle
                    checked={category.is_active}
                    onChange={() => onToggleCategoryStatus(category)}
                    disabled={togglingItems.has(category.id)}
                    size="sm"
                  />
                  <span className="text-sm text-gray-600 w-16 text-center">
                    {category.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ),
            },
          ]}
          data={categories}
          keyField="id"
          actions={[
            {
              label: "Add Subcategory",
              onClick: (category: Category) => onAddSubcategory(category.id),
              className: "text-blue-700 bg-blue-100 hover:bg-blue-200",
              icon: <Plus size={14} />,
            },
            {
              label: "Edit",
              onClick: (category: Category) => onEditCategory(category),
              className: "text-blue-700 bg-blue-100 hover:bg-blue-200",
              icon: <Edit2 size={14} />,
            },
            {
              label: "Delete",
              onClick: (category: Category) => onDeleteCategory(category),
              className: "text-red-700 bg-red-100 hover:bg-red-200",
              icon: <Trash2 size={14} />,
            },
          ]}
        />

        {/* Subcategories Tables */}
        {categories.map((category) =>
          expandedCategories.has(category.id) &&
          category.subcategories &&
          category.subcategories.length > 0 ? (
            <div
              key={`subcategories-${category.id}`}
              className="mt-4 border-t border-gray-200"
            >
              <div className="bg-gray-50 px-6 py-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Subcategories for {category.name}
                </h3>
              </div>
              <Table
                columns={[
                  {
                    header: "Subcategory",
                    accessor: (subcategory: Subcategory) => (
                      <div className="flex items-center pl-8">
                        <Layers size={16} className="text-gray-400 mr-2" />
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
                    header: "Description",
                    accessor: (subcategory: Subcategory) => (
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {subcategory.description || "No description"}
                      </div>
                    ),
                  },
                  {
                    header: "Type",
                    accessor: () => (
                      <span className="text-sm text-gray-500">Subcategory</span>
                    ),
                  },
                  {
                    header: "Status",
                    accessor: (subcategory: Subcategory) => (
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Toggle
                          checked={subcategory.is_active}
                          onChange={() =>
                            onToggleSubcategoryStatus(subcategory)
                          }
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
                data={category.subcategories}
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
          ) : null
        )}
      </div>
    </div>
  );
};

export default CategoryTable;
