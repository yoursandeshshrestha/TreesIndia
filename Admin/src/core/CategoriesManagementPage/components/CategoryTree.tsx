import React from "react";
import {
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Plus,
  Folder,
  FolderOpen,
  Tag,
} from "lucide-react";
import Toggle from "@/components/Toggle";
import { Category } from "../types";

interface CategoryTreeProps {
  categories: Category[];
  expandedNodes: Set<number>;
  togglingItems: Set<number>;
  onToggleExpansion: (categoryId: number) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onAddSubcategory: (categoryId: number) => void;
  onToggleCategoryStatus: (category: Category) => void;
  level?: number;
  parentPath?: string[];
}

interface CategoryTreeNodeProps {
  category: Category;
  expandedNodes: Set<number>;
  togglingItems: Set<number>;
  onToggleExpansion: (categoryId: number) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onAddSubcategory: (categoryId: number) => void;
  onToggleCategoryStatus: (category: Category) => void;
  level: number;
  parentPath: string[];
}

const CategoryTreeNode: React.FC<CategoryTreeNodeProps> = ({
  category,
  expandedNodes,
  togglingItems,
  onToggleExpansion,
  onEditCategory,
  onDeleteCategory,
  onAddSubcategory,
  onToggleCategoryStatus,
  level,
  parentPath,
}) => {
  const [iconError, setIconError] = React.useState(false);
  const hasChildren =
    (category.children || category.subcategories || []).length > 0;
  const isExpanded = expandedNodes.has(category.id);
  const children = category.children || category.subcategories || [];
  const indentWidth = 28; // pixels per level (matching service page)

  const getFullPath = () => {
    return [...parentPath, category.name];
  };

  const isImageIcon = category.icon && (
    category.icon.startsWith("http://") || 
    category.icon.startsWith("https://") || 
    category.icon.startsWith("data:")
  );

  return (
    <div className="relative">
      {/* Category row - bigger size matching service page */}
      <div
        className="flex items-center gap-3 py-3 px-3 hover:bg-gray-50 group transition-colors"
        style={{ paddingLeft: `${level * indentWidth + 12}px` }}
      >
        {/* Expand/Collapse triangle */}
        <button
          onClick={() => onToggleExpansion(category.id)}
          className={`
            flex-shrink-0 w-6 h-6 flex items-center justify-center rounded
            text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors
            ${!hasChildren ? "invisible" : ""}
          `}
          disabled={!hasChildren}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            ))}
        </button>

        {/* Icon - show category icon if available, otherwise use default icons */}
        <div className="flex-shrink-0 text-gray-400">
          {isImageIcon && !iconError ? (
            // If icon is a URL or data URL, display as image
            <img
              src={category.icon}
              alt={category.name}
              className="w-5 h-5 object-contain rounded"
              onError={() => setIconError(true)}
            />
          ) : (
            // Default icons based on children state
            hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Folder className="w-5 h-5" strokeWidth={1.5} />
              )
            ) : (
              <Tag className="w-5 h-5" strokeWidth={1.5} />
            )
          )}
        </div>

        {/* Category name - dark gray text */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-base text-gray-700 font-normal truncate">
            {category.name}
          </span>
          {!category.is_active && (
            <span className="text-sm text-gray-400 italic">(inactive)</span>
          )}
        </div>

        {/* Status toggle - minimal */}
        <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Toggle
            checked={category.is_active}
            onChange={() => onToggleCategoryStatus(category)}
            disabled={togglingItems.has(category.id)}
            size="sm"
          />
        </div>

        {/* Actions - minimal, appear on hover */}
        <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddSubcategory(category.id)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Add subcategory"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditCategory(category)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Edit category"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteCategory(category)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              expandedNodes={expandedNodes}
              togglingItems={togglingItems}
              onToggleExpansion={onToggleExpansion}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              onAddSubcategory={onAddSubcategory}
              onToggleCategoryStatus={onToggleCategoryStatus}
              level={level + 1}
              parentPath={getFullPath()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to build tree structure from flat array
const buildCategoryTree = (flatCategories: Category[]): Category[] => {
  const categoryMap = new Map<number, Category>();
  const rootCategories: Category[] = [];

  flatCategories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  flatCategories.forEach((cat) => {
    const category = categoryMap.get(cat.id)!;
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  return rootCategories;
};

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  expandedNodes,
  togglingItems,
  onToggleExpansion,
  onEditCategory,
  onDeleteCategory,
  onAddSubcategory,
  onToggleCategoryStatus,
}) => {
  const hasTreeStructure = categories.some(
    (cat) =>
      (cat.children || cat.subcategories) &&
      (cat.children || cat.subcategories)!.length > 0
  );

  const rootCategories = hasTreeStructure
    ? categories.filter((cat) => !cat.parent_id)
    : buildCategoryTree(categories);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Simple header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Category Hierarchy
        </h2>
      </div>

      {/* Tree container */}
      <div className="py-2 min-h-[400px] max-h-[600px] overflow-y-auto">
        {rootCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Folder
              className="w-12 h-12 text-gray-300 mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm text-gray-500">No categories found</p>
          </div>
        ) : (
          <div>
            {rootCategories.map((category) => (
              <CategoryTreeNode
                key={category.id}
                category={category}
                expandedNodes={expandedNodes}
                togglingItems={togglingItems}
                onToggleExpansion={onToggleExpansion}
                onEditCategory={onEditCategory}
                onDeleteCategory={onDeleteCategory}
                onAddSubcategory={onAddSubcategory}
                onToggleCategoryStatus={onToggleCategoryStatus}
                level={0}
                parentPath={[]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTree;


