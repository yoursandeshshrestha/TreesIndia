import '../../domain/entities/device_entity.dart';

class DeviceModel {
  final int id;
  final int userId;
  final String token;
  final String platform;
  final String appVersion;
  final String deviceModel;
  final String osVersion;
  final bool isActive;
  final String registeredAt;
  final String? lastUsedAt;

  DeviceModel({
    required this.id,
    required this.userId,
    required this.token,
    required this.platform,
    required this.appVersion,
    required this.deviceModel,
    required this.osVersion,
    required this.isActive,
    required this.registeredAt,
    this.lastUsedAt,
  });

  factory DeviceModel.fromJson(Map<String, dynamic> json) {
    return DeviceModel(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      token: json['token'] ?? '',
      platform: json['platform'] ?? '',
      appVersion: json['app_version'] ?? '',
      deviceModel: json['device_model'] ?? '',
      osVersion: json['os_version'] ?? '',
      isActive: json['is_active'] ?? false,
      registeredAt: json['registered_at'] ?? '',
      lastUsedAt: json['last_used_at'],
    );
  }

  DeviceEntity toEntity() {
    return DeviceEntity(
      id: id,
      userId: userId,
      token: token,
      platform: platform,
      appVersion: appVersion,
      deviceModel: deviceModel,
      osVersion: osVersion,
      isActive: isActive,
      registeredAt: DateTime.tryParse(registeredAt) ?? DateTime.now(),
      lastUsedAt: lastUsedAt != null ? DateTime.tryParse(lastUsedAt!) : null,
    );
  }
}