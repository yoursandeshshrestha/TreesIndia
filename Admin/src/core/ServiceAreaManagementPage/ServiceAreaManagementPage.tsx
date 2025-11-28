"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader } from "lucide-react";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import { apiClient } from "@/lib/api-client";
import ServiceAreaHeader from "./components/ServiceAreaHeader";
import ServiceAreaFilters from "./components/ServiceAreaFilters";
import ServiceAreaTable from "./components/ServiceAreaTable";
import ServiceAreaModal from "./components/ServiceAreaModal";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import { ServiceArea, CreateServiceAreaRequest } from "../ServicesManagementPage/types";

export default function ServiceAreaManagementPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingArea, setDeletingArea] = useState<ServiceArea | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sortBy: "updated_at",
    sortOrder: "desc",
  });

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
    }
    setIsSearching(false);
  }, [debouncedSearch, filters.search]);

  // Load service areas
  const loadServiceAreas = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/admin/service-areas");
      const areas = response.data.data || [];
      setServiceAreas(areas);
    } catch (error) {
      console.error("Error loading service areas:", error);
      toast.error("Failed to load service areas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServiceAreas();
  }, []);

  // Filter service areas based on current filters
  const filteredAreas = serviceAreas.filter((area) => {
    const matchesSearch =
      !filters.search ||
      area.city.toLowerCase().includes(filters.search.toLowerCase()) ||
      area.state.toLowerCase().includes(filters.search.toLowerCase()) ||
      area.country.toLowerCase().includes(filters.search.toLowerCase()) ||
      (area.pincodes && area.pincodes.some((p) => p.includes(filters.search)));

    const matchesStatus =
      !filters.status ||
      (filters.status === "active" ? area.is_active : !area.is_active);

    return matchesSearch && matchesStatus;
  });

  // Sort filtered areas
  const sortedAreas = [...filteredAreas].sort((a, b) => {
    let comparison = 0;
    switch (filters.sortBy) {
      case "city":
        comparison = a.city.localeCompare(b.city);
        break;
      case "state":
        comparison = a.state.localeCompare(b.state);
        break;
      case "country":
        comparison = a.country.localeCompare(b.country);
        break;
      case "updated_at":
        const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        comparison = aDate - bDate;
        break;
      default:
        comparison = 0;
    }
    return filters.sortOrder === "asc" ? comparison : -comparison;
  });

  // Handle create
  const handleCreate = () => {
    setEditingArea(null);
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (area: ServiceArea) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  // Handle submit (create or update)
  const handleSubmit = async (data: CreateServiceAreaRequest) => {
    setIsSubmitting(true);
    try {
      if (editingArea) {
        // Update
        const response = await apiClient.put(
          `/admin/service-areas/${editingArea.id}`,
          data
        );
        setServiceAreas((prev) =>
          prev.map((area) =>
            area.id === editingArea.id ? response.data.data : area
          )
        );
        toast.success("Service area updated successfully");
      } else {
        // Create
        const response = await apiClient.post("/admin/service-areas", data);
        setServiceAreas((prev) => [...prev, response.data.data]);
        toast.success("Service area created successfully");
      }
      setIsModalOpen(false);
      setEditingArea(null);
      loadServiceAreas();
    } catch (error) {
      console.error("Error saving service area:", error);
      toast.error("Failed to save service area");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (area: ServiceArea) => {
    setDeletingArea(area);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingArea) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/admin/service-areas/${deletingArea.id}`);
      setServiceAreas((prev) => prev.filter((area) => area.id !== deletingArea.id));
      toast.success("Service area deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingArea(null);
    } catch (error) {
      console.error("Error deleting service area:", error);
      toast.error("Failed to delete service area");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingArea(null);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      sortBy: "updated_at",
      sortOrder: "desc",
    });
    setLocalSearch("");
  };

  if (isLoading && serviceAreas.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ServiceAreaHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
        }}
        onRefresh={loadServiceAreas}
        onCreateServiceArea={handleCreate}
      />

      <ServiceAreaFilters
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
        }}
        onSortByChange={(value) => {
          setFilters((prev) => ({ ...prev, sortBy: value }));
        }}
        onSortOrderChange={(value) => {
          setFilters((prev) => ({ ...prev, sortOrder: value }));
        }}
        onClear={clearFilters}
        onClearSearch={() => {
          setLocalSearch("");
          setIsSearching(false);
        }}
        isSearching={isSearching}
      />

      <ServiceAreaTable
        serviceAreas={sortedAreas}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {sortedAreas.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center h-[400px] w-full flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No service areas found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <ServiceAreaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingArea(null);
        }}
        serviceArea={editingArea}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Service Area"
        message={`Are you sure you want to delete "${deletingArea?.city}, ${deletingArea?.state}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
