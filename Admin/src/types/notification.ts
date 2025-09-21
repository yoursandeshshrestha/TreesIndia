export interface InAppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  related_entity_type?: string;
  related_entity_id?: number;
  data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  success: boolean;
  data: InAppNotification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  unread_count: number;
}

export interface NotificationStats {
  total_count: number;
  unread_count: number;
  read_count: number;
  type_stats: Array<{
    type: string;
    count: number;
  }>;
}

export interface NotificationStatsResponse {
  success: boolean;
  data: NotificationStats;
}

// WebSocket message types
export interface NotificationWebSocketMessage {
  user_id: number;
  user_type: string;
  event: string;
  data: Record<string, unknown>;
}

export interface NotificationWebSocketClient {
  send: (message: Record<string, unknown>) => void;
  close: () => void;
}

// Notification types enum
export enum NotificationType {
  USER_REGISTERED = "user_registered",
  WORKER_APPLICATION = "worker_application",
  BROKER_APPLICATION = "broker_application",
  BOOKING_CREATED = "booking_created",
  SERVICE_ADDED = "service_added",
  SERVICE_UPDATED = "service_updated",
  SERVICE_DEACTIVATED = "service_deactivated",
  PROPERTY_CREATED = "property_created",
  PROJECT_CREATED = "project_created",
  VENDOR_PROFILE_CREATED = "vendor_profile_created",
  PAYMENT_RECEIVED = "payment_received",
  SUBSCRIPTION_PURCHASE = "subscription_purchase",
  WALLET_TRANSACTION = "wallet_transaction",
  BOOKING_CANCELLED = "booking_cancelled",
  WORKER_ASSIGNED = "worker_assigned",
  WORKER_STARTED = "worker_started",
  WORKER_COMPLETED = "worker_completed",
  BOOKING_CONFIRMED = "booking_confirmed",
  QUOTE_PROVIDED = "quote_provided",
  PAYMENT_CONFIRMATION = "payment_confirmation",
  SUBSCRIPTION_EXPIRY_WARNING = "subscription_expiry_warning",
  SUBSCRIPTION_EXPIRED = "subscription_expired",
  CONVERSATION_STARTED = "conversation_started",
  APPLICATION_ACCEPTED = "application_accepted",
  APPLICATION_REJECTED = "application_rejected",
  NEW_ASSIGNMENT = "new_assignment",
  ASSIGNMENT_ACCEPTED = "assignment_accepted",
  ASSIGNMENT_REJECTED = "assignment_rejected",
  WORK_STARTED = "work_started",
  WORK_COMPLETED = "work_completed",
  WORKER_PAYMENT_RECEIVED = "worker_payment_received",
  BROKER_APPLICATION_STATUS = "broker_application_status",
  PROPERTY_APPROVAL = "property_approval",
  PROPERTY_EXPIRY_WARNING = "property_expiry_warning",
  NEW_SERVICE_AVAILABLE = "new_service_available",
  SYSTEM_MAINTENANCE = "system_maintenance",
  FEATURE_UPDATE = "feature_update",
  OTP_REQUESTED = "otp_requested",
  OTP_VERIFIED = "otp_verified",
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILED = "login_failed",
}

// Helper function to get notification icon based on type
export const getNotificationIcon = (type: string): string => {
  switch (type) {
    case NotificationType.USER_REGISTERED:
    case NotificationType.WORKER_APPLICATION:
    case NotificationType.BROKER_APPLICATION:
      return "👤";
    case NotificationType.BOOKING_CREATED:
    case NotificationType.BOOKING_CONFIRMED:
    case NotificationType.BOOKING_CANCELLED:
      return "📅";
    case NotificationType.WORKER_ASSIGNED:
    case NotificationType.WORKER_STARTED:
    case NotificationType.WORKER_COMPLETED:
    case NotificationType.NEW_ASSIGNMENT:
      return "👷";
    case NotificationType.PAYMENT_RECEIVED:
    case NotificationType.PAYMENT_CONFIRMATION:
    case NotificationType.WALLET_TRANSACTION:
      return "💰";
    case NotificationType.SERVICE_ADDED:
    case NotificationType.SERVICE_UPDATED:
    case NotificationType.SERVICE_DEACTIVATED:
      return "🔧";
    case NotificationType.PROPERTY_CREATED:
    case NotificationType.PROJECT_CREATED:
      return "🏠";
    case NotificationType.CONVERSATION_STARTED:
      return "💬";
    case NotificationType.APPLICATION_ACCEPTED:
    case NotificationType.APPLICATION_REJECTED:
      return "✅";
    case NotificationType.OTP_REQUESTED:
    case NotificationType.OTP_VERIFIED:
      return "🔐";
    case NotificationType.LOGIN_SUCCESS:
    case NotificationType.LOGIN_FAILED:
      return "🔑";
    case NotificationType.SYSTEM_MAINTENANCE:
    case NotificationType.FEATURE_UPDATE:
      return "⚙️";
    default:
      return "🔔";
  }
};

// Helper function to get notification color based on type
export const getNotificationColor = (type: string): string => {
  switch (type) {
    case NotificationType.USER_REGISTERED:
    case NotificationType.BOOKING_CREATED:
    case NotificationType.PAYMENT_RECEIVED:
      return "text-green-600";
    case NotificationType.WORKER_APPLICATION:
    case NotificationType.BROKER_APPLICATION:
    case NotificationType.APPLICATION_ACCEPTED:
      return "text-blue-600";
    case NotificationType.APPLICATION_REJECTED:
    case NotificationType.LOGIN_FAILED:
      return "text-red-600";
    case NotificationType.SYSTEM_MAINTENANCE:
    case NotificationType.FEATURE_UPDATE:
      return "text-purple-600";
    default:
      return "text-gray-600";
  }
};
