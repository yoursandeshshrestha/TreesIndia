import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent_id: number;
  is_active: boolean;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_type: "fixed" | "inquiry";
  price?: number;
  duration?: string;
  category_id: number;
  subcategory_id: number;
  is_active: boolean;
}

export interface AvailableSlot {
  time: string;
  available_workers: number;
  is_available: boolean;
}

export interface AvailabilityResponse {
  working_hours: {
    start: string;
    end: string;
  };
  service_duration: number;
  buffer_time: number;
  available_slots: AvailableSlot[];
}

export interface TimeSlot {
  id: number;
  service_id: number;
  date: string;
  start_time: string;
  end_time: string;
  available_workers: number;
  total_workers: number;
  is_active: boolean;
  // Computed field for frontend - slot is available if workers > 0 and active
  is_available?: boolean;
}

export interface BookingRequest {
  service_id: number;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  description?: string;
  contact_person?: string;
  contact_phone?: string;
  special_instructions?: string;
}

export interface Booking {
  id: number;
  booking_reference: string;
  status: string;
  payment_status: string;
  scheduled_date: string;
  scheduled_time: string;
  total_amount: number;
  address: string;
  description: string;
}

// Wallet Types
export interface WalletTransaction {
  id?: number;
  ID?: number; // Backend might return ID (capitalized)
  user_id: number;
  transaction_type: string;
  status: string;
  payment_method?: string;
  amount: number;
  previous_balance?: number;
  new_balance?: number;
  balance_after?: number; // Current schema uses this
  reference_id: string;
  description: string;
  created_at: string;
}

export interface WalletSummary {
  current_balance: number;
  total_recharge: number; // Backend returns total_recharge, not total_recharged
  total_spent: number;
  total_transactions: number;
  recent_transactions?: WalletTransaction[];
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  key_id: string;
}

// API functions
export const apiService = {
  // Set authentication token
  setAuthToken: (token: string) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  },

  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return (
      response.data.data || response.data.categories || response.data || []
    );
  },

  // Get subcategories by category ID
  getSubcategories: async (categoryId: number): Promise<Subcategory[]> => {
    const response = await api.get(`/subcategories/category/${categoryId}`);
    return (
      response.data.data || response.data.subcategories || response.data || []
    );
  },

  // Get services by subcategory ID
  getServices: async (subcategoryId: number): Promise<Service[]> => {
    const response = await api.get(`/services/subcategory/${subcategoryId}`);
    return response.data.data || response.data.services || response.data || [];
  },

  // Get booking configuration
  getBookingConfig: async (): Promise<Record<string, string>> => {
    const response = await api.get("/bookings/config");
    return response.data.data || response.data || {};
  },

  // Get available time slots for a specific service and date
  getAvailableSlots: async (
    serviceId: number,
    date: string
  ): Promise<AvailabilityResponse> => {
    const response = await api.get(
      `/bookings/available-slots?service_id=${serviceId}&date=${date}`
    );
    return response.data.data || response.data || [];
  },

  // Create booking (for inquiry-based services)
  createBooking: async (bookingData: BookingRequest): Promise<Booking> => {
    const response = await api.post("/bookings", bookingData);
    return (
      response.data.data?.booking || response.data.booking || response.data
    );
  },

  // Create inquiry booking (simplified flow - only service_id required)
  createInquiryBooking: async (bookingData: {
    service_id: number;
  }): Promise<{
    booking: Booking;
    payment_order?: Record<string, unknown>;
    payment_required: boolean;
  }> => {
    const response = await api.post("/bookings/inquiry", bookingData);
    console.log("Raw API response:", response.data);
    const result = response.data.data || response.data;
    console.log("Parsed result:", result);
    return result;
  },

  // Create payment order (for fixed-price services)
  createPaymentOrder: async (
    bookingData: BookingRequest
  ): Promise<{
    payment_order: Record<string, unknown>;
    booking_reference: string;
    service: Service;
  }> => {
    const response = await api.post("/bookings/payment-order", bookingData);
    return response.data.data || response.data;
  },

  // Create booking with payment (for fixed-price services)
  createBookingWithPayment: async (
    bookingData: BookingRequest
  ): Promise<{ booking: Booking; payment_order: Record<string, unknown> }> => {
    const response = await api.post("/bookings/with-payment", bookingData);
    return response.data.data || response.data;
  },

  // Verify payment and create booking
  verifyPaymentAndCreateBooking: async (paymentData: {
    service_id: number;
    scheduled_date: string;
    scheduled_time: string;
    address: string;
    description?: string;
    contact_person?: string;
    contact_phone?: string;
    special_instructions?: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<Booking> => {
    const response = await api.post(
      "/bookings/verify-payment-and-create",
      paymentData
    );
    return (
      response.data.data?.booking || response.data.booking || response.data
    );
  },

  // Verify payment
  verifyPayment: async (paymentData: {
    booking_id: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<Booking> => {
    const response = await api.post("/bookings/verify-payment", paymentData);
    return (
      response.data.data?.booking || response.data.booking || response.data
    );
  },

  // Verify inquiry payment and create booking
  verifyInquiryPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<Booking> => {
    const response = await api.post(
      "/bookings/verify-inquiry-payment",
      paymentData
    );
    return (
      response.data.data?.booking || response.data.booking || response.data
    );
  },

  // Get user bookings
  getUserBookings: async (): Promise<Booking[]> => {
    const response = await api.get("/bookings");
    return (
      response.data.data?.bookings || response.data.bookings || response.data
    );
  },

  // Wallet API functions
  // Get wallet summary
  getWalletSummary: async (): Promise<WalletSummary> => {
    const response = await api.get("/wallet/summary");
    return response.data.data || response.data;
  },

  // Get wallet transactions
  getWalletTransactions: async (): Promise<WalletTransaction[]> => {
    const response = await api.get("/wallet/transactions");
    return (
      response.data.data?.transactions ||
      response.data.transactions ||
      response.data ||
      []
    );
  },

  // Create wallet recharge
  createWalletRecharge: async (data: {
    amount: number;
    payment_method: string;
  }): Promise<{
    order: RazorpayOrder;
    transaction: WalletTransaction;
  }> => {
    const response = await api.post("/razorpay/create-order", {
      amount: data.amount,
      receipt: `wallet_recharge_${Date.now()}`,
    });
    return response.data.data || response.data;
  },

  // Complete wallet recharge
  completeWalletRecharge: async (
    transactionId: number,
    paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ): Promise<void> => {
    await api.post(`/wallet/recharge/${transactionId}/complete`, paymentData);
  },
};
