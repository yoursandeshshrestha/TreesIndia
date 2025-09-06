import { authenticatedFetch } from "./auth-api";
import {
  PaymentProgress,
  PaymentSegmentInfo,
  CreateSegmentPaymentRequest,
  BookingWithPaymentProgress,
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
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  booking_reference: string;
  user_id: number;
  service_id: number;
  status: string;
  payment_status: string;
  booking_type: string;
  completion_type: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  scheduled_end_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  actual_duration_minutes: number | null;
  address: string; // JSON string that needs to be parsed
  description: string;
  contact_person: string;
  contact_phone: string;
  special_instructions: string;
  hold_expires_at: string | null;
  quote_amount: number | null;
  quote_notes: string;
  quote_provided_by: number | null;
  quote_provided_at: string | null;
  quote_accepted_at: string | null;
  quote_expires_at: string | null;

  service?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    images: string[] | null;
    price_type: string;
    price: number | null;
    duration: string | null;
    category_id: number;
    subcategory_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };

  user?: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
    email: string | null;
    phone: string;
    user_type: string;
    avatar: string;
    gender: string;
    is_active: boolean;
    last_login_at: string | null;
    role_application_status: string;
    application_date: string | null;
    approval_date: string | null;
    wallet_balance: number;
    subscription_id: number | null;
    subscription: Record<string, unknown> | null;
    has_active_subscription: boolean;
    subscription_expiry_date: string | null;
    notification_settings: Record<string, unknown> | null;
  };

  payment?: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    payment_reference: string;
    user_id: number;
    amount: number;
    currency: string;
    status: string;
    type: string;
    method: string;
    related_entity_type: string;
    related_entity_id: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    initiated_at: string;
    completed_at: string | null;
    failed_at: string | null;
    refunded_at: string | null;
    balance_after: number | null;
    refund_amount: number | null;
    refund_reason: string | null;
    refund_method: string | null;
    description: string;
    notes: string;
    metadata: Record<string, unknown>;
    user: Record<string, unknown>;
  };

  worker_assignment?: {
    ID?: number;
    CreatedAt?: string;
    UpdatedAt?: string;
    DeletedAt?: string | null;
    booking_id?: number;
    worker_id?: number;
    assigned_by?: number;
    status?: string;
    assigned_at?: string;
    accepted_at?: string | null;
    rejected_at?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    assignment_notes?: string;
    acceptance_notes?: string;
    rejection_notes?: string;
    rejection_reason?: string;
    worker?: {
      id: number;
      name: string;
      phone: string;
      user_type: string;
    };
    assigned_by_user?: {
      id: number;
      name: string;
      phone: string;
      user_type: string;
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

// Get payment segments for a booking
export async function getPaymentSegments(
  bookingId: number
): Promise<{ success: boolean; data: PaymentProgress }> {
  try {
    const url = `${API_BASE_URL}/bookings/${bookingId}/payment-segments`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching payment segments:", error);
    throw error;
  }
}

// Pay for a specific payment segment
export async function paySegment(
  bookingId: number,
  paymentData: CreateSegmentPaymentRequest
): Promise<{ success: boolean; data: any }> {
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
