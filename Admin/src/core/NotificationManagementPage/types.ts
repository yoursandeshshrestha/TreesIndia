export type NotificationType = 
  | "system"
  | "booking"
  | "worker_assignment"
  | "payment"
  | "subscription"
  | "chat"
  | "promotional"
  | "test";

export type NotificationTarget = 
  | "all_users"
  | "specific_users"
  | "user_group"
  | "topic"
  | "device_tokens";

export interface NotificationData {
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
  click_action?: string;
  image_url?: string;
}

export interface SendNotificationRequest {
  target: NotificationTarget;
  target_value?: string | number | string[]; // user IDs, topic name, or device tokens
  notification: NotificationData;
  scheduled_at?: string; // ISO string for scheduled notifications
  priority?: "normal" | "high";
}

export interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  target: NotificationTarget;
  target_value?: string;
  sent_at: string;
  delivered_count: number;
  failed_count: number;
  total_count: number;
  status: "sent" | "delivered" | "failed" | "scheduled";
  data?: Record<string, string>;
}

export interface NotificationStats {
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  delivery_rate: number;
  failure_rate: number;
  by_type: Record<NotificationType, {
    sent: number;
    delivered: number;
    failed: number;
    rate: number;
  }>;
  by_date: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  body: string;
  data_template?: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceToken {
  id: string;
  user_id: number;
  token: string;
  platform: "android" | "ios" | "web";
  app_version: string;
  device_model: string;
  os_version: string;
  is_active: boolean;
  last_used: string;
  created_at: string;
}

export interface UserNotificationSettings {
  user_id: number;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  notification_types: NotificationType[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}
