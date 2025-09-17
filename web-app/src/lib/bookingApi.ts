import { authenticatedFetch } from "./auth-api";
import {
  PaymentSegmentInfo,
  CreateSegmentPaymentRequest,
} from "@/types/booking";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Booking API functions for my-bookings functionality

export interface UserBookingsResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

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

export interface Booking {
  ID: number;
  booking_reference: string;
  status: string;
  booking_type: string;
  payment_status?: string;
  scheduled_date: string;
  scheduled_time: string;
  scheduled_end_time: string;
  actual_start_time: string | null;
  actual_end_time: string | null;
  actual_duration_minutes: number | null;
  hold_expires_at: string | null;
  created_at: string;
  updated_at: string;

  // Quote-related fields
  quote_amount?: number;
  quote_notes?: string;
  quote_provided_at?: string;
  quote_accepted_at?: string;
  quote_expires_at?: string;

  // Payment progress (for backward compatibility)
  payment_progress?: {
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    total_segments: number;
    paid_segments: number;
    remaining_segments: number;
    progress_percentage: number;
    segments: PaymentSegmentInfo[];
  };

  service?: {
    ID: number;
    name: string;
    price_type: string;
    price: number;
    duration: string;
  };

  user?: {
    ID: number;
    name: string;
    user_type: string;
  };

  address?: {
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
  };

  contact?: {
    person: string;
    description: string;
    special_instructions: string;
  };

  payment?: {
    status: string;
    amount: number;
    currency: string;
    payment_method: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    created_at: string;
  };

  worker_assignment?: {
    worker_id: number;
    status: string;
    worker?: {
      ID: number;
      name: string;
      user_type: string;
      phone?: string;
    };
  };
}

export interface BookingDetailResponse {
  booking: Booking;
}

export interface CancelBookingRequest {
  reason: string;
  cancellation_reason?: string;
}

export interface CancelBookingResponse {
  message: string;
  result: Record<string, unknown>;
}

// Helper function to parse address JSON string
export function parseBookingAddress(
  addressString: string
): BookingAddress | null {
  try {
    return JSON.parse(addressString);
  } catch (error) {
    console.error("Error parsing booking address:", error);
    return null;
  }
}

// Get user's bookings with optional filtering and pagination
export async function fetchUserBookings(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<UserBookingsResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const url = `${API_BASE_URL}/bookings${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
}

// Get specific booking by ID
export async function fetchBookingById(
  bookingId: number
): Promise<BookingDetailResponse> {
  try {
    const url = `${API_BASE_URL}/bookings/${bookingId}`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
}

// Cancel a booking
export async function cancelBooking(
  bookingId: number,
  cancelData: CancelBookingRequest
): Promise<CancelBookingResponse> {
  try {
    const url = `${API_BASE_URL}/bookings/${bookingId}/cancel`;
    const response = await authenticatedFetch(url, {
      method: "PUT",
      body: JSON.stringify(cancelData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
}

// Accept a quote for inquiry booking
export async function acceptQuote(
  bookingId: number,
  notes?: string
): Promise<{ message: string }> {
  try {
    const url = `${API_BASE_URL}/bookings/${bookingId}/accept-quote`;
    const response = await authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify({
        notes: notes || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error accepting quote:", error);
    throw error;
  }
}

// Reject a quote for inquiry booking
export async function rejectQuote(
  bookingId: number,
  reason: string
): Promise<{ message: string }> {
  try {
    const url = `${API_BASE_URL}/bookings/${bookingId}/reject-quote`;
    const response = await authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify({
        reason: reason,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error rejecting quote:", error);
    throw error;
  }
}

// Payment Segment API functions

// Pay for a specific payment segment
export async function paySegment(
  bookingId: number,
  paymentData: CreateSegmentPaymentRequest
): Promise<{ success: boolean; data: PaymentSegmentInfo }> {
  try {
    const url = `${API_BASE_URL}/bookings/${bookingId}/payment-segments/pay`;
    const response = await authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error paying segment:", error);
    throw error;
  }
}

// Get pending payment segments
export async function getPendingSegments(
  bookingId: number
): Promise<{ success: boolean; data: PaymentSegmentInfo[] }> {
  try {
    const url = `${API_BASE_URL}/bookings/${bookingId}/payment-segments/pending`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pending segments:", error);
    throw error;
  }
}

// Get paid payment segments
export async function getPaidSegments(
  bookingId: number
): Promise<{ success: boolean; data: PaymentSegmentInfo[] }> {
  try {
    const url = `${API_BASE_URL}/bookings/${bookingId}/payment-segments/paid`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching paid segments:", error);
    throw error;
  }
}

// Create segment payment order
export async function createSegmentPaymentOrder(
  bookingId: number,
  paymentData: {
    segment_number: number;
    amount: number;
  }
): Promise<{ success: boolean; data: PaymentSegmentInfo }> {
  try {
    const url = `${API_BASE_URL}/bookings/${bookingId}/payment-segments/pay`;
    const response = await authenticatedFetch(url, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating segment payment order:", error);
    throw error;
  }
}
