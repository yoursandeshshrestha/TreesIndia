"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import Pagination from "@/components/Pagination/Pagination";
import { Loader } from "@/components/Loader";
import { api } from "@/lib/api-client";

// Components
import BrokerHeader from "./components/BrokerHeader";
import BrokerFilters from "./components/BrokerFilters";
import BrokerTable from "./components/BrokerTable";

// Types and interfaces
import { EnhancedBroker, BrokerFilterState } from "@/types/broker";
import { User } from "@/types/worker";

interface BrokersResponse {
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

function BrokersPage() {
  const searchParams = useSearchParams();
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [brokers, setBrokers] = useState<EnhancedBroker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<EnhancedBroker | null>(
    null
  );

  // Filters
  const [filters, setFilters] = useState<BrokerFilterState>({
    search: "",
    is_active: "",
    date_from: "",
    date_to: "",
  });

  // Sync URL params with state on mount
  useEffect(() => {
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const is_active = searchParams.get("is_active");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    if (page) setCurrentPage(Number(page));
    if (limit) setItemsPerPage(Number(limit));
    if (search) setLocalSearch(search);
    if (is_active) setFilters((prev) => ({ ...prev, is_active }));
    if (date_from) setFilters((prev) => ({ ...prev, date_from }));
    if (date_to) setFilters((prev) => ({ ...prev, date_to }));

    loadBrokers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  // Load brokers when filters or pagination changes
  useEffect(() => {
    loadBrokers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, filters]);

  const loadBrokers = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        user_type: "broker", // Always filter for brokers
        ...(filters.search && { search: filters.search }),
        ...(filters.is_active && { is_active: filters.is_active }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      });

      const data = await api.get(`/admin/users?${params}`);
      const response = data as BrokersResponse;

      // Transform the data to map ID to id for compatibility
      const transformedBrokers: EnhancedBroker[] = response.data.users
        .filter((user) => user.broker)
        .map((user) => {
          const broker = user.broker!;
          let contactInfo, address, documents;

          try {
            contactInfo = JSON.parse(broker.contact_info);
          } catch {
            contactInfo = { alternative_number: "" };
          }

          try {
            address = JSON.parse(broker.address);
          } catch {
            address = {
              street: "",
              city: "",
              state: "",
              pincode: "",
              landmark: "",
            };
          }

          try {
            documents = JSON.parse(broker.documents);
          } catch {
            documents = {
              aadhar_card: "",
              pan_card: "",
              profile_pic: "",
            };
          }

          return {
            ID: broker.ID,
            id: broker.ID, // For compatibility
            CreatedAt: broker.CreatedAt,
            UpdatedAt: broker.UpdatedAt,
            DeletedAt: broker.DeletedAt,
            user_id: broker.user_id,
            role_application_id: broker.role_application_id,
            contact_info: contactInfo,
            address: address,
            documents: documents,
            license: broker.license,
            agency: broker.agency,
            is_active: broker.is_active,
            user: {
              ...user,
              id: user.ID,
            },
          };
        });

      setBrokers(transformedBrokers);
      setTotalPages(response.data.pagination.total_pages);
    } catch (error) {
      console.error("Error loading brokers:", error);
      toast.error("Failed to load brokers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBrokerClick = (broker: EnhancedBroker) => {
    setSelectedBroker(broker);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBroker = async (broker: EnhancedBroker) => {
    try {
      await api.delete(`/admin/users/${broker.user_id}`);
      toast.success("Broker deleted successfully");
      loadBrokers();
    } catch (error) {
      console.error("Error deleting broker:", error);
      toast.error("Failed to delete broker");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBroker(null);
    }
  };

  // Filter brokers based on search
  const filteredBrokers = brokers.filter((broker) => {
    const searchTerm = filters.search.toLowerCase();
    return (
      broker.user.name.toLowerCase().includes(searchTerm) ||
      broker.user.phone.toLowerCase().includes(searchTerm) ||
      broker.user.email?.toLowerCase().includes(searchTerm) ||
      broker.license.toLowerCase().includes(searchTerm) ||
      broker.agency.toLowerCase().includes(searchTerm)
    );
  });

  if (isLoading && brokers.length === 0) {
    return <Loader fullScreen />;
  }

  return (
    <>
      <BrokerHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
        }}
        onRefresh={loadBrokers}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBroker(null);
        }}
        onConfirm={() => selectedBroker && handleDeleteBroker(selectedBroker)}
        title="Delete Broker"
        message={`Are you sure you want to delete this broker? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <BrokerFilters
        search={localSearch}
        is_active={filters.is_active}
        onSearchChange={(value) => {
          setLocalSearch(value);
        }}
        onActiveChange={(value) => {
          setFilters((prev) => ({ ...prev, is_active: value }));
          setCurrentPage(1);
        }}
        onClear={() => {
          setFilters({
            search: "",
            is_active: "",
            date_from: "",
            date_to: "",
          });
          setLocalSearch("");
        }}
        isSearching={false}
      />

      <BrokerTable
        brokers={filteredBrokers}
        selectionMode={false}
        selectedBrokers={[]}
        onSelectionChange={() => {}}
        onRowClick={() => {}}
        onDeleteBroker={handleDeleteBrokerClick}
      />

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </>
  );
}

export default BrokersPage;
