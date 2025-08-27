"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import { Loader, Tag } from "lucide-react";

// Components
import CategoryHeader from "@/core/CategoriesManagementPage/components/CategoryHeader";
import CategoryFilters from "@/core/CategoriesManagementPage/components/CategoryFilters";
import CategoryTable from "@/core/CategoriesManagementPage/components/CategoryTable";
import { CategoryModal } from "./components/CategoryModal";
import { SubcategoryModal } from "./components/SubcategoryModal";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";

// Hooks and types
import { useCategories } from "./hooks/useCategories";
import {
  Category,
  CreateCategoryRequest,
  CreateSubcategoryRequest,
  Subcategory,
} from "./types";

function CategoriesManagementPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const {
    categories: apiCategories,
    isLoading: apiLoading,
    error: apiError,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    fetchCategories,
    toggleCategoryStatus,
    toggleSubcategoryStatus,
  } = useCategories();

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
    // Stop searching when debounced value is applied
    setIsSearching(false);
  }, [debouncedSearch, filters.search]);

  const handleCreateCategory = async (categoryData: CreateCategoryRequest) => {
    try {
      await createCategory(categoryData);
      toast.success(`Category "${categoryData.name}" created successfully`);
      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to create category. Please try again.");
    }
  };

  const handleUpdateCategory = async (categoryData: CreateCategoryRequest) => {
    if (!selectedCategory) return;

    try {
      await updateCategory(selectedCategory.id, categoryData, imageFile);
      toast.success(`Category "${categoryData.name}" updated successfully`);
      setIsCategoryModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to update category. Please try again.");
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await deleteCategory(category.id);
      toast.success(`Category "${category.name}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category. Please try again.");
    }
  };

  const handleCreateSubcategory = async (
    subcategoryData: CreateSubcategoryRequest,
    imageFile?: File
  ) => {
    try {
      await createSubcategory(subcategoryData, imageFile);
      toast.success(
        `Subcategory "${subcategoryData.name}" created successfully`
      );
      setIsSubcategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to create subcategory. Please try again.");
    }
  };

  const handleUpdateSubcategory = async (
    subcategoryData: CreateSubcategoryRequest,
    imageFile?: File
  ) => {
    if (!selectedSubcategory) return;

    try {
      await updateSubcategory(
        selectedSubcategory.id,
        subcategoryData,
        imageFile
      );
      toast.success(
        `Subcategory "${subcategoryData.name}" updated successfully`
      );
      setIsSubcategoryModalOpen(false);
      setSelectedSubcategory(null);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to update subcategory. Please try again.");
    }
  };

  const handleDeleteSubcategory = async (subcategory: Subcategory) => {
    try {
      await deleteSubcategory(subcategory.id);
      toast.success(`Subcategory "${subcategory.name}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedSubcategory(null);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete subcategory. Please try again.");
    }
  };

  const [togglingItems, setTogglingItems] = useState<Set<number>>(new Set());

  const handleToggleCategoryStatus = async (category: Category) => {
    if (togglingItems.has(category.id)) return;

    // Optimistic update - update UI immediately
    const originalCategories = [...apiCategories];
    const updatedCategories = apiCategories.map((c) =>
      c.id === category.id ? { ...c, is_active: !c.is_active } : c
    );
    setApiCategories(updatedCategories);

    try {
      setTogglingItems((prev) => new Set(prev).add(category.id));
      await toggleCategoryStatus(category.id);
      toast.success(
        `Category "${category.name}" ${
          !category.is_active ? "activated" : "deactivated"
        } successfully`
      );
    } catch (err) {
      // Revert optimistic update on error
      setApiCategories(originalCategories);
      toast.error("Failed to toggle category status. Please try again.");
    } finally {
      setTogglingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(category.id);
        return newSet;
      });
    }
  };

  const handleToggleSubcategoryStatus = async (subcategory: Subcategory) => {
    if (togglingItems.has(subcategory.id)) return;

    // Optimistic update - update UI immediately
    const originalCategories = [...apiCategories];
    const updatedCategories = apiCategories.map((c) => ({
      ...c,
      subcategories:
        c.subcategories?.map((s) =>
          s.id === subcategory.id ? { ...s, is_active: !s.is_active } : s
        ) || [],
    }));
    setApiCategories(updatedCategories);

    try {
      setTogglingItems((prev) => new Set(prev).add(subcategory.id));
      await toggleSubcategoryStatus(subcategory.id);
      toast.success(
        `Subcategory "${subcategory.name}" ${
          !subcategory.is_active ? "activated" : "deactivated"
        } successfully`
      );
    } catch (err) {
      // Revert optimistic update on error
      setApiCategories(originalCategories);
      toast.error("Failed to toggle subcategory status. Please try again.");
    } finally {
      setTogglingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(subcategory.id);
        return newSet;
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsSubcategoryModalOpen(true);
  };

  const handleDeleteCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubcategoryClick = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubcategory = (categoryId: number) => {
    const category = apiCategories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setIsSubcategoryModalOpen(true);
    }
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      sortBy: "name",
      sortOrder: "asc",
    });
    setLocalSearch("");
    setCurrentPage(1);
    toast.success("Filters cleared successfully");
  };

  // Filter categories based on current filters
  const filteredCategories = apiCategories.filter((category) => {
    const matchesSearch =
      !filters.search ||
      category.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      category.description
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

    const matchesStatus =
      !filters.status ||
      (filters.status === "active" ? category.is_active : !category.is_active);

    return matchesSearch && matchesStatus;
  });

  if (isLoading && apiCategories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <CategoryHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
          fetchCategories();
        }}
        onRefresh={fetchCategories}
        onCreateCategory={() => setIsCategoryModalOpen(true)}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSubmit={async (data, imageFile) => {
          if (selectedCategory) {
            await handleUpdateCategory(
              data as CreateCategoryRequest,
              imageFile
            );
          } else {
            await handleCreateCategory(
              data as CreateCategoryRequest,
              imageFile
            );
          }
        }}
      />

      <SubcategoryModal
        isOpen={isSubcategoryModalOpen}
        onClose={() => {
          setIsSubcategoryModalOpen(false);
          setSelectedSubcategory(null);
        }}
        subcategory={selectedSubcategory}
        parentCategory={selectedCategory}
        categories={apiCategories}
        isLoading={apiLoading}
        onSubmit={async (data, imageFile) => {
          if (selectedSubcategory) {
            await handleUpdateSubcategory(
              data as CreateSubcategoryRequest,
              imageFile
            );
          } else {
            await handleCreateSubcategory(
              data as CreateSubcategoryRequest,
              imageFile
            );
          }
        }}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCategory(null);
          setSelectedSubcategory(null);
        }}
        onConfirm={() => {
          if (selectedCategory) {
            handleDeleteCategory(selectedCategory);
          } else if (selectedSubcategory) {
            handleDeleteSubcategory(selectedSubcategory);
          }
        }}
        title="Confirm Delete"
        message={
          selectedCategory
            ? `Are you sure you want to delete "${selectedCategory.name}"? This will also delete all its subcategories.`
            : `Are you sure you want to delete "${selectedSubcategory?.name}"?`
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <CategoryFilters
        search={localSearch}
        status={filters.status}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSearchChange={(value) => {
          setLocalSearch(value);
          setIsSearching(true);
        }}
        onStatusChange={(value) => {
          setFilters((prev) => ({ ...prev, status: value }));
          setCurrentPage(1);
          fetchCategories();
        }}
        onSortByChange={(value) => {
          setFilters((prev) => ({ ...prev, sortBy: value }));
          setCurrentPage(1);
          fetchCategories();
        }}
        onSortOrderChange={(value) => {
          setFilters((prev) => ({ ...prev, sortOrder: value }));
          setCurrentPage(1);
          fetchCategories();
        }}
        onClear={() => {
          setFilters({
            search: "",
            status: "",
            sortBy: "name",
            sortOrder: "asc",
          });
          setLocalSearch("");
          setIsSearching(false);
        }}
        onClearSearch={() => {
          setLocalSearch("");
          setIsSearching(false);
        }}
        isSearching={isSearching}
      />

      <CategoryTable
        categories={filteredCategories}
        expandedCategories={expandedCategories}
        togglingItems={togglingItems}
        onToggleExpansion={toggleCategoryExpansion}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategoryClick}
        onEditSubcategory={handleEditSubcategory}
        onDeleteSubcategory={handleDeleteSubcategoryClick}
        onAddSubcategory={handleAddSubcategory}
        onToggleCategoryStatus={handleToggleCategoryStatus}
        onToggleSubcategoryStatus={handleToggleSubcategoryStatus}
      />

      {filteredCategories.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center h-[400px] w-full flex items-center justify-center">
          <div className="text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No categories found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesManagementPage;
