import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth-api";
import {
  fetchUserBookings,
  fetchBookingById,
  cancelBooking,
  acceptQuote,
  rejectQuote,
  type CancelBookingRequest,
} from "@/lib/bookingApi";

export function useBookings() {
  const queryClient = useQueryClient();
  const token = authAPI.getAccessToken();

  // Fetch user bookings
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["userBookings"],
    queryFn: () => fetchUserBookings(),
    enabled: !!token,
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: ({
      bookingId,
      cancelData,
    }: {
      bookingId: number;
      cancelData: CancelBookingRequest;
    }) => cancelBooking(bookingId, cancelData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error) => {
      console.error("Error cancelling booking:", error);
    },
  });

  // Accept quote mutation
  const acceptQuoteMutation = useMutation({
    mutationFn: ({ bookingId, notes }: { bookingId: number; notes?: string }) =>
      acceptQuote(bookingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error) => {
      console.error("Error accepting quote:", error);
    },
  });

  // Reject quote mutation
  const rejectQuoteMutation = useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: number;
      reason: string;
    }) => rejectQuote(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error) => {
      console.error("Error rejecting quote:", error);
    },
  });

  return {
    // Data
    bookings: bookingsData?.bookings || [],
    pagination: bookingsData?.pagination || null,

    // Loading states
    isLoadingBookings,
    isCancellingBooking: cancelBookingMutation.isPending,
    isAcceptingQuote: acceptQuoteMutation.isPending,
    isRejectingQuote: rejectQuoteMutation.isPending,

    // Error states
    bookingsError,
    cancelBookingError: cancelBookingMutation.error,
    acceptQuoteError: acceptQuoteMutation.error,
    rejectQuoteError: rejectQuoteMutation.error,

    // Actions
    cancelBooking: cancelBookingMutation.mutate,
    cancelBookingAsync: cancelBookingMutation.mutateAsync,
    acceptQuote: acceptQuoteMutation.mutate,
    acceptQuoteAsync: acceptQuoteMutation.mutateAsync,
    rejectQuote: rejectQuoteMutation.mutate,
    rejectQuoteAsync: rejectQuoteMutation.mutateAsync,
    refetchBookings,
  };
}

// Hook for fetching filtered bookings
export function useFilteredBookings(filters: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();
  const token = authAPI.getAccessToken();

  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["userBookings", filters],
    queryFn: () => fetchUserBookings(filters),
    enabled: !!token,
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: ({
      bookingId,
      cancelData,
    }: {
      bookingId: number;
      cancelData: CancelBookingRequest;
    }) => cancelBooking(bookingId, cancelData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error) => {
      console.error("Error cancelling booking:", error);
    },
  });

  // Accept quote mutation
  const acceptQuoteMutation = useMutation({
    mutationFn: ({ bookingId, notes }: { bookingId: number; notes?: string }) =>
      acceptQuote(bookingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error) => {
      console.error("Error accepting quote:", error);
    },
  });

  // Reject quote mutation
  const rejectQuoteMutation = useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: number;
      reason: string;
    }) => rejectQuote(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error) => {
      console.error("Error rejecting quote:", error);
    },
  });

  return {
    // Data
    bookings: bookingsData?.bookings || [],
    pagination: bookingsData?.pagination || null,

    // Loading states
    isLoadingBookings,
    isCancellingBooking: cancelBookingMutation.isPending,
    isAcceptingQuote: acceptQuoteMutation.isPending,
    isRejectingQuote: rejectQuoteMutation.isPending,

    // Error states
    bookingsError,
    cancelBookingError: cancelBookingMutation.error,
    acceptQuoteError: acceptQuoteMutation.error,
    rejectQuoteError: rejectQuoteMutation.error,

    // Actions
    cancelBooking: cancelBookingMutation.mutate,
    cancelBookingAsync: cancelBookingMutation.mutateAsync,
    acceptQuote: acceptQuoteMutation.mutate,
    acceptQuoteAsync: acceptQuoteMutation.mutateAsync,
    rejectQuote: rejectQuoteMutation.mutate,
    rejectQuoteAsync: rejectQuoteMutation.mutateAsync,
    refetchBookings,
  };
}

// Hook for fetching a specific booking
export function useBookingById(bookingId: number) {
  const token = authAPI.getAccessToken();

  const {
    data: bookingData,
    isLoading: isLoadingBooking,
    error: bookingError,
    refetch: refetchBooking,
  } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => fetchBookingById(bookingId),
    enabled: !!token && !!bookingId,
  });

  return {
    booking: bookingData?.booking || null,
    isLoadingBooking,
    bookingError,
    refetchBooking,
  };
}
