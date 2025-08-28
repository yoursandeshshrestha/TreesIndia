import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Service,
  Address,
  BookingRequest,
  AvailableSlot,
  BookingResponse,
  PaymentOrderResponse,
} from "@/types/booking";

// Define specific types for booking result and payment order
interface BookingResult {
  booking: {
    id: number;
    booking_reference: string;
    status: string;
    payment_status: string;
    total_amount?: number;
    scheduled_date?: string;
    scheduled_time?: string;
  };
  payment_order?: {
    id: string;
    amount: number;
    currency: string;
    key_id: string;
    receipt: string;
  };
  payment_required: boolean;
  message: string;
}

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  key_id: string;
  receipt: string;
}

export interface BookingState {
  // Service selection
  selectedService: Service | null;

  // Address selection
  selectedAddress: Address | null;

  // Date and time selection (for fixed price services)
  selectedDate: string;
  selectedTimeSlot: AvailableSlot | null;

  // Booking form data
  bookingForm: Partial<BookingRequest>;

  // Current step in the booking flow
  currentStep: number;

  // Loading states
  isLoading: boolean;

  // Error state
  error: string | null;

  // Booking result
  bookingResult: BookingResult | null;

  // Payment state
  paymentOrder: PaymentOrder | null;
  isPaymentProcessing: boolean;
}

const initialState: BookingState = {
  selectedService: null,
  selectedAddress: null,
  selectedDate: "",
  selectedTimeSlot: null,
  bookingForm: {
    service_id: 0,
    scheduled_date: "",
    scheduled_time: "",
    address: {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      latitude: 0,
      longitude: 0,
      landmark: "",
      house_number: "",
    },
    description: "",
    contact_person: "",
    contact_phone: "",
    special_instructions: "",
  },
  currentStep: 1,
  isLoading: false,
  error: null,
  bookingResult: null,
  paymentOrder: null,
  isPaymentProcessing: false,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // Set selected service
    setSelectedService: (state, action: PayloadAction<Service>) => {
      state.selectedService = action.payload;
      state.bookingForm.service_id = action.payload.id;
      state.error = null;
    },

    // Set selected address
    setSelectedAddress: (state, action: PayloadAction<Address>) => {
      state.selectedAddress = action.payload;
      state.bookingForm.address = {
        name: action.payload.name,
        address: action.payload.address,
        city: action.payload.city,
        state: action.payload.state,
        country: action.payload.country,
        postal_code: action.payload.postal_code,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        landmark: action.payload.landmark || "",
        house_number: action.payload.house_number || "",
      };
      state.error = null;
    },

    // Set selected date
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      state.bookingForm.scheduled_date = action.payload;
      state.error = null;
    },

    // Set selected time slot
    setSelectedTimeSlot: (state, action: PayloadAction<AvailableSlot>) => {
      state.selectedTimeSlot = action.payload;
      state.bookingForm.scheduled_time = action.payload.time;
      state.error = null;
    },

    // Update booking form
    updateBookingForm: (
      state,
      action: PayloadAction<Partial<BookingRequest>>
    ) => {
      state.bookingForm = { ...state.bookingForm, ...action.payload };
      state.error = null;
    },

    // Set current step
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      state.error = null;
    },

    // Next step
    nextStep: (state) => {
      state.currentStep += 1;
      state.error = null;
    },

    // Previous step
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Set booking result
    setBookingResult: (state, action: PayloadAction<BookingResult>) => {
      state.bookingResult = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // Set payment order
    setPaymentOrder: (state, action: PayloadAction<PaymentOrder>) => {
      state.paymentOrder = action.payload;
    },

    // Set payment processing state
    setPaymentProcessing: (state, action: PayloadAction<boolean>) => {
      state.isPaymentProcessing = action.payload;
    },

    // Reset booking state
    resetBooking: (state) => {
      return initialState;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSelectedService,
  setSelectedAddress,
  setSelectedDate,
  setSelectedTimeSlot,
  updateBookingForm,
  setCurrentStep,
  nextStep,
  previousStep,
  setLoading,
  setError,
  setBookingResult,
  setPaymentOrder,
  setPaymentProcessing,
  resetBooking,
  clearError,
} = bookingSlice.actions;

export default bookingSlice.reducer;
