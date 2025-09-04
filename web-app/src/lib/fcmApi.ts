import { authenticatedFetch } from "./auth-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface DeviceRegistrationData {
  user_id: number;
  token: string;
  platform: "web";
  app_version: string;
  device_model: string;
  os_version: string;
}

export interface NotificationData {
  user_id: number;
  type:
    | "booking"
    | "worker_assignment"
    | "payment"
    | "subscription"
    | "chat"
    | "promotional"
    | "system";
  title: string;
  body: string;
  data?: Record<string, string>;
  click_action?: string;
}

export interface FCMTokenResponse {
  user_id: number;
  token: string;
  platform: "web";
  app_version: string;
  device_model: string;
  os_version: string;
}

export interface DeviceRegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    device_id: string;
    token: string;
    platform: string;
    created_at: string;
  };
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: {
    notification_id: string;
    sent_at: string;
  };
}

export interface UserDevicesResponse {
  success: boolean;
  message: string;
  data: Array<{
    device_id: string;
    token: string;
    platform: string;
    app_version: string;
    device_model: string;
    os_version: string;
    created_at: string;
    last_used: string;
  }>;
}

class FCMApi {
  private static instance: FCMApi;

  private constructor() {}

  public static getInstance(): FCMApi {
    if (!FCMApi.instance) {
      FCMApi.instance = new FCMApi();
    }
    return FCMApi.instance;
  }

  // Register device token with backend
  async registerDevice(
    deviceData: DeviceRegistrationData
  ): Promise<DeviceRegistrationResponse> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/notifications/register-device`,
      {
        method: "POST",
        body: JSON.stringify(deviceData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to register device");
    }

    const responseData = await response.json();
    return responseData;
  }

  // Unregister device token
  async unregisterDevice(token: string): Promise<DeviceRegistrationResponse> {
    console.log(
      "🔔 FCM API: Unregistering device with token:",
      token.substring(0, 20) + "..."
    );

    const response = await authenticatedFetch(
      `${API_BASE_URL}/notifications/unregister-device?token=${token}`,
      {
        method: "DELETE",
      }
    );

    console.log(
      "🔔 FCM API: Unregister device response status:",
      response.status
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ FCM API: Unregister device failed:", errorData);
      throw new Error(errorData.message || "Failed to unregister device");
    }

    const responseData = await response.json();
    return responseData;
  }

  // Send notification to user
  async sendNotification(
    notificationData: NotificationData
  ): Promise<NotificationResponse> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/notifications/send`,
      {
        method: "POST",
        body: JSON.stringify(notificationData),
      }
    );

    console.log(
      "🔔 FCM API: Send notification response status:",
      response.status
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ FCM API: Send notification failed:", errorData);
      throw new Error(errorData.message || "Failed to send notification");
    }

    const responseData = await response.json();
    return responseData;
  }

  // Get user's registered devices
  async getUserDevices(): Promise<UserDevicesResponse> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/notifications/devices`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get user devices");
    }

    return response.json();
  }

  // Check device registration status
  async checkDeviceStatus(
    token: string
  ): Promise<{ isRegistered: boolean; deviceId?: string }> {
    try {
      const devices = await this.getUserDevices();
      const device = devices.data.find((d) => d.token === token);
      return {
        isRegistered: !!device,
        deviceId: device?.device_id,
      };
    } catch (error) {
      return { isRegistered: false };
    }
  }
}

export const fcmApi = FCMApi.getInstance();
