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
  type PaymentMethod,
  type QuoteStep,
} from "@/store/slices/quoteAcceptanceSlice";
import { Booking } from "@/lib/bookingApi";
import { AvailableSlot } from "@/types/booking";
import { useWallet } from "@/hooks/useWallet";
import { formatAmount } from "@/utils/formatters";
import { generateDateOptions, BookingConfig } from "@/utils/slotUtils";
import {
  getAddressName,
  getAddressDetails,
} from "@/components/QuoteAcceptanceModal/utils/addressUtils";
import {
  useBookingConfig,
  useAvailableSlots,
  useCreateQuotePayment,
  useVerifyQuotePayment,
  useProcessWalletPayment,
} from "@/hooks/useBookingFlow";
import { useCallback } from "react";

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
  const { walletSummary } = useWallet();
  const { data: bookingConfigData } = useBookingConfig();
  const { data: availableSlotsData, isLoading: isLoadingSlots } =
    useAvailableSlots(
      booking?.service?.id || 0,
      selectedDate || "",
      !!selectedDate && !!booking?.service?.id
    );

  const createQuotePaymentMutation = useCreateQuotePayment();
  const verifyQuotePaymentMutation = useVerifyQuotePayment();
  const processWalletPaymentMutation = useProcessWalletPayment();

  // Computed values
  const dateOptions = bookingConfigData?.data
    ? generateDateOptions(bookingConfigData.data)
    : [];
  const availableSlots = availableSlotsData?.data?.available_slots || [];
  const isWalletDisabled =
    (walletSummary?.current_balance || 0) < (booking?.quote_amount || 0);
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
      if (!booking?.service?.id) {
        handleSetError("Service information not available");
        return;
      }

      handleSetSelectedDate(date);
      handleClearError();
    },
    [
      booking?.service?.id,
      handleSetError,
      handleSetSelectedDate,
      handleClearError,
    ]
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
    if (
      !booking ||
      !selectedDate ||
      !selectedTimeSlot ||
      !selectedPaymentMethod
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

      const paymentData = {
        scheduled_date: selectedDate,
        scheduled_time: selectedTimeSlot.time,
        amount: booking.quote_amount || 0,
      };

      if (selectedPaymentMethod === "wallet") {
        await processWalletPaymentMutation.mutateAsync({
          bookingId,
          paymentData,
        });
        handleSetSuccess("Quote accepted and payment completed successfully!");
        // Close modal after a delay to show success message
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        const response = await createQuotePaymentMutation.mutateAsync({
          bookingId,
          paymentData,
        });

        const order = response.data.payment_order;
        dispatch(
          setPaymentOrder({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          })
        );
        dispatch(setShowRazorpayCheckout(true));
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
    dispatch,
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

        await verifyQuotePaymentMutation.mutateAsync({
          bookingId,
          paymentData,
        });

        handleSetSuccess("Quote accepted and payment completed successfully!");
        // Close modal after a delay to show success message
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } catch (error) {
        console.error("Payment verification error:", error);
        handleSetError("Payment verification failed. Please contact support.");
      }
    },
    [booking, verifyQuotePaymentMutation, handleSetError]
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
