import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paySegment } from "@/lib/bookingApi";
import { CreateSegmentPaymentRequest, PaymentProgress } from "@/types/booking";

export function usePaymentSegments() {
  const queryClient = useQueryClient();

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
    paymentProgress: null as PaymentProgress | null, // Payment progress not available in new API response format
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
export function useBookingPaymentSegments() {
  const { paymentProgress, isLoadingSegments } = usePaymentSegments();

  return {
    hasPaymentSegments: paymentProgress?.segments && paymentProgress.segments.length > 0,
    paymentProgress,
    isLoadingSegments,
  };
}
