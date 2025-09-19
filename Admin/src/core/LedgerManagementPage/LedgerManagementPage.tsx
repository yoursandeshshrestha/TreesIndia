"use client";

import React, { useState, useEffect } from "react";
import useDebounce from "@/hooks/useDebounce";
import { BookOpen, Loader } from "lucide-react";
import Pagination from "@/components/Pagination/Pagination";

// Components
import LedgerHeader from "./components/LedgerHeader";
import LedgerSummary from "./components/LedgerSummary";
import LedgerFilters from "./components/LedgerFilters";
import LedgerTable from "./components/LedgerTable";
import LedgerEntryModal from "./components/LedgerEntryModal";
import PaymentModal from "./components/PaymentModal";
import BalanceModal from "./components/BalanceModal";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";

// Hooks and types
import { useLedger } from "./hooks/useLedger";
import {
  LedgerEntry,
  CreateLedgerEntryRequest,
  UpdateLedgerEntryRequest,
  ProcessPaymentRequest,
  UpdateBalanceRequest,
  LedgerFilters as LedgerFiltersType,
} from "./types";

export default function LedgerManagementPage() {
  // State management
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected items
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

  // Filters
  const [filters, setFilters] = useState<LedgerFiltersType>({
    search: "",
    entry_type: "all",
    status: "all",
    payment_source: "all",
    sort_by: "created_at",
    sort_order: "desc",
  });

  // Use ledger hook
  const {
    entries,
    balance,
    summary,
    pagination,
    isLoading,
    fetchEntries,
    fetchBalance,
    fetchSummary,
    createEntry,
    updateEntry,
    deleteEntry,
    processPayment,
    processReceive,
    updateBalance,
    setPage,
  } = useLedger();

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
    }
  }, [debouncedSearch, filters.search]);

  // Fetch entries when filters change
  useEffect(() => {
    fetchEntries(filters);
  }, [fetchEntries, filters, pagination.offset, pagination.limit]);

  // Handle edit entry
  const handleEditEntry = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setIsEntryModalOpen(true);
  };

  // Handle delete entry
  const handleDeleteEntry = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setIsDeleteModalOpen(true);
  };

  // Handle process payment
  const handleProcessPayment = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setIsPaymentModalOpen(true);
  };

  // Handle process receive
  const handleProcessReceive = (entry: LedgerEntry) => {
    setSelectedEntry(entry);
    setIsPaymentModalOpen(true);
  };

  // Handle save entry
  const handleSaveEntry = async (
    data: CreateLedgerEntryRequest | UpdateLedgerEntryRequest
  ) => {
    try {
      if (selectedEntry) {
        await updateEntry(selectedEntry.id, data as UpdateLedgerEntryRequest);
      } else {
        await createEntry(data as CreateLedgerEntryRequest);
      }
      setIsEntryModalOpen(false);
      setSelectedEntry(null);
    } catch {
      // Error handling is done in the hook
    }
  };

  // Handle process payment/receive
  const handleProcessPaymentReceive = async (data: ProcessPaymentRequest) => {
    try {
      if (selectedEntry) {
        if (selectedEntry.entry_type === "pay") {
          await processPayment(selectedEntry.id, data);
        } else {
          await processReceive(selectedEntry.id, data);
        }
        setIsPaymentModalOpen(false);
        setSelectedEntry(null);
      }
    } catch {
      // Error handling is done in the hook
    }
  };

  // Handle update balance
  const handleUpdateBalanceSubmit = async (data: UpdateBalanceRequest) => {
    try {
      await updateBalance(data);
      setIsBalanceModalOpen(false);
    } catch {
      // Error handling is done in the hook
    }
  };

  // Handle delete entry
  const handleDeleteEntryConfirm = async () => {
    try {
      console.log("Selected entry:", selectedEntry);
      if (selectedEntry && selectedEntry.id) {
        console.log("Deleting entry with ID:", selectedEntry.id);
        await deleteEntry(selectedEntry.id);
        setIsDeleteModalOpen(false);
        setSelectedEntry(null);
      } else {
        console.error("No selected entry or entry ID is undefined");
      }
    } catch {
      // Error handling is done in the hook
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchEntries(filters);
    fetchBalance();
    fetchSummary();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
      entry_type: "all",
      status: "all",
      payment_source: "all",
      sort_by: "created_at",
      sort_order: "desc",
    });
    setLocalSearch("");
  };

  // Handle individual filter changes
  const handleEntryTypeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      entry_type: value as "pay" | "receive" | "all",
    }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value as "pending" | "partial" | "completed" | "all",
    }));
  };

  const handlePaymentSourceChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      payment_source: value as "cash" | "bank" | "all",
    }));
  };

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <LedgerHeader
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
        }}
        onRefresh={handleRefresh}
        onCreateEntry={() => setIsEntryModalOpen(true)}
        onUpdateBalance={() => setIsBalanceModalOpen(true)}
      />

      <div className="mt-6">
        <LedgerSummary summary={summary || undefined} />
      </div>

      {/* Filters */}
      <LedgerFilters
        search={localSearch}
        entry_type={filters.entry_type}
        status={filters.status}
        payment_source={filters.payment_source}
        onSearchChange={(value) => {
          setLocalSearch(value);
        }}
        onEntryTypeChange={handleEntryTypeChange}
        onStatusChange={handleStatusChange}
        onPaymentSourceChange={handlePaymentSourceChange}
        onClear={handleClearFilters}
        isSearching={isLoading}
      />

      {/* Table */}
      <LedgerTable
        entries={entries}
        isLoading={isLoading}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        onProcessPayment={handleProcessPayment}
        onProcessReceive={handleProcessReceive}
      />

      {/* Empty State */}
      {entries.length === 0 && !isLoading && (
        <div className="text-gray-400 text-center h-[400px] w-full flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No ledger entries found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {Math.ceil(pagination.total / pagination.limit) > 1 && (
        <div className="mt-6 px-4">
          <Pagination
            currentPage={Math.floor(pagination.offset / pagination.limit) + 1}
            totalPages={Math.ceil(pagination.total / pagination.limit)}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Modals */}
      <LedgerEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setSelectedEntry(null);
        }}
        onSave={handleSaveEntry}
        entry={selectedEntry}
        isLoading={isLoading}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedEntry(null);
        }}
        onProcess={handleProcessPaymentReceive}
        entry={selectedEntry}
        isLoading={isLoading}
      />

      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onUpdate={handleUpdateBalanceSubmit}
        balance={balance}
        isLoading={isLoading}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEntry(null);
        }}
        onConfirm={handleDeleteEntryConfirm}
        title="Delete Ledger Entry"
        message={`Are you sure you want to delete the entry "${selectedEntry?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isLoading}
      />
    </div>
  );
}
