export interface InAppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  related_entity_type?: string;
  related_entity_id?: number;
  data?: Record<string, string | number | boolean>;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: InAppNotification[];
  pagination: {
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
  message: string;
  unread_count: number;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message: string;
}

// Notification types for different events
export const NOTIFICATION_TYPES = {
  USER_REGISTERED: "user_registered",
  BOOKING_CREATED: "booking_created",
  WORKER_ASSIGNED: "worker_assigned",
  WORKER_STARTED: "worker_started",
  WORKER_COMPLETED: "worker_completed",
  PAYMENT_RECEIVED: "payment_received",
  PAYMENT_CONFIRMATION: "payment_confirmation",
  SUBSCRIPTION_PURCHASE: "subscription_purchase",
  WORKER_APPLICATION: "worker_application",
  BROKER_APPLICATION: "broker_application",
  APPLICATION_ACCEPTED: "application_accepted",
  APPLICATION_REJECTED: "application_rejected",
  NEW_ASSIGNMENT: "new_assignment",
  PROPERTY_CREATED: "property_created",
  PROJECT_CREATED: "project_created",
  SERVICE_ADDED: "service_added",
  QUOTE_PROVIDED: "quote_provided",
  CONVERSATION_STARTED: "conversation_started",
  OTP_REQUESTED: "otp_requested",
  OTP_VERIFIED: "otp_verified",
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  VENDOR_PROFILE_CREATED: "vendor_profile_created",
  WORKER_ASSIGNED_TO_WORK: "worker_assigned_to_work",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface NotificationWebSocketMessage {
  user_id: number;
  user_type: string;
  event: string;
  data: {
    notification?: InAppNotification;
    notification_id?: number;
    unread_count?: number;
    [key: string]: string | number | boolean | InAppNotification | undefined;
  };
}

export interface NotificationWebSocketClient {
  send: (message: Record<string, string | number | boolean>) => void;
  close: () => void;
}
