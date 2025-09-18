"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import { Loader } from "lucide-react";

// Components
import TransactionHeader from "./components/TransactionHeader";
import TransactionFilters from "./components/TransactionFilters";
import TransactionTable from "./components/TransactionTable";
import TransactionStatsCards from "./components/TransactionStatsCards";
import TransactionPreviewModal from "./components/TransactionPreviewModal";
import ExportModal from "./components/ExportModal";
import ManualTransactionForm from "./components/ManualTransactionForm";

// Hooks and types
import { useTransactions } from "@/hooks/useTransactions";
import {
  Transaction,
  TransactionFilters as TransactionFiltersType,
} from "@/types/transaction";

function TransactionManagementPage() {
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 300);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Modal states
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isManualTransactionOpen, setIsManualTransactionOpen] = useState(false);

  // Stats refresh trigger
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  // Filters
  const [filters, setFilters] = useState<TransactionFiltersType>({
    search: "",
    status: "",
    type: "",
    method: "",
    user_email: "",
    user_phone: "",
    min_amount: "",
    max_amount: "",
    start_date: "",
    end_date: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  const {
    transactions,
    isLoading,
    error,
    pagination,
    fetchTransactions,
    clearError,
  } = useTransactions();

  // Sync URL params with state on mount
  useEffect(() => {
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const method = searchParams.get("method");
    const user_email = searchParams.get("user_email");
    const user_phone = searchParams.get("user_phone");
    const min_amount = searchParams.get("min_amount");
    const max_amount = searchParams.get("max_amount");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const sort_by = searchParams.get("sort_by");
    const sort_order = searchParams.get("sort_order");

    if (page) setCurrentPage(Number(page));
    if (limit) setItemsPerPage(Number(limit));
    if (search) setLocalSearch(search);
    if (status) setFilters((prev) => ({ ...prev, status }));
    if (type) setFilters((prev) => ({ ...prev, type }));
    if (method) setFilters((prev) => ({ ...prev, method }));
    if (user_email) setFilters((prev) => ({ ...prev, user_email }));
    if (user_phone) setFilters((prev) => ({ ...prev, user_phone }));
    if (min_amount) setFilters((prev) => ({ ...prev, min_amount }));
    if (max_amount) setFilters((prev) => ({ ...prev, max_amount }));
    if (start_date) setFilters((prev) => ({ ...prev, start_date }));
    if (end_date) setFilters((prev) => ({ ...prev, end_date }));
    if (sort_by) setFilters((prev) => ({ ...prev, sort_by }));
    if (sort_order)
      setFilters((prev) => ({
        ...prev,
        sort_order: sort_order as "asc" | "desc",
      }));

    loadTransactions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearch }));
      setCurrentPage(1);
    }
  }, [debouncedSearch, filters.search]);

  const loadTransactions = useCallback(async () => {
    await fetchTransactions({
      ...filters,
      page: currentPage,
      limit: itemsPerPage,
    });
  }, [currentPage, itemsPerPage, filters, fetchTransactions]);

  // Load transactions when filters or pagination changes
  useEffect(() => {
    loadTransactions();
  }, [currentPage, itemsPerPage, filters, loadTransactions]);

  const handleRefresh = () => {
    loadTransactions();
    toast.success("Data refreshed successfully!");
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsPreviewModalOpen(true);
  };

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const handleExportSuccess = () => {
    setIsExportModalOpen(false);
  };

  const handleManualTransactionSuccess = async () => {
    setIsManualTransactionOpen(false);
    setCurrentPage(1); // Reset to first page to show the new transaction
    toast.success("Manual transaction added successfully!");

    // Trigger stats refresh
    setStatsRefreshTrigger((prev) => prev + 1);

    // Small delay to ensure backend has processed the transaction
    setTimeout(async () => {
      await fetchTransactions({
        ...filters,
        page: 1,
        limit: itemsPerPage,
      });
    }, 500);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      type: "",
      method: "",
      user_email: "",
      user_phone: "",
      min_amount: "",
      max_amount: "",
      start_date: "",
      end_date: "",
      sort_by: "created_at",
      sort_order: "desc",
    });
    setLocalSearch("");
    setCurrentPage(1);
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div>
        <TransactionHeader
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
          onRefresh={handleRefresh}
          onExport={handleExportClick}
          onManualTransaction={() => setIsManualTransactionOpen(true)}
          isLoading={isLoading}
        />

        <div className="">
          {/* Stats Cards */}
          <TransactionStatsCards refreshTrigger={statsRefreshTrigger} />

          <TransactionFilters
            search={localSearch}
            status={filters.status}
            type={filters.type}
            method={filters.method}
            sort_by={filters.sort_by}
            sort_order={filters.sort_order}
            onSearchChange={(value: string) => {
              setLocalSearch(value);
              setIsSearching(true);
            }}
            onStatusChange={(value: string) => {
              setFilters((prev) => ({ ...prev, status: value }));
              setCurrentPage(1);
            }}
            onTypeChange={(value: string) => {
              setFilters((prev) => ({ ...prev, type: value }));
              setCurrentPage(1);
            }}
            onMethodChange={(value: string) => {
              setFilters((prev) => ({ ...prev, method: value }));
              setCurrentPage(1);
            }}
            onSortByChange={(value: string) => {
              setFilters((prev) => ({ ...prev, sort_by: value }));
            }}
            onSortOrderChange={(value: "asc" | "desc") => {
              setFilters((prev) => ({ ...prev, sort_order: value }));
            }}
            onClear={clearFilters}
            isSearching={isSearching}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-red-600">
                  <span className="font-medium">
                    Error loading transactions:
                  </span>{" "}
                  {error}
                </div>
                <button
                  onClick={clearError}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <TransactionTable
            transactions={transactions}
            onTransactionClick={handleTransactionClick}
          />

          {pagination.total_pages > 1 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, pagination.total)} of{" "}
                  {pagination.total} transactions
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {pagination.total_pages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(pagination.total_pages, prev + 1)
                      )
                    }
                    disabled={currentPage === pagination.total_pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TransactionPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filters={filters}
        onSuccess={handleExportSuccess}
      />

      {/* Manual Transaction Modal */}
      <ManualTransactionForm
        isOpen={isManualTransactionOpen}
        onClose={() => setIsManualTransactionOpen(false)}
        onSuccess={handleManualTransactionSuccess}
      />
    </div>
  );
}

export default TransactionManagementPage;
