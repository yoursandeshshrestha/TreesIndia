import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/auth-api";
import {
  getPaymentSegments,
  paySegment,
  type CreateSegmentPaymentRequest,
} from "@/lib/bookingApi";
import { BookingWithPaymentProgress } from "@/types/booking";

export function usePaymentSegments(bookingId?: number) {
  const queryClient = useQueryClient();
  const token = authAPI.getAccessToken();

  // First try to get payment progress from cached booking data
  const cachedBookings = queryClient.getQueryData<{
    bookings: BookingWithPaymentProgress[];
  }>(["userBookings"]);
  const cachedBooking = cachedBookings?.bookings?.find(
    (item) => item.booking.ID === bookingId || item.booking.id === bookingId
  );

  // If we have cached payment progress, use it
  if (cachedBooking?.payment_progress) {
    return {
      paymentProgress: cachedBooking.payment_progress,
      isLoadingSegments: false,
      segmentsError: null,
      refetchSegments: () => {
        // Invalidate and refetch user bookings to get fresh payment progress
        queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      },
      paySegment: async (params: {
        bookingId: number;
        paymentData: CreateSegmentPaymentRequest;
      }) => {
        const result = await paySegment(params.bookingId, params.paymentData);
        // Invalidate bookings to refresh payment progress
        queryClient.invalidateQueries({ queryKey: ["userBookings"] });
        return result;
      },
      isPayingSegment: false,
      paySegmentError: null,
    };
  }

  // Fallback to separate API call if not in cache
  const {
    data: paymentSegmentsData,
    isLoading: isLoadingSegments,
    error: segmentsError,
    refetch: refetchSegments,
  } = useQuery({
    queryKey: ["paymentSegments", bookingId],
    queryFn: () => getPaymentSegments(bookingId!),
    enabled: !!token && !!bookingId,
  });

  // Pay segment mutation
  const paySegmentMutation = useMutation({
    mutationFn: ({
      bookingId,
      paymentData,
    }: {
      bookingId: number;
      paymentData: CreateSegmentPaymentRequest;
    }) => paySegment(bookingId, paymentData),
    onSuccess: () => {
      // Invalidate payment segments query
      queryClient.invalidateQueries({
        queryKey: ["paymentSegments", bookingId],
      });
      // Also invalidate bookings to refresh the booking data
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error) => {
      console.error("Error paying segment:", error);
    },
  });

  return {
    paymentProgress: paymentSegmentsData?.data,
    isLoadingSegments,
    segmentsError,
    refetchSegments,
    paySegment: paySegmentMutation.mutateAsync,
    isPayingSegment: paySegmentMutation.isPending,
    paySegmentError: paySegmentMutation.error,
  };
}

// Hook to check if a booking has payment segments
export function useBookingPaymentSegments(bookingId?: number) {
  const { paymentProgress, isLoadingSegments } = usePaymentSegments(bookingId);

  return {
    hasPaymentSegments: paymentProgress && paymentProgress.segments.length > 0,
    paymentProgress,
    isLoadingSegments,
  };
}
