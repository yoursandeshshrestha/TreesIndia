import '../entities/device_registration_entity.dart';
import '../entities/device_entity.dart';
import '../entities/device_status_entity.dart';

abstract class NotificationRepository {
  /// Register a new device for push notifications
  Future<bool> registerDevice(DeviceRegistrationEntity deviceRegistration);

  /// Get all devices registered for the authenticated user
  Future<List<DeviceEntity>> getUserDevices();

  /// Check the registration status of a specific FCM token
  Future<DeviceStatusEntity> checkDeviceStatus(String fcmToken);

  /// Unregister a device by FCM token
  Future<bool> unregisterDevice(String fcmToken);
}