"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import Pagination from "@/components/Pagination/Pagination";
import { Loader, Users } from "lucide-react";
import { api } from "@/lib/api-client";

// Components
import WorkerHeader from "./components/WorkerHeader";
import WorkerFilters from "./components/WorkerFilters";
import WorkerTable from "./components/WorkerTable";

// Types and interfaces
import { EnhancedWorker, WorkerFilterState, User } from "@/types/worker";

interface WorkersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      current_page: number;
      total_pages: number;
      total: number;
      limit: number;
    };
  };
  timestamp: string;
}

function WorkersPage() {
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [workers, setWorkers] = useState<EnhancedWorker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<EnhancedWorker | null>(
    null
  );

  // Filters
  const [filters, setFilters] = useState<WorkerFilterState>({
    search: "",
    is_active: "",
    worker_type: "",
    user_type: "worker", // Always set to worker
    date_from: "",
    date_to: "",
  });

  // Sync URL params with state on mount
  useEffect(() => {
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const is_active = searchParams.get("is_active");
    const worker_type = searchParams.get("worker_type");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    if (page) setCurrentPage(Number(page));
    if (limit) setItemsPerPage(Number(limit));
    if (search) setLocalSearch(search);
    if (is_active) setFilters((prev) => ({ ...prev, is_active }));
    if (worker_type) setFilters((prev) => ({ ...prev, worker_type }));
    if (date_from) setFilters((prev) => ({ ...prev, date_from }));
    if (date_to) setFilters((prev) => ({ ...prev, date_to }));
    // Note: user_type is always "worker" for this page

    loadWorkers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  const loadWorkers = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        user_type: "worker", // Always filter for workers
        ...(filters.search && { search: filters.search }),
        ...(filters.is_active && { is_active: filters.is_active }),
        ...(filters.worker_type && { worker_type: filters.worker_type }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      });

      const data = await api.get(`/admin/users?${params}`);
      const response = data as WorkersResponse;

      // Transform the data to map ID to id for compatibility
      // Note: The API returns users with worker data preloaded
      const transformedWorkers = (response?.data?.users || [])
        .filter((user: User) => {
          // Only include users that have worker data
          return user.worker != null;
        })
        .map((user: User) => {
          const worker = user.worker!; // Non-null assertion since we filtered for it

          // Helper function to parse JSON if it's a string, otherwise return as-is
          const parseIfString = <T,>(value: T | string, defaultValue: T): T => {
            if (!value) return defaultValue;
            if (typeof value === 'string') {
              try {
                return JSON.parse(value);
              } catch {
                return defaultValue;
              }
            }
            return value as T;
          };

          return {
            ID: user.ID, // Use user ID for navigation
            id: user.ID, // Add lowercase id for compatibility
            CreatedAt: worker.CreatedAt,
            UpdatedAt: worker.UpdatedAt,
            DeletedAt: worker.DeletedAt,
            user_id: worker.user_id,
            role_application_id: worker.role_application_id,
            worker_type: worker.worker_type,
            contact_info: parseIfString(worker.contact_info, { alternative_number: "" }),
            address: parseIfString(worker.address, {
              street: "",
              city: "",
              state: "",
              pincode: "",
              landmark: "",
            }),
            banking_info: parseIfString(worker.banking_info, {
              account_number: "",
              ifsc_code: "",
              bank_name: "",
              account_holder_name: "",
            }),
            documents: parseIfString(worker.documents, {
              aadhar_card: "",
              pan_card: "",
              profile_pic: user.avatar || "",
              police_verification: "",
            }),
            skills: parseIfString(worker.skills, []),
            experience_years: worker.experience_years,
            is_available: worker.is_available,
            rating: worker.rating,
            total_bookings: worker.total_bookings,
            earnings: worker.earnings,
            total_jobs: worker.total_jobs,
            is_active: worker.is_active,
            user: {
              ...user,
              id: user.ID, // Add lowercase id for compatibility
            },
          };
        });

      setWorkers(transformedWorkers);
      setTotalPages(response?.data?.pagination?.total_pages || 1);
    } catch (err) {
      toast.error("Error loading workers");
      console.error("Failed to load workers", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  // Load workers when filters or pagination changes
  useEffect(() => {
    loadWorkers();
  }, [currentPage, itemsPerPage, filters, loadWorkers]);

  const handleDeleteWorker = async (worker: EnhancedWorker) => {
    try {
      await api.delete(`/admin/users/${worker.ID}`);
      toast.success("Worker deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedWorker(null);
      loadWorkers();
    } catch (err) {
      console.error("Failed to delete worker", err);
      toast.error("Failed to delete worker");
    }
  };

  const handleDeleteWorkerClick = (worker: EnhancedWorker) => {
    setSelectedWorker(worker);
    setIsDeleteModalOpen(true);
  };

  if (isLoading && workers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <WorkerHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
        }}
        onRefresh={loadWorkers}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedWorker(null);
        }}
        onConfirm={() => selectedWorker && handleDeleteWorker(selectedWorker)}
        title="Delete Worker"
        message={`Are you sure you want to delete this worker? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <WorkerFilters
        search={localSearch}
        is_active={filters.is_active}
        worker_type={filters.worker_type}
        onSearchChange={(value) => {
          setLocalSearch(value);
          setIsSearching(true);
        }}
        onActiveChange={(value) => {
          setFilters((prev) => ({ ...prev, is_active: value }));
          setCurrentPage(1);
        }}
        onWorkerTypeChange={(value) => {
          setFilters((prev) => ({ ...prev, worker_type: value }));
          setCurrentPage(1);
        }}
        onClear={() => {
          setFilters({
            search: "",
            is_active: "",
            worker_type: "",
            user_type: "worker", // Keep worker filter
            date_from: "",
            date_to: "",
          });
          setLocalSearch("");
          setIsSearching(false);
        }}
        user_type={filters.user_type}
        onUserTypeChange={(value) => {
          setFilters((prev) => ({ ...prev, user_type: value }));
          setCurrentPage(1);
        }}
        isSearching={isSearching}
      />

      <WorkerTable
        workers={workers}
        onDeleteWorker={handleDeleteWorkerClick}
      />

      {workers.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center h-[400px] w-full flex items-center justify-center">
          <div className="text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No workers found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}

export default WorkersPage;
