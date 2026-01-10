export interface NotificationData {
  type?: string;
  conversationId?: string;
  bookingId?: string;
  orderId?: string;
  messageId?: string;
  [key: string]: string | undefined;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: NotificationData;
}

export interface NotificationResponse {
  notification: PushNotification;
  actionIdentifier: string;
  userText?: string;
}

export type NotificationHandler = (notification: PushNotification) => void;
export type NotificationResponseHandler = (response: NotificationResponse) => void;
