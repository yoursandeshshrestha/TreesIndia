"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import { Loader, Image as ImageIcon } from "lucide-react";

// Components
import { BannerHeader } from "./components/BannerHeader";
import { BannerFilters } from "./components/BannerFilters";
import { BannerTable } from "./components/BannerTable";
import { BannerModal } from "./components/BannerModal";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";

// Hooks and types
import { useBanners } from "./hooks/useBanners";
import {
  PromotionBanner,
  CreateBannerRequest,
  BannerFilters as BannerFiltersType,
} from "./types";

function BannerManagementPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<PromotionBanner | null>(
    null
  );

  // Filters
  const [filters, setFilters] = useState<BannerFiltersType>({
    search: "",
    status: "all",
    sortBy: "title",
    sortOrder: "asc",
  });

  const {
    banners: apiBanners,
    isLoading: apiLoading,
    error: apiError,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    fetchBanners,
  } = useBanners();

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
    // Stop searching when debounced value is applied
    setIsSearching(false);
  }, [debouncedSearch, filters.search]);

  const handleCreateBanner = async (
    bannerData: CreateBannerRequest,
    imageFile?: File
  ) => {
    try {
      await createBanner(bannerData, imageFile);
      toast.success(`Banner "${bannerData.title}" created successfully`);
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error("Failed to create banner. Please try again.");
    }
  };

  const handleUpdateBanner = async (
    bannerData: CreateBannerRequest,
    imageFile?: File
  ) => {
    if (!selectedBanner) return;

    try {
      await updateBanner(selectedBanner.id, bannerData, imageFile);
      toast.success(`Banner "${bannerData.title}" updated successfully`);
      setIsModalOpen(false);
      setSelectedBanner(null);
      fetchBanners();
    } catch (err) {
      toast.error("Failed to update banner. Please try again.");
    }
  };

  const handleDeleteBanner = async (banner: PromotionBanner) => {
    try {
      await deleteBanner(banner.id);
      toast.success(`Banner "${banner.title}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedBanner(null);
      fetchBanners();
    } catch (err) {
      toast.error("Failed to delete banner. Please try again.");
    }
  };

  const [togglingItems, setTogglingItems] = useState<Set<number>>(new Set());

  const handleToggleBannerStatus = async (banner: PromotionBanner) => {
    if (togglingItems.has(banner.id)) return;

    // Optimistic update - update UI immediately
    const originalBanners = [...(apiBanners || [])];
    const updatedBanners = (apiBanners || []).map((b) =>
      b.id === banner.id ? { ...b, is_active: !b.is_active } : b
    );
    // Note: We can't directly set apiBanners as it comes from the hook
    // The optimistic update will be handled by the API response

    try {
      setTogglingItems((prev) => new Set(prev).add(banner.id));
      await toggleBannerStatus(banner.id);
      toast.success(
        `Banner "${banner.title}" ${
          !banner.is_active ? "activated" : "deactivated"
        } successfully`
      );
    } catch (err) {
      toast.error("Failed to toggle banner status. Please try again.");
    } finally {
      setTogglingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(banner.id);
        return newSet;
      });
    }
  };

  const handleEditBanner = (banner: PromotionBanner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleDeleteBannerClick = (banner: PromotionBanner) => {
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handleFiltersChange = (newFilters: BannerFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = (search: string) => {
    setLocalSearch(search);
    setIsSearching(true);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      sortBy: "title",
      sortOrder: "asc",
    });
    setLocalSearch("");
    setCurrentPage(1);
    toast.success("Filters cleared successfully");
  };

  // Filter banners based on current filters
  const filteredBanners = (apiBanners || []).filter((banner) => {
    const matchesSearch =
      !filters.search ||
      banner.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      banner.link?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" ? banner.is_active : !banner.is_active);

    return matchesSearch && matchesStatus;
  });

  // Sort banners
  const sortedBanners = [...filteredBanners].sort((a, b) => {
    const order = filters.sortOrder === "asc" ? 1 : -1;

    switch (filters.sortBy) {
      case "title":
        return order * a.title.localeCompare(b.title);
      case "createdAt":
        return (
          order *
          (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        );
      case "updatedAt":
        return (
          order *
          (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
        );
      default:
        return 0;
    }
  });

  if (isLoading && (!apiBanners || apiBanners.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BannerHeader
        totalBanners={apiBanners?.length || 0}
        activeBanners={(apiBanners || []).filter((b) => b.is_active).length}
        onCreateBanner={() => setIsModalOpen(true)}
        onRefresh={fetchBanners}
      />

      <BannerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBanner(null);
        }}
        banner={selectedBanner}
        onSubmit={async (data, imageFile) => {
          if (selectedBanner) {
            await handleUpdateBanner(data, imageFile);
          } else {
            await handleCreateBanner(data, imageFile);
          }
        }}
        isLoading={isLoading}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBanner(null);
        }}
        onConfirm={() => {
          if (selectedBanner) {
            handleDeleteBanner(selectedBanner);
          }
        }}
        title="Confirm Delete"
        message={
          selectedBanner
            ? `Are you sure you want to delete "${selectedBanner.title}"?`
            : "Are you sure you want to delete this banner?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <BannerFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        isSearching={isSearching}
        localSearch={localSearch}
      />

      <BannerTable
        banners={sortedBanners}
        togglingItems={togglingItems}
        onEditBanner={handleEditBanner}
        onDeleteBanner={handleDeleteBannerClick}
        onToggleBannerStatus={handleToggleBannerStatus}
      />

      {sortedBanners.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center h-[400px] w-full flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No banners found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BannerManagementPage;
