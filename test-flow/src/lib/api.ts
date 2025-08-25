import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

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

export interface Address {
  id: number;
  user_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  house_number?: string;
  is_default: boolean;
  updated_at: string;
  created_at: string;
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

// TODO: Update this interface when backend supports the new structure
// Future structure should be:
// {
//   service_id: number;
//   scheduled_date: string;
//   scheduled_time: string;
//   address_id: number;  // Instead of address string
//   notes?: string;      // Instead of description
//   preferred_worker_id?: number;
// }
export interface BookingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  landmark: string;
  house_number: string;
}

export interface BookingRequest {
  service_id: number;
  scheduled_date: string;
  scheduled_time: string;
  address: BookingAddress;
  description?: string;
  contact_person?: string;
  contact_phone?: string;
  special_instructions?: string;
}

export interface Booking {
  id?: number;
  ID?: number; // GORM returns capitalized ID
  booking_reference: string;
  status: string;
  payment_status: string;
  booking_type: string;
  scheduled_date?: string;
  scheduled_time?: string;
  total_amount?: number;
  address: string;
  description: string;
  created_at?: string;
  CreatedAt?: string; // Backend uses capitalized field names
  updated_at?: string;
  UpdatedAt?: string; // Backend uses capitalized field names

  // Quote-related fields
  quote_amount?: number;
  quote_notes?: string;
  quote_provided_at?: string;
  quote_accepted_at?: string;
  quote_expires_at?: string;

  // Contact information
  contact_person?: string;
  contact_phone?: string;

  // Service information
  service?: {
    id: number;
    name: string;
    price_type: string;
    price?: number;
    duration?: string;
  };

  // User information
  user?: {
    id?: number;
    ID?: number; // Backend uses capitalized field names
    name: string;
    phone: string;
    user_type: string;
  };
}

// Wallet Types (Unified Payment System)
export interface WalletTransaction {
  id?: number;
  ID?: number; // Backend might return ID (capitalized)
  user_id: number;
  // New unified payment fields
  type?: string; // Payment type (wallet_recharge, wallet_debit, etc.)
  method?: string; // Payment method
  payment_reference?: string; // Payment reference
  balance_after?: number; // Balance after transaction
  // Razorpay fields
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  // Legacy fields for backward compatibility
  transaction_type?: string;
  payment_method?: string;
  reference_id?: string;
  previous_balance?: number;
  new_balance?: number;
  // Common fields
  status: string;
  amount: number;
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

export interface CreateInquiryBookingRequest {
  service_id: number;
  address: BookingAddress;
  description?: string;
  contact_person?: string;
  contact_phone?: string;
  special_instructions?: string;
}

export interface VerifyInquiryPaymentRequest {
  service_id: number;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
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

  // Get user addresses
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get("/addresses");
    return response.data.data || response.data.addresses || response.data || [];
  },

  // Get booking configuration
  getBookingConfig: async (): Promise<Record<string, string>> => {
    const response = await api.get("/bookings/config");
    return response.data.data || response.data || {};
  },

  // Get available time slots
  getAvailableSlots: async (
    serviceId: number,
    date: string
  ): Promise<AvailabilityResponse> => {
    const response = await api.get(
      `/bookings/available-slots?service_id=${serviceId}&date=${date}`
    );
    return response.data.data || response.data || [];
  },

  // Create booking (handles all booking types)
  createBooking: async (
    bookingData: BookingRequest
  ): Promise<{
    message: string;
    booking: Booking;
    payment_order?: Record<string, unknown>;
    payment_required: boolean;
    payment_type?: string;
  }> => {
    const response = await api.post("/bookings", bookingData);
    return response.data.data || response.data;
  },

  // Verify payment for a booking
  verifyPayment: async (
    bookingId: number,
    paymentData: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }
  ): Promise<{
    message: string;
    booking: Booking;
    payment: {
      payment_id: string;
      order_id: string;
      amount: number;
      status: string;
    };
  }> => {
    const response = await api.post(
      `/bookings/${bookingId}/verify-payment`,
      paymentData
    );
    return response.data.data || response.data;
  },

  // Get user bookings
  getUserBookings: async (): Promise<Booking[]> => {
    const response = await api.get("/bookings");
    return response.data.bookings || response.data.data || response.data || [];
  },

  // Get booking by ID
  getBookingById: async (bookingId: number): Promise<Booking> => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data.data || response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId: number): Promise<{ message: string }> => {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data.data || response.data;
  },

  // ===== WALLET API METHODS =====

  // Create wallet recharge
  createWalletRecharge: async (data: {
    amount: number;
    payment_method: string;
  }): Promise<{
    payment: any;
    payment_order: any;
    message: string;
  }> => {
    const response = await api.post("/wallet/recharge", data);
    return response.data.data || response.data;
  },

  // Complete wallet recharge
  completeWalletRecharge: async (
    paymentId: number,
    paymentData: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }
  ): Promise<{ message: string }> => {
    const response = await api.post(
      `/wallet/recharge/${paymentId}/complete`,
      paymentData
    );
    return response.data.data || response.data;
  },

  // Get wallet summary
  getWalletSummary: async (): Promise<WalletSummary> => {
    const response = await api.get("/wallet/summary");
    return response.data.data || response.data;
  },

  // Get wallet transactions
  getWalletTransactions: async (
    page = 1,
    limit = 10
  ): Promise<WalletTransaction[]> => {
    const response = await api.get(
      `/wallet/transactions?page=${page}&limit=${limit}`
    );
    return response.data.data?.transactions || response.data.transactions || [];
  },

  // Get wallet transactions by type
  getWalletTransactionsByType: async (
    type: string,
    page = 1,
    limit = 10
  ): Promise<WalletTransaction[]> => {
    const response = await api.get(
      `/wallet/transactions/type/${type}?page=${page}&limit=${limit}`
    );
    return response.data.data?.transactions || response.data.transactions || [];
  },

  // Get transaction by reference
  getTransactionByReference: async (
    referenceId: string
  ): Promise<WalletTransaction> => {
    const response = await api.get(`/wallet/transaction/${referenceId}`);
    return response.data.data || response.data;
  },

  // Cancel wallet recharge
  cancelWalletRecharge: async (
    paymentId: number
  ): Promise<{ message: string }> => {
    const response = await api.post(`/wallet/recharge/${paymentId}/cancel`);
    return response.data.data || response.data;
  },

  async createInquiryBooking(data: CreateInquiryBookingRequest) {
    const response = await api.post("/bookings/inquiry", data);
    return response.data.data || response.data;
  },

  async verifyInquiryPayment(data: VerifyInquiryPaymentRequest) {
    const response = await api.post(`/bookings/inquiry/verify-payment`, data);
    return response.data.data || response.data;
  },

  // Check if a service is available in a specific location
  async checkServiceAvailability(
    serviceId: number,
    city: string,
    state: string
  ): Promise<boolean> {
    try {
      const response = await api.get(
        `/service-availability/${serviceId}?city=${encodeURIComponent(
          city
        )}&state=${encodeURIComponent(state)}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to check service availability:", error);
      return false;
    }
  },

  // Get all services available in a specific location
  async getServicesByLocation(city: string, state: string): Promise<any[]> {
    try {
      const response = await api.get(
        `/services/by-location?city=${encodeURIComponent(
          city
        )}&state=${encodeURIComponent(state)}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to get services by location:", error);
      return [];
    }
  },

  // Accept quote for inquiry booking
  async acceptQuote(
    bookingId: number,
    notes?: string
  ): Promise<{ message: string }> {
    const response = await api.post(`/bookings/${bookingId}/accept-quote`, {
      notes: notes || "",
    });
    return response.data.data || response.data;
  },

  // Reject quote for inquiry booking
  async rejectQuote(
    bookingId: number,
    reason: string
  ): Promise<{ message: string }> {
    const response = await api.post(`/bookings/${bookingId}/reject-quote`, {
      reason: reason,
    });
    return response.data.data || response.data;
  },

  // Get quote information for a booking
  async getQuoteInfo(bookingId: number): Promise<any> {
    const response = await api.get(`/bookings/${bookingId}/quote-info`);
    return response.data.data || response.data;
  },

  // Schedule service after quote acceptance
  async scheduleAfterQuote(
    bookingId: number,
    scheduledDate: string,
    scheduledTime: string,
    notes?: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `/bookings/${bookingId}/schedule-after-quote`,
      {
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        notes: notes || "",
      }
    );
    return response.data.data || response.data;
  },

  // Create payment for quote acceptance
  async createQuotePayment(
    bookingId: number,
    data: {
      scheduled_date: string;
      scheduled_time: string;
      amount: number;
    }
  ): Promise<{ payment_order: any; message: string }> {
    const response = await api.post(
      `/bookings/${bookingId}/create-quote-payment`,
      data
    );
    return response.data.data || response.data;
  },

  // Verify quote payment
  async verifyQuotePayment(
    bookingId: number,
    paymentData: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }
  ): Promise<{ message: string; booking: any }> {
    const response = await api.post(
      `/bookings/${bookingId}/verify-quote-payment`,
      paymentData
    );
    return response.data.data || response.data;
  },
};
