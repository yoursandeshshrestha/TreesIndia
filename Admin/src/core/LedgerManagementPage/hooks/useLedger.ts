"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api-client";
import {
  LedgerEntry,
  CashBankBalance,
  LedgerSummary,
  CreateLedgerEntryRequest,
  UpdateLedgerEntryRequest,
  ProcessPaymentRequest,
  UpdateBalanceRequest,
  LedgerFilters,
  LedgerEntriesResponse,
  LedgerEntryResponse,
  BalanceResponse,
  SummaryResponse,
} from "../types";

export function useLedger() {
  // State management
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [balance, setBalance] = useState<CashBankBalance | null>(null);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    offset: 0,
    limit: 20,
  });

  // Load ledger entries
  const fetchEntries = useCallback(
    async (filters: Partial<LedgerFilters> = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        // Add pagination
        params.append("offset", pagination.offset.toString());
        params.append("limit", pagination.limit.toString());

        // Add filters
        if (filters.search) params.append("search", filters.search);
        if (filters.entry_type && filters.entry_type !== "all") {
          params.append("entry_type", filters.entry_type);
        }
        if (filters.status && filters.status !== "all") {
          params.append("status", filters.status);
        }

        const response = await api.get(
          `/admin/ledger/entries?${params.toString()}`
        );

        if (response.success) {
          const data = response.data as LedgerEntriesResponse["data"];
          setEntries(data.entries);
          setPagination((prev) => ({
            ...prev,
            total: data.total,
          }));
        } else {
          throw new Error(response.message || "Failed to fetch ledger entries");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch ledger entries";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.offset, pagination.limit]
  );

  // Load pending payments
  const fetchPendingPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/admin/ledger/entries/pending/payments");

      if (response.success) {
        setEntries(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch pending payments");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch pending payments";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load pending receivables
  const fetchPendingReceivables = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(
        "/admin/ledger/entries/pending/receivables"
      );

      if (response.success) {
        setEntries(response.data);
      } else {
        throw new Error(
          response.message || "Failed to fetch pending receivables"
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch pending receivables";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load current balance
  const fetchBalance = useCallback(async () => {
    try {
      const response = await api.get("/admin/ledger/balance");

      if (response.success) {
        const data = response.data as BalanceResponse["data"];
        setBalance(data);
      } else {
        throw new Error(response.message || "Failed to fetch balance");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch balance";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  // Load summary
  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get("/admin/ledger/summary");

      if (response.success) {
        const data = response.data as SummaryResponse["data"];
        setSummary(data);
      } else {
        throw new Error(response.message || "Failed to fetch summary");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch summary";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  // Create ledger entry
  const createEntry = useCallback(
    async (data: CreateLedgerEntryRequest): Promise<LedgerEntry> => {
      try {
        const response = await api.post("/admin/ledger/entries", data);

        if (response.success) {
          const newEntry = response.data as LedgerEntryResponse["data"];
          setEntries((prev) => [newEntry, ...prev]);
          toast.success("Ledger entry created successfully");
          return newEntry;
        } else {
          throw new Error(response.message || "Failed to create ledger entry");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create ledger entry";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  // Update ledger entry
  const updateEntry = useCallback(
    async (
      id: number,
      data: UpdateLedgerEntryRequest
    ): Promise<LedgerEntry> => {
      try {
        const response = await api.put(`/admin/ledger/entries/${id}`, data);

        if (response.success) {
          const updatedEntry = response.data as LedgerEntryResponse["data"];
          setEntries((prev) =>
            prev.map((entry) => (entry.id === id ? updatedEntry : entry))
          );
          toast.success("Ledger entry updated successfully");
          return updatedEntry;
        } else {
          throw new Error(response.message || "Failed to update ledger entry");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update ledger entry";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  // Delete ledger entry
  const deleteEntry = useCallback(async (id: number): Promise<void> => {
    try {
      const response = await api.delete(`/admin/ledger/entries/${id}`);

      if (response.success) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
        toast.success("Ledger entry deleted successfully");
      } else {
        throw new Error(response.message || "Failed to delete ledger entry");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete ledger entry";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Process payment
  const processPayment = useCallback(
    async (id: number, data: ProcessPaymentRequest): Promise<LedgerEntry> => {
      try {
        const response = await api.post(
          `/admin/ledger/entries/${id}/pay`,
          data
        );

        if (response.success) {
          const updatedEntry = response.data as LedgerEntryResponse["data"];
          setEntries((prev) =>
            prev.map((entry) => (entry.id === id ? updatedEntry : entry))
          );
          toast.success("Payment processed successfully");

          // Refresh balance and summary
          await Promise.all([fetchBalance(), fetchSummary()]);

          return updatedEntry;
        } else {
          throw new Error(response.message || "Failed to process payment");
        }
      } catch (err) {
        let errorMessage = "Failed to process payment";

        // Extract error message from API response
        if (err instanceof ApiError) {
          // Use the message from ApiError which already contains the proper error message
          errorMessage = err.message;
        } else if (err && typeof err === "object" && "data" in err) {
          const apiError = err as {
            data?: { message?: string; error?: string };
          };
          if (apiError.data?.error) {
            errorMessage = apiError.data.error;
          } else if (apiError.data?.message) {
            errorMessage = apiError.data.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else if (
          typeof err === "object" &&
          err !== null &&
          "message" in err
        ) {
          errorMessage = String(err.message);
        }

        // Log the error for debugging
        console.error("Payment processing error:", err);
        console.error("Extracted error message:", errorMessage);

        // Display the specific error message
        toast.error(errorMessage, {
          duration: 5000,
        });
        throw err;
      }
    },
    [fetchBalance, fetchSummary]
  );

  // Process receive
  const processReceive = useCallback(
    async (id: number, data: ProcessPaymentRequest): Promise<LedgerEntry> => {
      try {
        const response = await api.post(
          `/admin/ledger/entries/${id}/receive`,
          data
        );

        if (response.success) {
          const updatedEntry = response.data as LedgerEntryResponse["data"];
          setEntries((prev) =>
            prev.map((entry) => (entry.id === id ? updatedEntry : entry))
          );
          toast.success("Receive processed successfully");

          // Refresh balance and summary
          await Promise.all([fetchBalance(), fetchSummary()]);

          return updatedEntry;
        } else {
          throw new Error(response.message || "Failed to process receive");
        }
      } catch (err) {
        let errorMessage = "Failed to process receive";

        // Extract error message from API response
        if (err instanceof ApiError) {
          // Use the message from ApiError which already contains the proper error message
          errorMessage = err.message;
        } else if (err && typeof err === "object" && "data" in err) {
          const apiError = err as {
            data?: { message?: string; error?: string };
          };
          if (apiError.data?.error) {
            errorMessage = apiError.data.error;
          } else if (apiError.data?.message) {
            errorMessage = apiError.data.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else if (
          typeof err === "object" &&
          err !== null &&
          "message" in err
        ) {
          errorMessage = String(err.message);
        }

        // Log the error for debugging
        console.error("Receive processing error:", err);
        console.error("Extracted error message:", errorMessage);

        // Display the specific error message
        toast.error(errorMessage, {
          duration: 5000,
        });
        throw err;
      }
    },
    [fetchBalance, fetchSummary]
  );

  // Update balance
  const updateBalance = useCallback(
    async (data: UpdateBalanceRequest): Promise<CashBankBalance> => {
      try {
        const response = await api.put("/admin/ledger/balance", data);

        if (response.success) {
          const updatedBalance = response.data as BalanceResponse["data"];
          setBalance(updatedBalance);
          toast.success("Balance updated successfully");

          // Refresh summary
          await fetchSummary();

          return updatedBalance;
        } else {
          throw new Error(response.message || "Failed to update balance");
        }
      } catch (err) {
        let errorMessage = "Failed to update balance";

        // Extract error message from API response
        if (err instanceof ApiError) {
          // Use the message from ApiError which already contains the proper error message
          errorMessage = err.message;
        } else if (err && typeof err === "object" && "data" in err) {
          const apiError = err as {
            data?: { message?: string; error?: string };
          };
          if (apiError.data?.error) {
            errorMessage = apiError.data.error;
          } else if (apiError.data?.message) {
            errorMessage = apiError.data.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        } else if (
          typeof err === "object" &&
          err !== null &&
          "message" in err
        ) {
          errorMessage = String(err.message);
        }

        // Log the error for debugging
        console.error("Balance update error:", err);
        console.error("Extracted error message:", errorMessage);

        // Display the specific error message
        toast.error(errorMessage, {
          duration: 5000,
        });
        throw err;
      }
    },
    [fetchSummary]
  );

  // Pagination handlers
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination((prev) => ({
      ...prev,
      limit: size,
      offset: 0,
    }));
  }, []);

  // Load initial data
  useEffect(() => {
    fetchBalance();
    fetchSummary();
  }, [fetchBalance, fetchSummary]);

  return {
    // Data
    entries,
    balance,
    summary,
    pagination,

    // Loading states
    isLoading,
    error,

    // Actions
    fetchEntries,
    fetchPendingPayments,
    fetchPendingReceivables,
    fetchBalance,
    fetchSummary,
    createEntry,
    updateEntry,
    deleteEntry,
    processPayment,
    processReceive,
    updateBalance,

    // Pagination
    setPage,
    setPageSize,
  };
}
