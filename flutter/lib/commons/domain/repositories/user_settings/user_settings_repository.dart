import '../../entities/user_settings/notification_settings_entity.dart';
import '../../entities/user_settings/delete_otp_response_entity.dart';

abstract class UserSettingsRepository {
  /// Get user notification settings
  Future<NotificationSettingsEntity> getNotificationSettings();

  /// Update user notification settings
  Future<bool> updateNotificationSettings(NotificationSettingsEntity settings);

  /// Request OTP for account deletion
  Future<DeleteOtpResponseEntity> requestDeleteOtp();

  /// Delete user account with OTP
  Future<bool> deleteAccount(String otp);
}