// Service and Category types (reused from api.ts)
export interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  images: string[] | null;
  price_type: "fixed" | "inquiry";
  price: number | null;
  duration: string | null;
  category_id: number;
  subcategory_id: number;
  category: Category;
  subcategory: Subcategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  service_areas: ServiceArea[];
}

export interface Category {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent_id: number;
  parent: {
    id: number;
    created_at: string;
    updated_at: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    is_active: boolean;
  };
  is_active: boolean;
}

export interface ServiceArea {
  id: number;
  city: string;
  state: string;
  country: string;
  is_active: boolean;
}

// Address types
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

export interface AddressResponse {
  success: boolean;
  message: string;
  data: Address[];
  timestamp: string;
}

// Booking configuration
export interface BookingConfig {
  working_hours_start: string;
  working_hours_end: string;
  booking_advance_days: string;
  booking_buffer_time_minutes: string;
  inquiry_booking_fee: string;
}

export interface BookingConfigResponse {
  success: boolean;
  message: string;
  data: BookingConfig;
  timestamp: string;
}

// Available slots
export interface AvailableSlot {
  time: string;
  available_workers: number;
  is_available: boolean;
}

export interface AvailableSlotsResponse {
  success: boolean;
  message: string;
  data: {
    working_hours: {
      start: string;
      end: string;
    };
    service_duration: number;
    buffer_time: number;
    available_slots: AvailableSlot[];
  };
  timestamp: string;
}

// Service availability
export interface ServiceAvailabilityResponse {
  success: boolean;
  message: string;
  data: boolean;
  timestamp: string;
}

// Booking request/response types
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

export interface InquiryBookingRequest {
  service_id: number;
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
  quote_duration?: string;

  // Payment segments (for segment-based quotes)
  payment_segments?: PaymentSegmentInfo[];
  payment_progress?: PaymentProgress;

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

export interface BookingResponse {
  booking: Booking;
  hold_expires_at: string;
  message: string;
  payment_order?: {
    id: string;
    amount: number;
    currency: string;
    key_id: string;
    receipt: string;
  };
  payment_required: boolean;
  payment_type?: string;
}

// Response structure from backend that includes payment progress
// Note: payment_progress is now included inside the booking object
export interface BookingWithPaymentProgress {
  booking: Booking;
}

export interface InquiryBookingResponse {
  success: boolean;
  message: string;
  data: {
    booking: Booking;
    payment_order?: Record<string, unknown>;
    payment_required: boolean;
    payment_type?: string;
  };
  timestamp: string;
}

// Payment types
export interface PaymentOrderResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    key_id: string;
  };
  timestamp: string;
}

export interface PaymentVerificationRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
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

// Razorpay types
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
    paylater?: boolean;
  };
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open: () => void;
}

// Payment Segment Types
export interface PaymentSegmentRequest {
  amount: number;
  due_date?: string; // ISO date string
  notes?: string;
}

export interface PaymentSegmentInfo {
  id: number;
  segment_number: number;
  amount: number;
  due_date?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paid_at?: string;
  notes: string;
  payment_id?: number;
  is_overdue: boolean;
  days_until_due?: number;
}

export interface PaymentProgress {
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  total_segments: number;
  paid_segments: number;
  remaining_segments: number;
  progress_percentage: number;
  segments: PaymentSegmentInfo[];
}

export interface CreateSegmentPaymentRequest {
  segment_number: number;
  amount: number;
  payment_method: "razorpay" | "wallet";
}

// Global Razorpay declaration
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
