// Booking Status Types (Workflow Status)
export type BookingStatus =
  | "pending"
  | "quote_provided"
  | "quote_accepted"
  | "confirmed"
  | "scheduled"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rejected"
  | "temporary_hold";

// Booking Type
export type BookingType = "regular" | "inquiry";

// Payment Status
export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "abandoned"
  | "expired"
  | "hold";

// Completion Type
export type CompletionType = "manual" | "time_expired" | "admin_forced";

// Worker Assignment Status
export type AssignmentStatus =
  | "reserved"
  | "assigned"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed";

// Address Interface
export interface BookingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
  landmark?: string;
  house_number?: string;
}

// Worker Assignment Interface
export interface WorkerAssignmentInfo {
  worker_id?: number;
  status?: string;
  worker?: User;
}

export interface WorkerAssignment {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  booking_id: number;
  worker_id: number;
  assigned_by: number;
  status: AssignmentStatus;
  assigned_at: string;
  accepted_at?: string;
  rejected_at?: string;
  started_at?: string;
  completed_at?: string;
  assignment_notes?: string;
  acceptance_notes?: string;
  rejection_notes?: string;
  rejection_reason?: string;
  worker?: User;
  assigned_by_user?: User;
  booking?: Booking;
}

// Payment Interface
export interface Payment {
  id: number;
  related_entity_id: number;
  related_entity_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: PaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  created_at: string;
  updated_at: string;
}

// User Interface (matches API response)
export interface User {
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

  wallet_balance: number;
  subscription_id: number | null;
  subscription: {
    id: number;
    plan_name: string;
    price: number;
    duration_days: number;
    features: string[];
  } | null;
  has_active_subscription: boolean;
  subscription_expiry_date: string | null;
}

// Service Interface (matches API response)
export interface Service {
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
  category: {
    id: number;
    created_at: string;
    updated_at: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    is_active: boolean;
  };
  subcategory: {
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
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Worker Interface (matches API response - same as User)
export type Worker = User;

// Main Booking Interface (matches API response)
export interface Booking {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  booking_reference: string;
  user_id: number;
  service_id: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  booking_type: BookingType;
  completion_type?: CompletionType;
  scheduled_date?: string;
  scheduled_time?: string;
  scheduled_end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  actual_duration_minutes?: number;
  address?: string; // JSON string of BookingAddress
  description: string;
  contact_person: string;
  contact_phone: string;
  special_instructions: string;
  hold_expires_at?: string;

  // Quote Management (for inquiry bookings)
  quote_amount?: number;
  quote_notes?: string;
  quote_provided_by?: number;
  quote_provided_at?: string;
  quote_accepted_at?: string;
  quote_expires_at?: string;

  // Relationships
  user: User;
  service: Service;
  worker_assignment?: WorkerAssignment;
  payment?: Payment;
  payment_segments?: PaymentSegmentInfo[];
  payment_progress?: PaymentProgress;
}

// Booking Filter State
export interface BookingFilterState {
  search: string;
  status: string;
  booking_type: string;
  payment_status: string;
  date_from: string;
  date_to: string;
  service_id: string;
  worker_id: string;
  sort_by: string;
  sort_order: string;
}

// API Response Types
export interface BookingsApiResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface BookingApiResponse {
  success: boolean;
  message: string;
  data: Booking;
}

// Booking Stats API Response Types
export interface BookingStatsApiResponse {
  stats: {
    overview: {
      total_bookings: number;
      total_revenue: number;
      active_workers: number;
    };
    status_breakdown: {
      pending: number;
      payment_pending: number;
      temporary_hold: number;
      confirmed: number;
      assigned: number;
      in_progress: number;
      completed: number;
      time_expired: number;
      cancelled: number;
      rejected: number;
    };
    revenue_analytics: {
      total: number;
      monthly: number;
      weekly: number;
      daily: number;
      average_per_booking: number;
      last_7_days: Array<{
        date: string;
        revenue: number;
        bookings: number;
      }>;
      last_12_months: Array<{
        month: string;
        revenue: number;
        bookings: number;
      }>;
      by_status: Record<
        string,
        {
          revenue: number;
          count: number;
        }
      >;
    };
    performance_metrics: {
      average_completion_time_minutes: number;
      average_response_time_minutes: number;
      total_workers: number;
      active_workers: number;
      worker_utilization_rate: number;
    };
    trends: {
      bookings_today: number;
      bookings_this_week: number;
      bookings_this_month: number;
    };
    alerts: {
      expiring_holds: number;
      payment_pending: number;
      unassigned_bookings: number;
      overdue_bookings: number;
    };
  };
}

// Dashboard API Response Types
export interface BookingDashboardApiResponse {
  stats: BookingStatsApiResponse["stats"];
  recent_bookings: OptimizedBookingResponse[];
  urgent_alerts: OptimizedBookingResponse[];
}

// Request Types
export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  reason?: string;
}

export interface AssignWorkerRequest {
  worker_id: number;
  notes?: string;
}

export interface CreateBookingRequest {
  user_id: number;
  service_id: number;
  booking_type: BookingType;
  scheduled_time: string;
  address: BookingAddress;
  description: string;
  contact_person: string;
  contact_phone: string;
  special_instructions?: string;
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

// Quote Management Request Types
export interface ProvideQuoteRequest {
  notes?: string;
  segments: PaymentSegmentRequest[];
}

export interface UpdateQuoteRequest {
  notes?: string;
  segments: PaymentSegmentRequest[];
}

export interface AcceptQuoteRequest {
  notes?: string;
}

export interface RejectQuoteRequest {
  reason: string;
}

export interface ScheduleAfterQuoteRequest {
  scheduled_date: string; // YYYY-MM-DD format
  scheduled_time: string; // HH:MM format
  notes?: string;
}

// Quote Information Type
export interface QuoteInfo {
  amount: number;
  notes: string;
  provided_by?: number;
  provided_at?: string;
  accepted_at?: string;
  expires_at?: string;
  is_expired: boolean;
  days_until_expiry?: number;
}

// Booking Status Badge Colors
export const getBookingStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "quote_provided":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "quote_accepted":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "scheduled":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "assigned":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "in_progress":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "temporary_hold":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Payment Status Badge Colors
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-blue-100 text-blue-800";
    case "abandoned":
      return "bg-gray-100 text-gray-800";
    case "expired":
      return "bg-red-100 text-red-800";
    case "hold":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Payment Segment Status Badge Colors
export const getPaymentSegmentStatusColor = (
  status: string,
  isOverdue: boolean = false
): string => {
  if (isOverdue && status === "pending") {
    return "bg-red-100 text-red-800";
  }

  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Assignment Status Badge Colors
export const getAssignmentStatusColor = (status: AssignmentStatus): string => {
  switch (status) {
    case "reserved":
      return "bg-yellow-100 text-yellow-800";
    case "assigned":
      return "bg-blue-100 text-blue-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "in_progress":
      return "bg-indigo-100 text-indigo-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Optimized Response Types
export interface OptimizedBookingResponse {
  ID: number;
  booking_reference: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  booking_type: BookingType;
  scheduled_date: string | null;
  scheduled_time: string | null;
  scheduled_end_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  actual_duration_minutes: number | null;
  hold_expires_at: string | null;
  created_at: string;
  updated_at: string;

  service: OptimizedServiceInfo;
  user: OptimizedUserInfo;
  address: BookingAddress | null;
  contact: OptimizedContactInfo;
  payment: OptimizedPaymentInfo | null;
  payment_progress?: PaymentProgress;
  worker_assignment: OptimizedWorkerAssignment | null;
}

export interface OptimizedServiceInfo {
  id: number;
  name: string;
  price_type: string;
  price: number | null;
  duration: string | null;
}

export interface OptimizedUserInfo {
  id: number;
  name: string;
  phone: string;
  user_type: string;
}

export interface OptimizedContactInfo {
  person: string;
  phone: string;
  description: string;
  special_instructions: string;
}

export interface OptimizedPaymentInfo {
  status: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string | null;
}

export interface OptimizedWorkerAssignment {
  worker_id: number | null;
  status: string | null;
  rejection_reason?: string | null;
  worker?: OptimizedUserInfo;
}

// Detailed Response Types
export interface DetailedBookingResponse {
  id: number;
  booking_reference: string;
  status: BookingStatus;
  booking_type: BookingType;
  completion_type: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  scheduled_end_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  actual_duration_minutes: number | null;
  hold_expires_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  service: DetailedServiceInfo;
  user: DetailedUserInfo;
  address: BookingAddress | null;
  contact: OptimizedContactInfo;
  payment: DetailedPaymentInfo | null;
  worker_assignment: DetailedWorkerAssignment | null;
  buffer_requests: unknown[];
  reviews: Review[];
  chat_messages: ChatMessageInfo[];
  activity_log: ActivityLog[];
  disputes: Dispute[];
  related_bookings: RelatedBooking[];
  statistics: BookingStatistics;
}

export interface DetailedServiceInfo {
  id: number;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price_type: string;
  price: number | null;
  duration: string | null;
  category: DetailedCategory | null;
  subcategory: DetailedSubcategory | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DetailedCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
}

export interface DetailedSubcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
}

export interface DetailedUserInfo {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  user_type: string;
  avatar: string;
  gender: string;
  is_active: boolean;
  last_login_at: string | null;

  wallet_balance: number;
  has_active_subscription: boolean;
  subscription_expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DetailedPaymentInfo {
  id: number;
  status: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DetailedWorkerAssignment {
  id: number;
  worker_id: number | null;
  assigned_by: number | null;
  status: string | null;
  assigned_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  assignment_notes: string | null;
  acceptance_notes: string | null;
  rejection_notes: string | null;
  rejection_reason: string | null;
  worker: DetailedUserInfo | null;
  assigned_by_user: DetailedUserInfo | null;
}

export interface RelatedBooking {
  id: number;
  booking_reference: string;
  status: string;
  service_name: string;
  created_at: string;
}

export interface BookingStatistics {
  total_messages: number;
  total_reviews: number;
  average_rating: number;
  completion_time: number | null;
  worker_rating: number | null;
}

export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  performed_by: string;
  performed_by_id: number | null;
  created_at: string;
}

export interface ChatMessageInfo {
  id: number;
  sender_type: string;
  sender_id: number;
  message: string;
  created_at: string;
}

export interface Review {
  id: number;
  rating: number;
  review: string;
  categories: Record<string, number>;
  created_at: string;
}

export interface Dispute {
  id: number;
  reason: string;
  status: string;
  resolution: string | null;
  created_at: string;
}
