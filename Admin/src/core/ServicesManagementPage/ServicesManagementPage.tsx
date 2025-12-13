"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import Pagination from "@/components/Pagination/Pagination";
import { Loader, Package } from "lucide-react";
import { apiClient } from "@/lib/api-client";

// Components
import ServiceHeader from "@/core/ServicesManagementPage/components/ServiceHeader";
import ServiceFilters from "@/core/ServicesManagementPage/components/ServiceFilters";
import ServiceTable from "@/core/ServicesManagementPage/components/ServiceTable";
import ServiceGrid from "@/core/ServicesManagementPage/components/ServiceGrid";
import { ServiceModal } from "@/core/ServicesManagementPage/components/ServiceModal";

// Types and interfaces
import {
  Service,
  Category,
  CreateServiceRequest,
  UpdateServiceRequest,
} from "./types";

interface ServiceFilterState {
  search: string;
  status: string;
  priceType: string;
  categoryId: string;
  subcategoryId: string; // Legacy - kept for backward compatibility
  sortBy: string;
  sortOrder: string;
}

function ServicesManagementPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // Subcategories removed - using unified category structure
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const isLoadingRef = useRef(false);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  // Filters
  const [filters, setFilters] = useState<ServiceFilterState>({
    search: "",
    status: "all",
    priceType: "all",
    categoryId: "",
    subcategoryId: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  const loadServices = useCallback(async () => {
    if (isLoadingRef.current) return; // Prevent multiple simultaneous calls

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== "all" && {
          exclude_inactive: filters.status === "inactive" ? "false" : "true",
        }),
        ...(filters.priceType !== "all" && {
          type: filters.priceType === "fixed" ? "fixed-price" : "inquiry-based",
        }),
        ...(filters.categoryId && { category: filters.categoryId }),
        // Subcategory filter removed - use categoryId instead
        ...(filters.sortBy && { sort_by: filters.sortBy }),
        ...(filters.sortOrder && { sort_order: filters.sortOrder }),
      });

      const response = await apiClient.get(`/services?${params}`);
      const responseData = response.data.data;

      if (
        responseData &&
        typeof responseData === "object" &&
        "services" in responseData
      ) {
        // New paginated response structure
        const services = responseData.services || [];
        const pagination = responseData.pagination || {};

        setServices(services);
        setTotalPages(pagination.total_pages || 1);
      } else {
        // Fallback for old response structure
        const services = responseData || [];
        setServices(services);
        setTotalPages(1);
      }
    } catch {
      toast.error("Error loading services");
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, itemsPerPage, filters]);

  // Load services when filters or pagination changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadServices();
    }, 300); // Debounce filter changes

    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, filters, loadServices]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await apiClient.get(
        "/admin/categories?include=children"
      );
      const categories = response.data.data || [];
      setCategories(categories);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadSubcategories = async (categoryId?: number) => {
    setIsLoadingSubcategories(true);
    try {
      let url = "/subcategories";
      if (categoryId) {
        url += `/category/${categoryId}`;
      }
      const response = await apiClient.get(url);
      const subcategories = response.data.data || [];
      setSubcategories(subcategories);
    } catch {
      toast.error("Failed to load subcategories");
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  // Lazy loading functions
  const handleCategoryDropdownOpen = async () => {
    if (categories.length === 0) {
      await loadCategories();
    }
  };

  // handleSubcategoryDropdownOpen removed - using unified category structure

  const handleDeleteService = async (service: Service) => {
    try {
      setIsLoading(true);
      await apiClient.delete(`/admin/services/${service.id}`);
      toast.success(`Service "${service.name}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedService(null);
      loadServices();
    } catch {
      toast.error("Failed to delete service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [togglingItems, setTogglingItems] = useState<Set<number>>(new Set());

  const handleToggleServiceStatus = async (service: Service) => {
    if (togglingItems.has(service.id)) return;

    // Optimistic update - update UI immediately
    const originalServices = [...services];
    const updatedServices = services.map((s) =>
      s.id === service.id ? { ...s, is_active: !s.is_active } : s
    );
    setServices(updatedServices);

    try {
      setTogglingItems((prev) => new Set(prev).add(service.id));
      await apiClient.patch(`/admin/services/${service.id}/status`, {});
      toast.success(
        `Service "${service.name}" ${
          !service.is_active ? "activated" : "deactivated"
        } successfully`
      );
      // Refresh data to ensure consistency
      loadServices();
    } catch {
      // Revert optimistic update on error
      setServices(originalServices);
      toast.error("Failed to toggle service status. Please try again.");
    } finally {
      setTogglingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(service.id);
        return newSet;
      });
    }
  };

  const handleEditService = async (service: Service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);

    // Load categories if not already loaded
    if (categories.length === 0) {
      await loadCategories();
    }

    // Subcategory loading removed - using unified category structure
  };

  // Wrapper function for the table action (non-async)
  const handleEditServiceWrapper = (service: Service) => {
    handleEditService(service).catch((error) => {
      console.error("Error in handleEditService:", error);
      toast.error("Failed to load service data");
    });
  };

  const handleUpdateService = async (
    data: CreateServiceRequest | UpdateServiceRequest,
    imageFiles?: File[]
  ) => {
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add basic fields - ensure required fields are present
      const name = data.name || selectedService.name;
      const description = data.description || selectedService.description || "";
      const priceType = data.price_type || selectedService.price_type;
      const categoryId = data.category_id || selectedService.category_id;
      // subcategoryId removed - using single category_id
      const isActive =
        data.is_active !== undefined
          ? data.is_active
          : selectedService.is_active;

      formData.append("name", name || "");
      formData.append("description", description || "");
      formData.append("price_type", priceType);

      if (data.price !== undefined && data.price !== null) {
        formData.append("price", data.price.toString());
      }
      if (data.duration) {
        formData.append("duration", data.duration);
      }
      formData.append("category_id", categoryId?.toString() || "0");
      formData.append("is_active", isActive?.toString() || "true");

      // Add images
      if (imageFiles) {
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      await apiClient.put(`/admin/services/${selectedService.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Service updated successfully");
      setIsEditModalOpen(false);
      setSelectedService(null);
      loadServices();
    } catch {
      toast.error("Failed to update service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      priceType: "all",
      categoryId: "",
      subcategoryId: "",
      sortBy: "name",
      sortOrder: "asc",
    });
    setLocalSearch("");
    setCurrentPage(1);
  };

  // Filter services based on current filters
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      !filters.search ||
      service.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      service.description?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" ? service.is_active : !service.is_active);

    const matchesPriceType =
      filters.priceType === "all" || service.price_type === filters.priceType;

    const matchesCategory =
      !filters.categoryId ||
      service.category_id === parseInt(filters.categoryId);

    const matchesSubcategory =
      !filters.subcategoryId ||
      service.subcategory_id === parseInt(filters.subcategoryId);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriceType &&
      matchesCategory &&
      matchesSubcategory
    );
  });

  if (isLoading && services.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div>
        <ServiceHeader
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
          onRefresh={loadServices}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedService(null);
          }}
          onConfirm={() => {
            if (selectedService) {
              handleDeleteService(selectedService);
            }
          }}
          title="Confirm Delete"
          message={
            selectedService
              ? `Are you sure you want to delete "${selectedService.name}"? This action cannot be undone.`
              : ""
          }
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />

        <ServiceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          categories={categories}
          // subcategories prop removed
          onSubmit={handleUpdateService}
          isLoading={isSubmitting || isLoadingCategories}
          // onCategoryChange removed - no longer needed
        />

        <ServiceFilters
          search={localSearch}
          status={filters.status}
          priceType={filters.priceType}
          categoryId={filters.categoryId}
          subcategoryId={filters.subcategoryId}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          categories={categories}
          // subcategories prop removed
          onSearchChange={(value) => {
            setLocalSearch(value);
            setIsSearching(true);
          }}
          onStatusChange={(value) => {
            setFilters((prev) => ({ ...prev, status: value }));
            setCurrentPage(1);
          }}
          onPriceTypeChange={(value) => {
            setFilters((prev) => ({ ...prev, priceType: value }));
            setCurrentPage(1);
          }}
          onCategoryChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              categoryId: value,
              subcategoryId: "", // Reset subcategory when category changes
            }));
            setCurrentPage(1);
          }}
          // onSubcategoryChange removed - using unified category structure
          onSortByChange={(value) => {
            setFilters((prev) => ({ ...prev, sortBy: value }));
            setCurrentPage(1);
          }}
          onSortOrderChange={(value) => {
            setFilters((prev) => ({ ...prev, sortOrder: value }));
            setCurrentPage(1);
          }}
          onClear={clearFilters}
          onClearSearch={() => {
            setLocalSearch("");
            setIsSearching(false);
          }}
          onCategoryDropdownOpen={handleCategoryDropdownOpen}
          // onSubcategoryDropdownOpen removed
          isSearching={isSearching}
        />

        {viewMode === "table" ? (
          <ServiceTable
            services={filteredServices}
            togglingItems={togglingItems}
            onEditService={handleEditServiceWrapper}
            onDeleteService={handleDeleteServiceClick}
            onToggleServiceStatus={handleToggleServiceStatus}
          />
        ) : (
          <ServiceGrid services={filteredServices} />
        )}

        {filteredServices.length === 0 && !isLoading && (
          <div className="text-gray-400 text-center h-[400px] w-full flex items-center justify-center">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No services found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ServicesManagementPage;
