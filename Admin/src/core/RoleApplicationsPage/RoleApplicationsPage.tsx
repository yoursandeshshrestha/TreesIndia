"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import Pagination from "@/components/Pagination/Pagination";
import { Loader } from "@/components/Loader";
import { FileText } from "lucide-react";
import { api } from "@/lib/api-client";

// Components
import RoleApplicationHeader from "@/core/RoleApplicationsPage/components/RoleApplicationHeader";
import RoleApplicationFilters from "@/core/RoleApplicationsPage/components/RoleApplicationFilters";
import RoleApplicationTable from "@/core/RoleApplicationsPage/components/RoleApplicationTable";

// Types and interfaces
import {
  EnhancedRoleApplication,
  RoleApplicationFilterState,
} from "@/types/roleApplication";

interface RoleApplicationsResponse {
  success: boolean;
  message: string;
  data: {
    applications: EnhancedRoleApplication[];
    pagination: {
      current_page: number;
      total_pages: number;
      total: number;
      limit: number;
    };
  };
  timestamp: string;
}

function RoleApplicationsPage() {
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [applications, setApplications] = useState<EnhancedRoleApplication[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );
  const [selectionMode] = useState(false);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<EnhancedRoleApplication | null>(null);

  // Filters
  const [filters, setFilters] = useState<RoleApplicationFilterState>({
    search: "",
    status: "",
    requested_role: "",
    date_from: "",
    date_to: "",
  });

  // Sync URL params with state on mount
  useEffect(() => {
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const requested_role = searchParams.get("requested_role");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    if (page) setCurrentPage(Number(page));
    if (limit) setItemsPerPage(Number(limit));
    if (search) setLocalSearch(search);
    if (status) setFilters((prev) => ({ ...prev, status }));
    if (requested_role) setFilters((prev) => ({ ...prev, requested_role }));
    if (date_from) setFilters((prev) => ({ ...prev, date_from }));
    if (date_to) setFilters((prev) => ({ ...prev, date_to }));

    loadApplications();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  const loadApplications = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.requested_role && {
          requested_role: filters.requested_role,
        }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      });

      const data = await api.get(`/admin/role-applications?${params}`);
      const response = data as RoleApplicationsResponse;

      // Transform the data to map ID to id for compatibility
      const transformedApplications = (response?.data?.applications || []).map(
        (app) => ({
          ...app,
          id: app.ID, // Add lowercase id for compatibility
          user: app.user
            ? {
                ...app.user,
                id: app.user.ID, // Add lowercase id for compatibility
              }
            : app.user,
        })
      );

      setApplications(transformedApplications);
      setTotalPages(response?.data?.pagination?.total_pages || 1);
    } catch {
      toast.error("Error loading applications");
    } finally {
      setIsLoading(false);
    }
  };

  // Load applications when filters or pagination changes
  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, filters]);

  const handleDeleteApplication = async (
    application: EnhancedRoleApplication
  ) => {
    try {
      await api.delete(`/admin/role-applications/${application.ID}`);
      toast.success("Application deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedApplication(null);
      loadApplications();
    } catch {
      toast.error("Failed to delete application");
    }
  };

  const handleDeleteApplicationClick = (
    application: EnhancedRoleApplication
  ) => {
    setSelectedApplication(application);
    setIsDeleteModalOpen(true);
  };

  // Filter applications based on current filters
  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      !filters.search ||
      application.user?.name
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      application.user?.email
        ?.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      application.user?.phone?.includes(filters.search);

    const matchesStatus =
      !filters.status || application.status === filters.status;
    const matchesRole =
      !filters.requested_role ||
      application.requested_role === filters.requested_role;

    return matchesSearch && matchesStatus && matchesRole;
  });

  if (isLoading && applications.length === 0) {
    return <Loader fullScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <RoleApplicationHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
        }}
        onRefresh={loadApplications}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedApplication(null);
        }}
        onConfirm={() =>
          selectedApplication && handleDeleteApplication(selectedApplication)
        }
        title="Delete Application"
        message={`Are you sure you want to delete this application? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <RoleApplicationFilters
        search={localSearch}
        status={filters.status}
        requested_role={filters.requested_role}
        onSearchChange={(value) => {
          setLocalSearch(value);
          setIsSearching(true);
        }}
        onStatusChange={(value) => {
          setFilters((prev) => ({ ...prev, status: value }));
          setCurrentPage(1);
        }}
        onRequestedRoleChange={(value) => {
          setFilters((prev) => ({ ...prev, requested_role: value }));
          setCurrentPage(1);
        }}
        onClear={() => {
          setFilters({
            search: "",
            status: "",
            requested_role: "",
            date_from: "",
            date_to: "",
          });
          setLocalSearch("");
          setIsSearching(false);
        }}
        isSearching={isSearching}
      />

      <RoleApplicationTable
        applications={filteredApplications}
        selectionMode={selectionMode}
        selectedApplications={selectedApplications}
        onSelectionChange={(selected) =>
          setSelectedApplications(selected.map((app) => app.ID.toString()))
        }
        onRowClick={() => {}} // This is now handled by the table component
        onDeleteApplication={handleDeleteApplicationClick}
      />

      {filteredApplications.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center h-[400px] w-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No applications found</p>
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

export default RoleApplicationsPage;
