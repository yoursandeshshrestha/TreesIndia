import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getBookings,
  getBookingById,
  updateBookingStatus,
  assignWorkerToBooking,
  getBookingStats,
  getBookingDashboard,
  createBooking,
} from "@/lib/api-client";
import {
  OptimizedBookingResponse,
  DetailedBookingResponse,
  BookingFilterState,
  BookingDashboardApiResponse,
  UpdateBookingStatusRequest,
  AssignWorkerRequest,
  CreateBookingRequest,
} from "@/types/booking";

interface BookingStats {
  overview?: {
    total_bookings: number;
    total_revenue: number;
    active_workers: number;
  };
  revenue_analytics?: {
    monthly: number;
    weekly: number;
    daily: number;
    average_per_booking: number;
    last_7_days?: Array<{
      date: string;
      revenue: number;
      bookings: number;
    }>;
  };
  status_breakdown?: Record<string, number>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface UseBookingsReturn {
  // Data
  bookings: OptimizedBookingResponse[];
  booking: OptimizedBookingResponse | DetailedBookingResponse | null;
  stats: BookingStats | null;
  dashboard: BookingDashboardApiResponse | null;

  // Loading states
  isLoading: boolean;
  isStatsLoading: boolean;
  isDashboardLoading: boolean;
  isUpdating: boolean;
  isAssigning: boolean;
  isCreating: boolean;

  // Error states
  error: string | null;
  statsError: string | null;
  dashboardError: string | null;

  // Pagination
  pagination: PaginationInfo | null;

  // Actions
  fetchBookings: (filters?: Partial<BookingFilterState>) => Promise<void>;
  fetchBooking: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  updateStatus: (
    bookingId: number,
    data: UpdateBookingStatusRequest
  ) => Promise<void>;
  assignWorker: (bookingId: number, data: AssignWorkerRequest) => Promise<void>;
  createNewBooking: (data: CreateBookingRequest) => Promise<unknown>;
  clearError: () => void;
  clearStatsError: () => void;
  clearDashboardError: () => void;
}

export const useBookings = (): UseBookingsReturn => {
  // State
  const [bookings, setBookings] = useState<OptimizedBookingResponse[]>([]);
  const [booking, setBooking] = useState<
    OptimizedBookingResponse | DetailedBookingResponse | null
  >(null);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [dashboard, setDashboard] =
    useState<BookingDashboardApiResponse | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Fetch bookings with filters
  const fetchBookings = useCallback(
    async (filters?: Partial<BookingFilterState>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getBookings(filters || {});

        if (response.bookings) {
          setBookings(response.bookings || []);
          setPagination(response.pagination || null);
        } else {
          setError("Failed to fetch bookings");
          setBookings([]);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch bookings";
        setError(errorMessage);
        setBookings([]);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch single booking
  const fetchBooking = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBookingById(id);

      if (response) {
        setBooking(response.booking || response);
      } else {
        setError("Failed to fetch booking");
        setBooking(null);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch booking";
      setError(errorMessage);
      setBooking(null);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch booking statistics
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError(null);

    try {
      const response = await getBookingStats();

      if (response && "stats" in response) {
        setStats((response as { stats: BookingStats }).stats);
      } else {
        setStatsError("Failed to fetch statistics");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch statistics";
      setStatsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch booking dashboard
  const fetchDashboard = useCallback(async () => {
    setIsDashboardLoading(true);
    setDashboardError(null);

    try {
      const response = await getBookingDashboard();

      if (response) {
        setDashboard(response as unknown as BookingDashboardApiResponse);
      } else {
        setDashboardError("Failed to fetch dashboard");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dashboard";
      setDashboardError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDashboardLoading(false);
    }
  }, []);

  // Update booking status
  const updateStatus = useCallback(
    async (bookingId: number, data: UpdateBookingStatusRequest) => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await updateBookingStatus(bookingId, data);

        if (response) {
          toast.success("Booking status updated successfully");
          // Refresh the bookings list
          await fetchBookings();
        } else {
          setError("Failed to update booking status");
          toast.error("Failed to update booking status");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update booking status";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchBookings]
  );

  // Assign worker to booking
  const assignWorker = useCallback(
    async (bookingId: number, data: AssignWorkerRequest) => {
      setIsAssigning(true);
      setError(null);

      try {
        const response = await assignWorkerToBooking(bookingId, data);

        if (response) {
          toast.success("Worker assigned successfully");
          // Refresh the bookings list
          await fetchBookings();
        } else {
          setError("Failed to assign worker");
          toast.error("Failed to assign worker");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to assign worker";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsAssigning(false);
      }
    },
    [fetchBookings]
  );

  // Create new booking
  const createNewBooking = useCallback(
    async (data: CreateBookingRequest) => {
      setIsCreating(true);
      setError(null);

      try {
        const response = await createBooking({
          ...data,
          address: JSON.stringify(data.address),
        });

        if (response) {
          toast.success("Booking created successfully");
          // Refresh the bookings list
          await fetchBookings();
          return response;
        } else {
          setError("Failed to create booking");
          toast.error("Failed to create booking");
          return null;
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create booking";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [fetchBookings]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear stats error
  const clearStatsError = useCallback(() => {
    setStatsError(null);
  }, []);

  // Clear dashboard error
  const clearDashboardError = useCallback(() => {
    setDashboardError(null);
  }, []);

  return {
    // Data
    bookings,
    booking,
    stats,
    dashboard,

    // Loading states
    isLoading,
    isStatsLoading,
    isDashboardLoading,
    isUpdating,
    isAssigning,
    isCreating,

    // Error states
    error,
    statsError,
    dashboardError,

    // Pagination
    pagination,

    // Actions
    fetchBookings,
    fetchBooking,
    fetchStats,
    fetchDashboard,
    updateStatus,
    assignWorker,
    createNewBooking,
    clearError,
    clearStatsError,
    clearDashboardError,
  };
};
