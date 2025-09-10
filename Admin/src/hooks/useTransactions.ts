import { useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import {
  Transaction,
  TransactionFilters,
  TransactionStats,
  TransactionDashboardData,
  TransactionApiResponse,
  ExportRequest,
  FilterOptions,
} from "@/types/transaction";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

  const fetchTransactions = useCallback(
    async (filters: Partial<TransactionFilters> = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        // Add pagination
        params.append("page", filters.page?.toString() || "1");
        params.append("limit", filters.limit?.toString() || "10");

        // Add filters
        if (filters.search) params.append("search", filters.search);
        if (filters.status) params.append("status", filters.status);
        if (filters.type) params.append("type", filters.type);
        if (filters.method) params.append("method", filters.method);
        if (filters.user_email) params.append("user_email", filters.user_email);
        if (filters.user_phone) params.append("user_phone", filters.user_phone);
        if (filters.min_amount) params.append("min_amount", filters.min_amount);
        if (filters.max_amount) params.append("max_amount", filters.max_amount);
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);
        if (filters.sort_by) params.append("sort_by", filters.sort_by);
        if (filters.sort_order) params.append("sort_order", filters.sort_order);

        const response = await api.get(`/admin/transactions?${params}`);
        const apiResponse = response as { data: TransactionApiResponse };
        const data = apiResponse.data;

        setTransactions(data.transactions || []);
        setPagination(
          data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 1,
          }
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch transactions";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchTransactionStats =
    useCallback(async (): Promise<TransactionStats | null> => {
      try {
        const response = await api.get("/admin/transactions/stats");
        const apiResponse = response as { data: TransactionStats };
        return apiResponse.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch transaction stats";
        toast.error(errorMessage);
        return null;
      }
    }, []);

  const fetchDashboardData =
    useCallback(async (): Promise<TransactionDashboardData | null> => {
      try {
        const response = await api.get("/admin/transactions/dashboard");
        const apiResponse = response as { data: TransactionDashboardData };
        return apiResponse.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch dashboard data";
        toast.error(errorMessage);
        return null;
      }
    }, []);

  const fetchFilterOptions =
    useCallback(async (): Promise<FilterOptions | null> => {
      try {
        const response = await api.get("/admin/transactions/filters");
        const apiResponse = response as { data: FilterOptions };
        return apiResponse.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch filter options";
        toast.error(errorMessage);
        return null;
      }
    }, []);

  const getTransactionById = useCallback(
    async (id: number): Promise<Transaction | null> => {
      try {
        const response = await api.get(`/admin/transactions/${id}`);
        const apiResponse = response as { data: Transaction };
        return apiResponse.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch transaction";
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  const getTransactionByReference = useCallback(
    async (reference: string): Promise<Transaction | null> => {
      try {
        const response = await api.get(
          `/admin/transactions/reference/${reference}`
        );
        const apiResponse = response as { data: Transaction };
        return apiResponse.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch transaction";
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  const exportTransactions = useCallback(
    async (exportData: ExportRequest): Promise<Blob | null> => {
      try {
        const response = await api.post(
          "/admin/transactions/export",
          exportData,
          {
            responseType: "blob",
          }
        );
        return response as Blob;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to export transactions";
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    transactions,
    isLoading,
    error,
    pagination,
    fetchTransactions,
    fetchTransactionStats,
    fetchDashboardData,
    fetchFilterOptions,
    getTransactionById,
    getTransactionByReference,
    exportTransactions,
    clearError,
  };
};
