import { Address } from '../services/api/address.service';
import { Service } from '../services/api/service.service';

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  available_workers?: number;
}

export interface BookingConfig {
  inquiry_fee: number;
  cancellation_policy?: string;
  booking_advance_days?: string;
  working_hours?: {
    start: string;
    end: string;
  };
}

export interface CreateBookingRequest {
  service_id: number;
  address: BookingAddress;
  scheduled_date: string;
  scheduled_time: string;
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

export interface CreateInquiryRequest {
  service_id: number;
  address: BookingAddress;
  contact_person: string;
  contact_phone: string;
  description: string;
  special_instructions?: string;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  key_id: string;
  receipt?: string;
}

export interface Booking {
  ID: number;
  id?: number; // Fallback for compatibility
  user_id: number;
  service_id: number;
  service?: Service;
  address_id: number;
  address?: Address;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'quote_provided' | 'quote_accepted';
  booking_date?: string;
  slot_id?: string;
  start_time?: string;
  end_time?: string;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'razorpay' | 'wallet';
  contact_person?: string;
  contact_phone?: string;
  description?: string;
  special_instructions?: string;
  is_inquiry: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BookingResponse {
  booking: Booking;
  payment_order?: PaymentOrder;
  message?: string;
  hold_expires_at?: string;
  payment_required?: boolean;
  payment_type?: string;
}

export interface BookingsListResponse {
  success: boolean;
  message?: string;
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface RazorpayData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: {
    booking: Booking;
    payment: {
      payment_id: string;
      order_id: string;
      amount: number;
      status: string;
    };
  };
  timestamp: string;
}

export interface ContactInfoData {
  contactPerson: string;
  phone: string;
  description?: string;
  specialInstructions?: string;
}

export interface BookingState {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  bookingConfig: BookingConfig | null;
  isLoading: boolean;
  error: string | null;
}
