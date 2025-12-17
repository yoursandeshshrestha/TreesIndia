import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
} from "lucide-react";
import { Category } from "../types";

interface CategoryTreeSelectorProps {
  categories: Category[];
  selectedCategoryId: number;
  onSelect: (categoryId: number) => void;
}

interface CategoryTreeNodeProps {
  category: Category;
  selectedCategoryId: number;
  onSelect: (categoryId: number) => void;
  level: number;
  expandedNodes: Set<number>;
  onToggleExpand: (categoryId: number) => void;
  allCategories: Category[];
}

// Helper function to get all parent category IDs for a given category
const getParentCategoryIds = (
  category: Category,
  allCategories: Category[]
): number[] => {
  const parentIds: number[] = [];
  let current = category;

  while (current.parent_id) {
    const parent = allCategories.find((c) => c.id === current.parent_id);
    if (parent) {
      parentIds.push(parent.id);
      current = parent;
    } else {
      break;
    }
  }

  return parentIds;
};

// Helper function to check if a category is in the parent chain of the selected category
const isInParentChainOfSelected = (
  category: Category,
  selectedCategoryId: number,
  allCategories: Category[]
): boolean => {
  if (category.id === selectedCategoryId) return false; // Don't mark the selected category itself as a parent

  const selectedCategory = allCategories.find(
    (c) => c.id === selectedCategoryId
  );
  if (!selectedCategory) return false;

  // Get all parent IDs of the selected category
  const parentIds = getParentCategoryIds(selectedCategory, allCategories);
  // Check if this category is one of the parents
  return parentIds.includes(category.id);
};

// Helper function to find a category in the tree recursively
const findCategoryInTree = (
  cats: Category[],
  targetId: number
): Category | null => {
  for (const cat of cats) {
    if (cat.id === targetId) return cat;
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryInTree(cat.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

const CategoryTreeNode: React.FC<CategoryTreeNodeProps> = ({
  category,
  selectedCategoryId,
  onSelect,
  level,
  expandedNodes,
  onToggleExpand,
  allCategories,
}) => {
  const hasChildren = (category.children || []).length > 0;
  const isExpanded = expandedNodes.has(category.id);
  const isSelected = selectedCategoryId === category.id;
  const isInParentChain = isInParentChainOfSelected(
    category,
    selectedCategoryId,
    allCategories
  );
  const isChecked = isSelected || isInParentChain;
  const children = category.children || [];
  const indentWidth = 28;

  return (
    <div>
      {/* Category row */}
      <div
        className="flex items-center gap-3 py-3 px-3 hover:bg-gray-50 rounded cursor-pointer group"
        style={{ paddingLeft: `${level * indentWidth + 12}px` }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect(category.id);
        }}
      >
        {/* Expand/Collapse button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleExpand(category.id);
          }}
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

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(category.id);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`w-5 h-5 rounded border-2 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${
            isChecked
              ? isInParentChain
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-blue-600 border-blue-600 text-white"
              : "border-gray-300 bg-white"
          }`}
          disabled={isInParentChain} // Disable if this is a parent of the selected category
        />

        {/* Icon */}
        <div
          className={`flex-shrink-0 ${
            isChecked && isInParentChain ? "text-blue-500" : "text-gray-400"
          }`}
        >
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <Folder className="w-5 h-5" strokeWidth={1.5} />
            )
          ) : (
            <Tag className="w-5 h-5" strokeWidth={1.5} />
          )}
        </div>

        {/* Category name */}
        <span
          className={`text-base flex-1 ${
            isChecked
              ? isInParentChain
                ? "font-semibold text-blue-600"
                : "font-semibold text-gray-900"
              : "text-gray-700"
          }`}
        >
          {category.name}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              allCategories={allCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTreeSelector: React.FC<CategoryTreeSelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelect,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const toggleExpand = (categoryId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

  // Get all categories (flattened) for parent lookup - memoized for performance
  const allCategories = React.useMemo(() => {
    const result: Category[] = [];
    const flatten = (cat: Category) => {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach(flatten);
      }
    };
    categories.forEach(flatten);
    return result;
  }, [categories]);

  // Auto-expand parent categories when a category is selected
  React.useEffect(() => {
    // Wait for categories to be loaded
    if (categories.length === 0) {
      return;
    }

    const roots = categories.filter((cat) => !cat.parent_id);
    const newExpanded = new Set<number>();

    // Always expand all root categories by default to show the tree
    roots.forEach((cat) => newExpanded.add(cat.id));

    if (selectedCategoryId && selectedCategoryId > 0) {
      // First try to find in flattened list
      let selectedCategory = allCategories.find(
        (c) => c.id === selectedCategoryId
      );

      // If not found in flattened list, search recursively in tree
      if (!selectedCategory) {
        selectedCategory = findCategoryInTree(
          categories,
          selectedCategoryId
        ) as Category;
      }

      if (selectedCategory) {
        // Get all parent IDs in the chain
        const parentIds = getParentCategoryIds(selectedCategory, allCategories);

        // Expand all parent categories (this includes the root if it's a parent)
        parentIds.forEach((id) => newExpanded.add(id));

        // Find and expand the root category that contains the selected category
        const findRootCategory = (cat: Category): Category | null => {
          if (!cat.parent_id) return cat;
          const parent = allCategories.find((c) => c.id === cat.parent_id);
          return parent ? findRootCategory(parent) : null;
        };

        const rootCategory = findRootCategory(selectedCategory);
        if (rootCategory) {
          newExpanded.add(rootCategory.id);
        }

        // If the selected category itself has children, expand it too
        if (selectedCategory.children && selectedCategory.children.length > 0) {
          newExpanded.add(selectedCategory.id);
        }
      }
    }

    setExpandedNodes(newExpanded);
  }, [selectedCategoryId, categories, allCategories]);

  // Get root categories (no parent_id)
  const rootCategories = categories.filter((cat) => !cat.parent_id);

  return (
    <div
      className="border border-gray-200 rounded-lg bg-white max-h-[600px] overflow-y-auto"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {rootCategories.length === 0 ? (
        <div className="p-6 text-center text-base text-gray-500">
          No categories available
        </div>
      ) : (
        <div className="p-4">
          {rootCategories.map((category) => (
            <CategoryTreeNode
              key={category.id}
              category={category}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              level={0}
              expandedNodes={expandedNodes}
              onToggleExpand={toggleExpand}
              allCategories={allCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryTreeSelector;

