// Transaction types and interfaces

export interface Transaction {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
  payment_reference: string;
  user_id: number;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  method: TransactionMethod;
  related_entity_type: string;
  related_entity_id: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  initiated_at: string;
  completed_at?: string;
  failed_at?: string;
  refunded_at?: string;
  balance_after?: number;
  refund_amount?: number;
  refund_reason?: string;
  refund_method?: string;
  description: string;
  notes: string;
  metadata?: Record<string, any>;
  user: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
    name: string;
    email?: string | null;
    phone: string;
    user_type: string;
    avatar: string;
    gender: string;
    is_active: boolean;
    last_login_at?: string;
    role_application_status: string;
    application_date?: string | null;
    approval_date?: string | null;
    wallet_balance: number;
    subscription_id?: number | null;
    subscription?: any;
    has_active_subscription: boolean;
    subscription_expiry_date?: string | null;
    notification_settings?: any;
  };
}

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled"
  | "abandoned";

export type TransactionType =
  | "booking"
  | "subscription"
  | "wallet_recharge"
  | "wallet_debit"
  | "refund"
  | "segment_pay"
  | "quote";

export type TransactionMethod = "razorpay" | "wallet" | "cash" | "admin";

export interface TransactionFilters {
  search: string;
  status: string;
  type: string;
  method: string;
  user_email: string;
  user_phone: string;
  min_amount: string;
  max_amount: string;
  start_date: string;
  end_date: string;
  sort_by: string;
  sort_order: "asc" | "desc";
  limit?: number;
}

export interface TransactionStats {
  total_transactions: number;
  total_amount: number;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
}

export interface TransactionDashboardData {
  overview: {
    total_transactions: number;
    total_amount: number;
    completed_transactions: number;
    pending_transactions: number;
    failed_transactions: number;
  };
  recent_transactions: Transaction[];
}

export interface TransactionApiResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  filters: TransactionFilters;
}

export interface ExportRequest {
  filters: TransactionFilters;
  format: "csv" | "excel";
  include_user_details: boolean;
  include_metadata: boolean;
}

export interface FilterOptions {
  payment_types: string[];
  payment_statuses: string[];
  payment_methods: string[];
  related_entity_types: string[];
  sort_fields: string[];
  sort_orders: string[];
}

// Status badge colors
export const getStatusColor = (status: TransactionStatus): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    case "abandoned":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Type badge colors
export const getTypeColor = (type: TransactionType): string => {
  switch (type) {
    case "booking":
      return "bg-blue-100 text-blue-800";
    case "subscription":
      return "bg-purple-100 text-purple-800";
    case "wallet_recharge":
      return "bg-green-100 text-green-800";
    case "wallet_debit":
      return "bg-red-100 text-red-800";
    case "segment_pay":
      return "bg-indigo-100 text-indigo-800";
    case "quote":
      return "bg-yellow-100 text-yellow-800";
    case "refund":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Method badge colors
export const getMethodColor = (method: TransactionMethod): string => {
  switch (method) {
    case "razorpay":
      return "bg-blue-100 text-blue-800";
    case "wallet":
      return "bg-green-100 text-green-800";
    case "cash":
      return "bg-gray-100 text-gray-800";
    case "admin":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Format currency
export const formatCurrency = (
  amount: number,
  currency: string = "INR"
): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
