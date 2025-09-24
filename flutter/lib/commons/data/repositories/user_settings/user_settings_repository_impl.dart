import '../../../domain/entities/user_settings/notification_settings_entity.dart';
import '../../../domain/entities/user_settings/delete_otp_response_entity.dart';
import '../../../domain/repositories/user_settings/user_settings_repository.dart';
import '../../datasources/user_settings/user_settings_remote_datasource.dart';
import '../../models/user_settings/notification_settings_model.dart';

class UserSettingsRepositoryImpl implements UserSettingsRepository {
  final UserSettingsRemoteDatasource userSettingsRemoteDatasource;

  UserSettingsRepositoryImpl({
    required this.userSettingsRemoteDatasource,
  });

  @override
  Future<NotificationSettingsEntity> getNotificationSettings() async {
    final notificationSettingsModel = await userSettingsRemoteDatasource.getNotificationSettings();
    return notificationSettingsModel.toEntity();
  }

  @override
  Future<bool> updateNotificationSettings(NotificationSettingsEntity settings) async {
    final notificationSettingsModel = NotificationSettingsModel.fromEntity(settings);
    return await userSettingsRemoteDatasource.updateNotificationSettings(notificationSettingsModel);
  }

  @override
  Future<DeleteOtpResponseEntity> requestDeleteOtp() async {
    final deleteOtpResponseModel = await userSettingsRemoteDatasource.requestDeleteOtp();
    return deleteOtpResponseModel.toEntity();
  }

  @override
  Future<bool> deleteAccount(String otp) async {
    return await userSettingsRemoteDatasource.deleteAccount(otp);
  }
}