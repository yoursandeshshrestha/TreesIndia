import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/domain/entities/user_settings/notification_settings_entity.dart';
import 'package:trees_india/commons/domain/usecases/user_settings/get_notification_settings_usecase.dart';
import 'package:trees_india/commons/domain/usecases/user_settings/update_notification_settings_usecase.dart';
import 'package:trees_india/commons/domain/usecases/user_settings/request_delete_otp_usecase.dart';
import 'package:trees_india/commons/domain/usecases/user_settings/delete_account_usecase.dart';
import 'package:logger/logger.dart';

import 'user_settings_state.dart';

final Logger _logger = Logger();

class UserSettingsNotifier extends StateNotifier<UserSettingsStateModel> {
  final GetNotificationSettingsUsecase getNotificationSettingsUsecase;
  final UpdateNotificationSettingsUsecase updateNotificationSettingsUsecase;
  final RequestDeleteOtpUsecase requestDeleteOtpUsecase;
  final DeleteAccountUsecase deleteAccountUsecase;

  UserSettingsNotifier({
    required this.getNotificationSettingsUsecase,
    required this.updateNotificationSettingsUsecase,
    required this.requestDeleteOtpUsecase,
    required this.deleteAccountUsecase,
  }) : super(const UserSettingsStateModel());

  Future<void> loadNotificationSettings() async {
    if (state.isLoadingNotificationSettings) return;

    try {
      state = state.copyWith(isLoadingNotificationSettings: true, error: '');

      final notificationSettings = await getNotificationSettingsUsecase.call();

      state = state.copyWith(
        isLoadingNotificationSettings: false,
        notificationSettings: notificationSettings,
      );

      _logger.d('Notification settings loaded successfully');
    } catch (e) {
      state = state.copyWith(
        isLoadingNotificationSettings: false,
        error: 'Failed to load notification settings: ${e.toString()}',
      );
      _logger.e('Error loading notification settings: $e');
    }
  }

  Future<void> updateNotificationSettings(NotificationSettingsEntity settings) async {
    if (state.isUpdatingNotificationSettings) return;

    try {
      state = state.copyWith(isUpdatingNotificationSettings: true, error: '');

      final success = await updateNotificationSettingsUsecase.call(settings);

      if (success) {
        state = state.copyWith(
          isUpdatingNotificationSettings: false,
          notificationSettings: settings,
        );
        _logger.d('Notification settings updated successfully');
      } else {
        state = state.copyWith(
          isUpdatingNotificationSettings: false,
          error: 'Failed to update notification settings',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isUpdatingNotificationSettings: false,
        error: 'Failed to update notification settings: ${e.toString()}',
      );
      _logger.e('Error updating notification settings: $e');
    }
  }

  Future<void> toggleNotificationSetting(String settingKey) async {
    final currentSettings = state.notificationSettings;
    if (currentSettings == null) return;

    NotificationSettingsEntity updatedSettings;

    switch (settingKey) {
      case 'booking_reminders':
        updatedSettings = currentSettings.copyWith(
          bookingReminders: !currentSettings.bookingReminders,
        );
        break;
      case 'email_notifications':
        updatedSettings = currentSettings.copyWith(
          emailNotifications: !currentSettings.emailNotifications,
        );
        break;
      case 'marketing_emails':
        updatedSettings = currentSettings.copyWith(
          marketingEmails: !currentSettings.marketingEmails,
        );
        break;
      case 'push_notifications':
        updatedSettings = currentSettings.copyWith(
          pushNotifications: !currentSettings.pushNotifications,
        );
        break;
      case 'service_updates':
        updatedSettings = currentSettings.copyWith(
          serviceUpdates: !currentSettings.serviceUpdates,
        );
        break;
      case 'sms_notifications':
        updatedSettings = currentSettings.copyWith(
          smsNotifications: !currentSettings.smsNotifications,
        );
        break;
      default:
        return;
    }

    await updateNotificationSettings(updatedSettings);
  }

  Future<void> requestDeleteOtp() async {
    if (state.isRequestingDeleteOtp) return;

    try {
      state = state.copyWith(isRequestingDeleteOtp: true, error: '');

      final deleteOtpResponse = await requestDeleteOtpUsecase.call();

      state = state.copyWith(
        isRequestingDeleteOtp: false,
        deleteOtpResponse: deleteOtpResponse,
      );

      _logger.d('Delete OTP requested successfully');
    } catch (e) {
      state = state.copyWith(
        isRequestingDeleteOtp: false,
        error: 'Failed to request delete OTP: ${e.toString()}',
      );
      _logger.e('Error requesting delete OTP: $e');
    }
  }

  Future<bool> deleteAccount(String otp) async {
    if (state.isDeletingAccount) return false;

    try {
      state = state.copyWith(isDeletingAccount: true, error: '');

      final success = await deleteAccountUsecase.call(otp);

      if (success) {
        state = state.copyWith(isDeletingAccount: false);
        _logger.d('Account deleted successfully');
        return true;
      } else {
        state = state.copyWith(
          isDeletingAccount: false,
          error: 'Failed to delete account',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isDeletingAccount: false,
        error: 'Failed to delete account: ${e.toString()}',
      );
      _logger.e('Error deleting account: $e');
      return false;
    }
  }

  void clearError() {
    state = state.clearError();
  }

  void clearDeleteOtpResponse() {
    state = state.copyWith(deleteOtpResponse: null);
  }
}