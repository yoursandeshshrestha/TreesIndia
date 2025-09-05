import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingFlowApi } from "@/lib/bookingFlowApi";
import { PaymentVerificationRequest } from "@/types/booking";
import { toast } from "sonner";

// Query keys
export const bookingKeys = {
  all: ["booking"] as const,
  config: () => [...bookingKeys.all, "config"] as const,
  addresses: () => [...bookingKeys.all, "addresses"] as const,
  availableSlots: (serviceId: number, date: string) =>
    [...bookingKeys.all, "availableSlots", serviceId, date] as const,
  serviceAvailability: (serviceId: number, city: string, state: string) =>
    [
      ...bookingKeys.all,
      "serviceAvailability",
      serviceId,
      city,
      state,
    ] as const,
  booking: (bookingId: number) =>
    [...bookingKeys.all, "booking", bookingId] as const,
};

// Get booking configuration
export const useBookingConfig = () => {
  return useQuery({
    queryKey: bookingKeys.config(),
    queryFn: bookingFlowApi.getBookingConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user addresses
export const useAddresses = () => {
  return useQuery({
    queryKey: bookingKeys.addresses(),
    queryFn: bookingFlowApi.getAddresses,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get available time slots
export const useAvailableSlots = (
  serviceId: number,
  date: string,
  enabled = true
) => {
  return useQuery({
    queryKey: bookingKeys.availableSlots(serviceId, date),
    queryFn: () => bookingFlowApi.getAvailableSlots(serviceId, date),
    enabled: enabled && !!serviceId && !!date,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Check service availability
export const useServiceAvailability = (
  serviceId: number,
  city: string,
  state: string,
  enabled = true
) => {
  return useQuery({
    queryKey: bookingKeys.serviceAvailability(serviceId, city, state),
    queryFn: () =>
      bookingFlowApi.checkServiceAvailability(serviceId, city, state),
    enabled: enabled && !!serviceId && !!city && !!state,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get booking by ID
export const useBooking = (bookingId: number, enabled = true) => {
  return useQuery({
    queryKey: bookingKeys.booking(bookingId),
    queryFn: () => bookingFlowApi.getBookingById(bookingId),
    enabled: enabled && !!bookingId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingFlowApi.createBooking,
    onSuccess: () => {
      toast.success("Booking created successfully!");
      // Invalidate relevant queries - both booking flow and user bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create booking");
    },
  });
};

// Create inquiry booking mutation
export const useCreateInquiryBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingFlowApi.createInquiryBooking,
    onSuccess: () => {
      toast.success("Inquiry submitted successfully!");
      // Invalidate relevant queries - both booking flow and user bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit inquiry");
    },
  });
};

// Verify payment mutation
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      paymentData,
    }: {
      bookingId: number;
      paymentData: PaymentVerificationRequest;
    }) => bookingFlowApi.verifyPayment(bookingId, paymentData),
    onSuccess: () => {
      toast.success("Payment verified successfully!");
      // Invalidate relevant queries - both booking flow and user bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify payment");
    },
  });
};

// Verify inquiry payment mutation
export const useVerifyInquiryPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingFlowApi.verifyInquiryPayment,
    onSuccess: () => {
      toast.success("Payment verified successfully!");
      // Invalidate relevant queries - both booking flow and user bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify payment");
    },
  });
};

// Cancel booking mutation
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingFlowApi.cancelBooking,
    onSuccess: () => {
      toast.success("Booking cancelled successfully!");
      // Invalidate relevant queries - both booking flow and user bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel booking");
    },
  });
};

// Create quote payment order mutation
export const useCreateQuotePayment = () => {
  return useMutation({
    mutationFn: ({
      bookingId,
      paymentData,
    }: {
      bookingId: number;
      paymentData: {
        scheduled_date: string;
        scheduled_time: string;
        amount: number;
      };
    }) => bookingFlowApi.createQuotePayment(bookingId, paymentData),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create payment order");
    },
  });
};

// Verify quote payment mutation
export const useVerifyQuotePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      paymentData,
    }: {
      bookingId: number;
      paymentData: PaymentVerificationRequest;
    }) => bookingFlowApi.verifyQuotePayment(bookingId, paymentData),
    onSuccess: () => {
      toast.success("Quote accepted and payment completed successfully!");
      // Invalidate relevant queries - both booking flow and user bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payment verification failed");
    },
  });
};

// Process wallet payment for quote mutation
export const useProcessWalletPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      paymentData,
    }: {
      bookingId: number;
      paymentData: {
        scheduled_date: string;
        scheduled_time: string;
        amount: number;
      };
    }) => bookingFlowApi.processWalletPayment(bookingId, paymentData),
    onSuccess: () => {
      toast.success("Quote accepted and payment completed successfully!");
      // Invalidate relevant queries - both booking flow and user bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Wallet payment failed");
    },
  });
};

// Create booking with wallet payment mutation
export const useCreateBookingWithWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingFlowApi.createBookingWithWallet,
    onSuccess: () => {
      toast.success("Booking created successfully with wallet payment!");
      // Invalidate relevant queries - both booking flow and user bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to create booking with wallet payment"
      );
    },
  });
};

// Create inquiry booking with wallet payment mutation
export const useCreateInquiryBookingWithWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingFlowApi.createInquiryBookingWithWallet,
    onSuccess: () => {
      toast.success(
        "Inquiry booking created successfully with wallet payment!"
      );
      // Invalidate relevant queries - both booking flow and user bookings
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to create inquiry booking with wallet payment"
      );
    },
  });
};
