"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  openModal,
  closeModal,
  setCurrentStep,
  setSelectedDate,
  setSelectedTimeSlot,
  setSelectedPaymentMethod,
  setPaymentOrder,
  setShowRazorpayCheckout,
  setError,
  clearError,
  setLoading,
  setSuccess,
  clearSuccess,
  resetState,
  type QuoteStep,
} from "@/store/slices/quoteAcceptanceSlice";
import { type PaymentMethod } from "@/types/payment";
import { Booking } from "@/lib/bookingApi";
import { AvailableSlot } from "@/types/booking";
import { useWallet } from "@/hooks/useWallet";
import { formatAmount } from "@/utils/formatters";
import { generateDateOptions } from "@/utils/dateTimeUtils";
import {
  getAddressName,
  getAddressDetails,
} from "@/core/ProfilePage/components/sections/Booking/components/QuoteAcceptanceModal/utils/addressUtils";
import {
  useBookingConfig,
  useAvailableSlots,
  useCreateQuotePayment,
  useVerifyQuotePayment,
  useProcessWalletPayment,
} from "@/hooks/useBookingFlow";
import { usePaymentSegments } from "@/hooks/usePaymentSegments";
import { useCallback, useEffect } from "react";

export function useQuoteAcceptanceRedux(
  onSuccess?: () => void,
  onClose?: () => void
) {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const {
    isOpen,
    booking,
    currentStep,
    selectedDate,
    selectedTimeSlot,
    selectedPaymentMethod,
    paymentOrder,
    showRazorpayCheckout,
    error,
    isLoading,
    showSuccess,
    successMessage,
  } = useSelector((state: RootState) => state.quoteAcceptance);

  // Wallet and API hooks
  const { walletSummary } = useWallet(false); // Only need wallet summary, not transactions
  const { data: bookingConfigData } = useBookingConfig();
  const serviceId = booking?.service?.ID || 0;
  // Get quote duration for availability calculation
  const quoteDuration = booking?.quote_duration;

  const { data: availableSlotsData, isLoading: isLoadingSlots } =
    useAvailableSlots(
      serviceId,
      selectedDate || "",
      !!selectedDate && !!serviceId,
      quoteDuration // Pass quote duration for accurate availability
    );
  // Note: No longer need bookingsWithProgress since payment_segments are in booking object

  const createQuotePaymentMutation = useCreateQuotePayment();
  const verifyQuotePaymentMutation = useVerifyQuotePayment();
  const processWalletPaymentMutation = useProcessWalletPayment();
  const { paySegment } = usePaymentSegments();

  // Computed values
  const dateOptions = bookingConfigData?.data
    ? generateDateOptions(bookingConfigData.data)
    : [];
  const availableSlots = availableSlotsData?.data?.available_slots || [];
  // Calculate the amount to be paid for wallet disabled check
  const getPaymentAmount = () => {
    const paymentSegments = booking?.payment_segments || [];
    if (paymentSegments.length > 0) {
      // For segmented payments, check against the first segment amount
      return paymentSegments[0]?.amount || 0;
    }
    // For single payment, use quote amount
    return booking?.quote_amount || 0;
  };

  const isWalletDisabled =
    (walletSummary?.current_balance || 0) < getPaymentAmount();
  const isProcessing =
    createQuotePaymentMutation.isPending ||
    verifyQuotePaymentMutation.isPending ||
    processWalletPaymentMutation.isPending;

  // Actions
  const handleOpenModal = useCallback(
    (bookingData: Booking) => {
      dispatch(openModal(bookingData));
    },
    [dispatch]
  );

  const handleCloseModal = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  const handleSetCurrentStep = useCallback(
    (step: QuoteStep) => {
      dispatch(setCurrentStep(step));
    },
    [dispatch]
  );

  const handleSetSelectedDate = useCallback(
    (date: string | null) => {
      dispatch(setSelectedDate(date));
    },
    [dispatch]
  );

  const handleSetSelectedTimeSlot = useCallback(
    (slot: AvailableSlot | null) => {
      dispatch(setSelectedTimeSlot(slot));
    },
    [dispatch]
  );

  const handleSetSelectedPaymentMethod = useCallback(
    (method: PaymentMethod | null) => {
      dispatch(setSelectedPaymentMethod(method));
    },
    [dispatch]
  );

  // Auto-deselect wallet payment method if it becomes disabled
  useEffect(() => {
    if (selectedPaymentMethod === "wallet" && isWalletDisabled) {
      handleSetSelectedPaymentMethod(null);
    }
  }, [selectedPaymentMethod, isWalletDisabled, handleSetSelectedPaymentMethod]);

  const handleSetError = useCallback(
    (errorMessage: string | null) => {
      dispatch(setError(errorMessage));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSetLoading = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch]
  );

  const handleSetSuccess = useCallback(
    (message: string) => {
      dispatch(setSuccess(message));
    },
    [dispatch]
  );

  const handleClearSuccess = useCallback(() => {
    dispatch(clearSuccess());
  }, [dispatch]);

  const handleResetState = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  // Business logic handlers
  const handleDateSelect = useCallback(
    async (date: string) => {
      // Check if service exists and has required information
      const serviceId = booking?.service?.ID;
      if (!serviceId) {
        console.error("Service information missing:", {
          booking: booking,
          service: booking?.service,
          serviceId: serviceId,
        });
        handleSetError("Service information not available");
        return;
      }

      handleSetSelectedDate(date);
      handleClearError();
    },
    [handleSetError, handleSetSelectedDate, handleClearError, booking]
  );

  const handleTimeSlotSelect = useCallback(
    (timeSlot: AvailableSlot) => {
      handleSetSelectedTimeSlot(timeSlot);
      handleSetCurrentStep("payment");
    },
    [handleSetSelectedTimeSlot, handleSetCurrentStep]
  );

  const handlePaymentMethodSelect = useCallback(
    (method: PaymentMethod) => {
      handleSetSelectedPaymentMethod(method);
    },
    [handleSetSelectedPaymentMethod]
  );

  const handleProceedToPayment = useCallback(async () => {
    // Check if this is multiple segments (no date/time selection required)
    const paymentSegments = booking?.payment_segments || [];
    const hasMultipleSegments = paymentSegments.length > 1;

    if (
      !booking ||
      !selectedPaymentMethod ||
      (!hasMultipleSegments && (!selectedDate || !selectedTimeSlot))
    ) {
      handleSetError("Please complete all selections before proceeding");
      return;
    }

    handleClearError();

    try {
      const bookingId = booking.ID;
      if (!bookingId) {
        throw new Error("Booking ID not found");
      }

      if (selectedPaymentMethod === "wallet") {
        if (hasMultipleSegments) {
          await paySegment({
            bookingId,
            paymentData: {
              segment_number: 1,
              amount: paymentSegments[0]?.amount || 0,
              payment_method: "wallet",
            },
          });
        } else {
          // For single segment, use the first segment amount
          const paymentAmount =
            paymentSegments.length > 0
              ? paymentSegments[0].amount
              : booking.quote_amount || 0;

          await processWalletPaymentMutation.mutateAsync({
            bookingId,
            paymentData: {
              scheduled_date: selectedDate!,
              scheduled_time: selectedTimeSlot!.time,
              amount: paymentAmount,
            },
          });
        }
        handleSetSuccess("Quote accepted and payment completed successfully!");
        // Close modal after a delay to show success message
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 2000);
      } else {
        if (hasMultipleSegments) {
          await paySegment({
            bookingId,
            paymentData: {
              segment_number: 1,
              amount: paymentSegments[0]?.amount || 0,
              payment_method: "razorpay",
            },
          });
          handleSetSuccess(
            "Quote accepted and payment completed successfully!"
          );
          setTimeout(() => {
            onSuccess?.();
            onClose?.();
          }, 2000);
        } else {
          // For single segment, use the first segment amount
          const paymentAmount =
            paymentSegments.length > 0
              ? paymentSegments[0].amount
              : booking.quote_amount || 0;

          const response = await createQuotePaymentMutation.mutateAsync({
            bookingId,
            paymentData: {
              scheduled_date: selectedDate!,
              scheduled_time: selectedTimeSlot!.time,
              amount: paymentAmount,
            },
          });

          const order = (
            response as {
              data: {
                payment_order: { payment_order: Record<string, unknown> };
              };
            }
          ).data.payment_order.payment_order;
          dispatch(
            setPaymentOrder({
              id: order.id as string,
              amount: order.amount as number,
              currency: order.currency as string,
              key_id: order.key_id as string,
            })
          );
          dispatch(setShowRazorpayCheckout(true));
        }
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      handleSetError("Failed to process payment. Please try again.");
    }
  }, [
    booking,
    selectedDate,
    selectedTimeSlot,
    selectedPaymentMethod,
    handleSetError,
    handleClearError,
    processWalletPaymentMutation,
    createQuotePaymentMutation,
    paySegment,
    dispatch,
    handleSetSuccess,
    onSuccess,
    onClose,
  ]);

  const handleRazorpaySuccess = useCallback(
    async (paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      if (!booking) return;

      try {
        const bookingId = booking.ID;
        if (!bookingId) {
          throw new Error("Booking ID not found");
        }

        // Clear any existing errors before processing
        handleClearError();

        await verifyQuotePaymentMutation.mutateAsync({
          bookingId,
          paymentData,
        });

        handleSetSuccess("Quote accepted and payment completed successfully!");
        // Close modal after a delay to show success message
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 2000);
      } catch (error) {
        console.error("Payment verification error:", error);
        handleSetError("Payment verification failed. Please contact support.");
      }
    },
    [
      booking,
      verifyQuotePaymentMutation,
      handleSetError,
      handleClearError,
      handleSetSuccess,
      onSuccess,
      onClose,
    ]
  );

  const handleRazorpayFailure = useCallback(
    (error: unknown) => {
      console.error("Razorpay payment failed:", error);
      handleSetError("Payment failed. Please try again.");
      dispatch(setShowRazorpayCheckout(false));
    },
    [handleSetError, dispatch]
  );

  const handleRazorpayClose = useCallback(() => {
    dispatch(setShowRazorpayCheckout(false));
  }, [dispatch]);

  return {
    // State
    isOpen,
    booking,
    currentStep,
    selectedDate,
    selectedTimeSlot,
    selectedPaymentMethod,
    paymentOrder,
    showRazorpayCheckout,
    error,
    isLoading,
    showSuccess,
    successMessage,

    // Computed values
    walletSummary,
    bookingConfigData,
    availableSlotsData,
    isLoadingSlots,
    dateOptions,
    availableSlots,
    isWalletDisabled,
    isProcessing,

    // Actions
    handleOpenModal,
    handleCloseModal,
    handleSetCurrentStep,
    handleSetSelectedDate,
    handleSetSelectedTimeSlot,
    handleSetSelectedPaymentMethod,
    handleSetError,
    handleClearError,
    handleSetLoading,
    handleSetSuccess,
    handleClearSuccess,
    handleResetState,

    // Business logic handlers
    handleDateSelect,
    handleTimeSlotSelect,
    handlePaymentMethodSelect,
    handleProceedToPayment,
    handleRazorpaySuccess,
    handleRazorpayFailure,
    handleRazorpayClose,

    // Utils
    getAddressName,
    getAddressDetails,
    formatAmount,
  };
}
