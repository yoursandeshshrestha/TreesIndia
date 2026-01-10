import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { logger } from '../utils/logger';
import type { NotificationHandler, NotificationResponseHandler, PushNotification } from '../types/notification';

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  constructor() {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get the Expo push token for this device
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        logger.warn('Notifications only work on physical devices');
        return null;
      }

      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get the Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      this.expoPushToken = tokenData.data;
      logger.info('Expo push token obtained:', this.expoPushToken);

      return this.expoPushToken;
    } catch (error) {
      logger.error('Error getting Expo push token:', error);
      return null;
    }
  }

  /**
   * Get the device push token (FCM for Android, APNs for iOS)
   */
  async getDevicePushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        logger.warn('Push tokens only work on physical devices');
        return null;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const tokenData = await Notifications.getDevicePushTokenAsync();

      if (Platform.OS === 'android') {
        // For Android, this returns the FCM token
        logger.info('FCM token obtained:', tokenData.data);
        return tokenData.data as string;
      } else if (Platform.OS === 'ios') {
        // For iOS, this returns the APNs token
        logger.info('APNs token obtained:', tokenData.data);
        return tokenData.data as string;
      }

      return null;
    } catch (error) {
      logger.error('Error getting device push token:', error);
      return null;
    }
  }

  /**
   * Register listeners for notifications
   */
  registerNotificationListeners(
    onNotificationReceived?: NotificationHandler,
    onNotificationResponse?: NotificationResponseHandler
  ): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      logger.info('Notification received:', notification);

      if (onNotificationReceived) {
        const pushNotification: PushNotification = {
          title: notification.request.content.title || '',
          body: notification.request.content.body || '',
          data: notification.request.content.data as Record<string, string | undefined>,
        };
        onNotificationReceived(pushNotification);
      }
    });

    // Listener for when a user taps on or interacts with a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      logger.info('Notification response received:', response);

      if (onNotificationResponse) {
        const notificationResponse = {
          notification: {
            title: response.notification.request.content.title || '',
            body: response.notification.request.content.body || '',
            data: response.notification.request.content.data as Record<string, string | undefined>,
          },
          actionIdentifier: response.actionIdentifier,
          userText: response.userText,
        };
        onNotificationResponse(notificationResponse);
      }
    });
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, string>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: trigger || null,
      });

      return notificationId;
    } catch (error) {
      logger.error('Error scheduling local notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      logger.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      logger.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      logger.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      logger.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      logger.error('Error dismissing notifications:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
