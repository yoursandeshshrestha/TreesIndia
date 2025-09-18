import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paySegment } from "@/lib/bookingApi";
import { CreateSegmentPaymentRequest } from "@/types/booking";
import type { Booking } from "@/lib/bookingApi";

export function usePaymentSegments(bookingId?: number) {
  const queryClient = useQueryClient();

  // Get payment progress from cached booking data
  const cachedBookings = queryClient.getQueryData<{
    bookings: Booking[];
  }>(["userBookings"]);
  const cachedBooking = cachedBookings?.bookings?.find(
    (booking) => booking?.ID === bookingId
  );

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
      // Invalidate bookings to refresh payment progress
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error) => {
      console.error("Error paying segment:", error);
    },
  });

  return {
    paymentProgress: null, // Payment progress not available in new API response format
    isLoadingSegments: false, // No loading since data comes from cache
    segmentsError: null,
    refetchSegments: () => {
      // Invalidate and refetch user bookings to get fresh payment progress
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
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
