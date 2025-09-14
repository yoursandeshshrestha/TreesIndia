import '../../domain/entities/device_registration_entity.dart';

class DeviceRegistrationModel {
  final int userId;
  final String token;
  final String platform;
  final String appVersion;
  final String deviceModel;
  final String osVersion;

  DeviceRegistrationModel({
    required this.userId,
    required this.token,
    required this.platform,
    required this.appVersion,
    required this.deviceModel,
    required this.osVersion,
  });

  factory DeviceRegistrationModel.fromEntity(DeviceRegistrationEntity entity) {
    return DeviceRegistrationModel(
      userId: entity.userId,
      token: entity.token,
      platform: entity.platform,
      appVersion: entity.appVersion,
      deviceModel: entity.deviceModel,
      osVersion: entity.osVersion,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'token': token,
      'platform': platform,
      'app_version': appVersion,
      'device_model': deviceModel,
      'os_version': osVersion,
    };
  }

  DeviceRegistrationEntity toEntity() {
    return DeviceRegistrationEntity(
      userId: userId,
      token: token,
      platform: platform,
      appVersion: appVersion,
      deviceModel: deviceModel,
      osVersion: osVersion,
    );
  }
}