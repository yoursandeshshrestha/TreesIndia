import 'package:equatable/equatable.dart';
import 'package:trees_india/commons/domain/entities/user_settings/notification_settings_entity.dart';
import 'package:trees_india/commons/domain/entities/user_settings/delete_otp_response_entity.dart';

class UserSettingsStateModel extends Equatable {
  final bool isLoadingNotificationSettings;
  final bool isUpdatingNotificationSettings;
  final bool isRequestingDeleteOtp;
  final bool isDeletingAccount;
  final NotificationSettingsEntity? notificationSettings;
  final DeleteOtpResponseEntity? deleteOtpResponse;
  final String? error;

  const UserSettingsStateModel({
    this.isLoadingNotificationSettings = false,
    this.isUpdatingNotificationSettings = false,
    this.isRequestingDeleteOtp = false,
    this.isDeletingAccount = false,
    this.notificationSettings,
    this.deleteOtpResponse,
    this.error,
  });

  UserSettingsStateModel copyWith({
    bool? isLoadingNotificationSettings,
    bool? isUpdatingNotificationSettings,
    bool? isRequestingDeleteOtp,
    bool? isDeletingAccount,
    NotificationSettingsEntity? notificationSettings,
    DeleteOtpResponseEntity? deleteOtpResponse,
    String? error,
  }) {
    return UserSettingsStateModel(
      isLoadingNotificationSettings: isLoadingNotificationSettings ?? this.isLoadingNotificationSettings,
      isUpdatingNotificationSettings: isUpdatingNotificationSettings ?? this.isUpdatingNotificationSettings,
      isRequestingDeleteOtp: isRequestingDeleteOtp ?? this.isRequestingDeleteOtp,
      isDeletingAccount: isDeletingAccount ?? this.isDeletingAccount,
      notificationSettings: notificationSettings ?? this.notificationSettings,
      deleteOtpResponse: deleteOtpResponse ?? this.deleteOtpResponse,
      error: error,
    );
  }

  UserSettingsStateModel clearError() {
    return copyWith(error: '');
  }

  @override
  List<Object?> get props => [
        isLoadingNotificationSettings,
        isUpdatingNotificationSettings,
        isRequestingDeleteOtp,
        isDeletingAccount,
        notificationSettings,
        deleteOtpResponse,
        error,
      ];
}