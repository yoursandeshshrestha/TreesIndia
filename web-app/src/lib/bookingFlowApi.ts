import {
  BookingRequest,
  BookingResponse,
  AddressResponse,
  AvailableSlotsResponse,
  BookingConfigResponse,
  ServiceAvailabilityResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  InquiryBookingRequest,
  InquiryBookingResponse,
  Booking,
} from "@/types/booking";
import { authenticatedFetch } from "@/lib/auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

export const bookingFlowApi = {
  // Get booking configuration
  getBookingConfig: async (): Promise<BookingConfigResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/config`
    );
    return handleApiResponse(response);
  },

  // Get user addresses
  getAddresses: async (): Promise<AddressResponse> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/addresses`);
    return handleApiResponse(response);
  },

  // Get available time slots for a service and date
  getAvailableSlots: async (
    serviceId: number,
    date: string
  ): Promise<AvailableSlotsResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/available-slots?service_id=${serviceId}&date=${date}`
    );
    return handleApiResponse(response);
  },

  // Check service availability in a location
  checkServiceAvailability: async (
    serviceId: number,
    city: string,
    state: string
  ): Promise<ServiceAvailabilityResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/service-availability/${serviceId}?city=${encodeURIComponent(
        city
      )}&state=${encodeURIComponent(state)}`
    );
    return handleApiResponse(response);
  },

  // Create booking (fixed price services)
  createBooking: async (
    bookingData: BookingRequest
  ): Promise<BookingResponse> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
    return handleApiResponse(response);
  },

  // Create inquiry booking
  createInquiryBooking: async (
    bookingData: InquiryBookingRequest
  ): Promise<InquiryBookingResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/inquiry`,
      {
        method: "POST",
        body: JSON.stringify(bookingData),
      }
    );
    return handleApiResponse(response);
  },

  // Verify payment for fixed price booking
  verifyPayment: async (
    bookingId: number,
    paymentData: PaymentVerificationRequest
  ): Promise<PaymentVerificationResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/verify-payment`,
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      }
    );
    return handleApiResponse(response);
  },

  // Verify payment for inquiry booking
  verifyInquiryPayment: async (
    paymentData: PaymentVerificationRequest & { service_id: number }
  ): Promise<PaymentVerificationResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/inquiry/verify-payment`,
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      }
    );
    return handleApiResponse(response);
  },

  // Get booking by ID
  getBookingById: async (bookingId: number): Promise<BookingResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}`
    );
    return handleApiResponse(response);
  },

  // Cancel booking
  cancelBooking: async (bookingId: number): Promise<{ message: string }> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/cancel`,
      {
        method: "PUT",
      }
    );
    return handleApiResponse(response);
  },

  // Get user bookings
  getUserBookings: async (): Promise<{ bookings: Booking[] }> => {
    const response = await authenticatedFetch(`${API_BASE_URL}/bookings`);
    return handleApiResponse(response);
  },

  // Create quote payment order
  createQuotePayment: async (
    bookingId: number,
    paymentData: {
      scheduled_date: string;
      scheduled_time: string;
      amount: number;
    }
  ): Promise<{ data: { payment_order: Record<string, unknown> } }> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/create-quote-payment`,
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      }
    );
    return handleApiResponse(response);
  },

  // Verify quote payment
  verifyQuotePayment: async (
    bookingId: number,
    paymentData: PaymentVerificationRequest
  ): Promise<PaymentVerificationResponse> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/verify-quote-payment`,
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      }
    );
    return handleApiResponse(response);
  },

  // Process wallet payment for quote
  processWalletPayment: async (
    bookingId: number,
    paymentData: {
      scheduled_date: string;
      scheduled_time: string;
      amount: number;
    }
  ): Promise<{ message: string }> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/wallet-payment`,
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      }
    );
    return handleApiResponse(response);
  },

  // Create booking with wallet payment
  createBookingWithWallet: async (
    bookingData: BookingRequest
  ): Promise<{ message: string; booking: Record<string, unknown> }> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/wallet`,
      {
        method: "POST",
        body: JSON.stringify(bookingData),
      }
    );
    return handleApiResponse(response);
  },

  // Create inquiry booking with wallet payment
  createInquiryBookingWithWallet: async (
    bookingData: InquiryBookingRequest
  ): Promise<{ message: string; booking: Record<string, unknown> }> => {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/inquiry/wallet`,
      {
        method: "POST",
        body: JSON.stringify(bookingData),
      }
    );
    return handleApiResponse(response);
  },
};
