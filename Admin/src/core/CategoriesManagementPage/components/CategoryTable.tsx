import React from "react";
import CategoryTree from "./CategoryTree";
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
  onToggleExpansion,
  onEditCategory,
  onDeleteCategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onAddSubcategory,
  onToggleCategoryStatus,
  onToggleSubcategoryStatus,
}: CategoryTableProps) => {
  return (
    <CategoryTree
      categories={categories}
      expandedNodes={expandedCategories}
      togglingItems={togglingItems}
      onToggleExpansion={onToggleExpansion}
      onEditCategory={onEditCategory}
      onDeleteCategory={onDeleteCategory}
      onAddSubcategory={onAddSubcategory}
      onToggleCategoryStatus={(category) => {
        if (category.parent_id) {
          onToggleSubcategoryStatus(category as Subcategory);
        } else {
          onToggleCategoryStatus(category);
        }
      }}
    />
  );
};

export default CategoryTable;
