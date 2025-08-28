import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Booking } from "@/lib/bookingApi";
import { AvailableSlot } from "@/types/booking";
import {
  useCreateQuotePayment,
  useVerifyQuotePayment,
  useProcessWalletPayment,
} from "@/hooks/useBookingFlow";

export type PaymentMethod = "wallet" | "razorpay";
export type QuoteStep = "date" | "time" | "payment" | "processing";

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  key_id: string;
}

interface QuoteAcceptanceState {
  isOpen: boolean;
  booking: Booking | null;
  currentStep: QuoteStep;
  selectedDate: string | null;
  selectedTimeSlot: AvailableSlot | null;
  selectedPaymentMethod: PaymentMethod | null;
  paymentOrder: PaymentOrder | null;
  showRazorpayCheckout: boolean;
  error: string | null;
  isLoading: boolean;
  showSuccess: boolean;
  successMessage: string | null;
}

const initialState: QuoteAcceptanceState = {
  isOpen: false,
  booking: null,
  currentStep: "date",
  selectedDate: null,
  selectedTimeSlot: null,
  selectedPaymentMethod: null,
  paymentOrder: null,
  showRazorpayCheckout: false,
  error: null,
  isLoading: false,
  showSuccess: false,
  successMessage: null,
};

// Async thunks
export const processWalletPayment = createAsyncThunk(
  "quoteAcceptance/processWalletPayment",
  async ({
    bookingId,
    paymentData,
  }: {
    bookingId: number;
    paymentData: {
      scheduled_date: string;
      scheduled_time: string;
      amount: number;
    };
  }) => {
    // This will be handled by the component using the mutation
    return { bookingId, paymentData };
  }
);

export const createQuotePayment = createAsyncThunk(
  "quoteAcceptance/createQuotePayment",
  async ({
    bookingId,
    paymentData,
  }: {
    bookingId: number;
    paymentData: {
      scheduled_date: string;
      scheduled_time: string;
      amount: number;
    };
  }) => {
    // This will be handled by the component using the mutation
    return { bookingId, paymentData };
  }
);

export const verifyQuotePayment = createAsyncThunk(
  "quoteAcceptance/verifyQuotePayment",
  async ({
    bookingId,
    paymentData,
  }: {
    bookingId: number;
    paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };
  }) => {
    // This will be handled by the component using the mutation
    return { bookingId, paymentData };
  }
);

const quoteAcceptanceSlice = createSlice({
  name: "quoteAcceptance",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<Booking>) => {
      state.isOpen = true;
      state.booking = action.payload;
      state.currentStep = "date";
      state.selectedDate = null;
      state.selectedTimeSlot = null;
      state.selectedPaymentMethod = null;
      state.paymentOrder = null;
      state.showRazorpayCheckout = false;
      state.error = null;
      state.isLoading = false;
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.booking = null;
      state.currentStep = "date";
      state.selectedDate = null;
      state.selectedTimeSlot = null;
      state.selectedPaymentMethod = null;
      state.paymentOrder = null;
      state.showRazorpayCheckout = false;
      state.error = null;
      state.isLoading = false;
    },
    setCurrentStep: (state, action: PayloadAction<QuoteStep>) => {
      state.currentStep = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    setSelectedTimeSlot: (
      state,
      action: PayloadAction<AvailableSlot | null>
    ) => {
      state.selectedTimeSlot = action.payload;
    },
    setSelectedPaymentMethod: (
      state,
      action: PayloadAction<PaymentMethod | null>
    ) => {
      state.selectedPaymentMethod = action.payload;
    },
    setPaymentOrder: (state, action: PayloadAction<PaymentOrder | null>) => {
      state.paymentOrder = action.payload;
    },
    setShowRazorpayCheckout: (state, action: PayloadAction<boolean>) => {
      state.showRazorpayCheckout = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSuccess: (state, action: PayloadAction<string>) => {
      state.showSuccess = true;
      state.successMessage = action.payload;
    },
    clearSuccess: (state) => {
      state.showSuccess = false;
      state.successMessage = null;
    },
    resetState: (state) => {
      state.currentStep = "date";
      state.selectedDate = null;
      state.selectedTimeSlot = null;
      state.selectedPaymentMethod = null;
      state.paymentOrder = null;
      state.showRazorpayCheckout = false;
      state.error = null;
      state.isLoading = false;
      state.showSuccess = false;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processWalletPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processWalletPayment.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(processWalletPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Wallet payment failed";
      })
      .addCase(createQuotePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createQuotePayment.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createQuotePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to create payment order";
      })
      .addCase(verifyQuotePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyQuotePayment.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyQuotePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Payment verification failed";
      });
  },
});

export const {
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
} = quoteAcceptanceSlice.actions;

export default quoteAcceptanceSlice.reducer;
