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
    onSuccess: async () => {
      // Invalidate bookings to refresh payment progress
      await queryClient.invalidateQueries({
        queryKey: ["userBookings"],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking"],
        refetchType: "all"
      });
      // Force refetch to ensure fresh data
      await queryClient.refetchQueries({ queryKey: ["userBookings"] });
      await queryClient.refetchQueries({ queryKey: ["booking"] });
    },
    onError: (error) => {
      console.error("Error paying segment:", error);
    },
  });

  return {
    paymentProgress: null as PaymentProgress | null, // Payment progress not available in new API response format
    isLoadingSegments: false, // No loading since data comes from cache
    segmentsError: null,
    refetchSegments: async () => {
      // Invalidate and refetch user bookings to get fresh payment progress
      await queryClient.invalidateQueries({
        queryKey: ["userBookings"],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking"],
        refetchType: "all"
      });
      await queryClient.refetchQueries({ queryKey: ["userBookings"] });
      await queryClient.refetchQueries({ queryKey: ["booking"] });
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
