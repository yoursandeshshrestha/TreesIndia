"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import { Loader, Tag } from "lucide-react";

// Components
import SubcategoryHeader from "./components/SubcategoryHeader";
import SubcategoryTable from "./components/SubcategoryTable";
import { SubcategoryModal } from "./components/SubcategoryModal";
import SubcategoryFilters from "./components/SubcategoryFilters";
import SubcategoryTabs, { ServiceType } from "./components/SubcategoryTabs";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";

// Hooks and types
import { useSubcategories } from "./hooks/useSubcategories";
import {
  Subcategory,
  CreateSubcategoryRequest,
  UpdateSubcategoryRequest,
} from "./types";

function SubcategoriesManagementPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    serviceType: "all" as ServiceType,
    sortBy: "name",
    sortOrder: "asc",
  });

  const {
    subcategories: apiSubcategories,
    categories: apiCategories,
    isLoading: apiLoading,
    error: apiError,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    fetchSubcategories,
    fetchCategories,
    toggleSubcategoryStatus,
  } = useSubcategories();

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
    // Stop searching when debounced value is applied
    setIsSearching(false);
  }, [debouncedSearch, filters.search]);

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
      fetchSubcategories();
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
      fetchSubcategories();
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
      fetchSubcategories();
    } catch (err) {
      toast.error("Failed to delete subcategory. Please try again.");
    }
  };

  const [togglingItems, setTogglingItems] = useState<Set<number>>(new Set());

  const handleToggleSubcategoryStatus = async (subcategory: Subcategory) => {
    if (togglingItems.has(subcategory.id)) return;

    try {
      setTogglingItems((prev) => new Set(prev).add(subcategory.id));
      await toggleSubcategoryStatus(subcategory.id);
      toast.success(
        `Subcategory "${subcategory.name}" ${
          !subcategory.is_active ? "activated" : "deactivated"
        } successfully`
      );
    } catch (err) {
      toast.error("Failed to toggle subcategory status. Please try again.");
    } finally {
      setTogglingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(subcategory.id);
        return newSet;
      });
    }
  };

  const handleEditSubcategory = async (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsSubcategoryModalOpen(true);
    await fetchCategories();
  };

  const handleDeleteSubcategoryClick = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsDeleteModalOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      serviceType: "all",
      sortBy: "name",
      sortOrder: "asc",
    });
    setLocalSearch("");
    setCurrentPage(1);
    toast.success("Filters cleared successfully");
  };

  // Helper function to determine service type based on category name
  const getServiceType = (subcategory: Subcategory): ServiceType => {
    const categoryName = subcategory.parent?.name?.toLowerCase() || "";

    if (
      categoryName.includes("home") ||
      categoryName.includes("cleaning") ||
      categoryName.includes("maid")
    ) {
      return "home";
    } else if (
      categoryName.includes("construction") ||
      categoryName.includes("building") ||
      categoryName.includes("renovation")
    ) {
      return "construction";
    }

    return "home"; // Default to home service
  };

  // Calculate counts for each service type
  const serviceTypeCounts = {
    all: apiSubcategories.length,
    home: apiSubcategories.filter((sub) => getServiceType(sub) === "home")
      .length,
    construction: apiSubcategories.filter(
      (sub) => getServiceType(sub) === "construction"
    ).length,
  };

  // Filter subcategories based on current filters
  const filteredSubcategories = apiSubcategories.filter((subcategory) => {
    const matchesSearch =
      !filters.search ||
      subcategory.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      subcategory.description
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

    const matchesStatus =
      !filters.status ||
      (filters.status === "active"
        ? subcategory.is_active
        : !subcategory.is_active);

    const matchesServiceType =
      filters.serviceType === "all" ||
      getServiceType(subcategory) === filters.serviceType;

    return matchesSearch && matchesStatus && matchesServiceType;
  });

  if (isLoading && apiSubcategories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SubcategoryHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newItemsPerPage: number) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
          fetchSubcategories();
        }}
        onRefresh={fetchSubcategories}
        onCreateSubcategory={async () => {
          setSelectedSubcategory(null);
          setIsSubcategoryModalOpen(true);
          await fetchCategories();
        }}
      />

      <SubcategoryModal
        isOpen={isSubcategoryModalOpen}
        onClose={() => {
          setIsSubcategoryModalOpen(false);
          setSelectedSubcategory(null);
        }}
        subcategory={selectedSubcategory}
        categories={apiCategories}
        isLoading={apiLoading}
        onSubmit={async (
          data: CreateSubcategoryRequest | UpdateSubcategoryRequest,
          imageFile?: File
        ) => {
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
          setSelectedSubcategory(null);
        }}
        onConfirm={() => {
          if (selectedSubcategory) {
            handleDeleteSubcategory(selectedSubcategory);
          }
        }}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selectedSubcategory?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <SubcategoryFilters
        search={localSearch}
        status={filters.status}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSearchChange={(value: string) => {
          setLocalSearch(value);
          setIsSearching(true);
        }}
        onStatusChange={(value: string) => {
          setFilters((prev) => ({ ...prev, status: value }));
          setCurrentPage(1);
          fetchSubcategories();
        }}
        onSortByChange={(value: string) => {
          setFilters((prev) => ({ ...prev, sortBy: value }));
          setCurrentPage(1);
          fetchSubcategories();
        }}
        onSortOrderChange={(value: string) => {
          setFilters((prev) => ({ ...prev, sortOrder: value }));
          setCurrentPage(1);
          fetchSubcategories();
        }}
        onClear={() => {
          setFilters({
            search: "",
            status: "",
            serviceType: "all",
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

      {/* Service Type Tabs */}
      <div className="px-6">
        <SubcategoryTabs
          activeTab={filters.serviceType}
          onTabChange={(serviceType) => {
            setFilters((prev) => ({ ...prev, serviceType }));
            setCurrentPage(1);
          }}
          counts={serviceTypeCounts}
        />
      </div>

      <SubcategoryTable
        subcategories={filteredSubcategories}
        togglingItems={togglingItems}
        onEditSubcategory={handleEditSubcategory}
        onDeleteSubcategory={handleDeleteSubcategoryClick}
        onToggleSubcategoryStatus={handleToggleSubcategoryStatus}
      />

      {filteredSubcategories.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center h-[400px] w-full flex items-center justify-center">
          <div className="text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No subcategories found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubcategoriesManagementPage;
