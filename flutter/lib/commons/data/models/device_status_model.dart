import '../../domain/entities/device_status_entity.dart';

class DeviceStatusModel {
  final bool isRegistered;
  final String? token;
  final String? registeredAt;
  final String? lastUsedAt;

  DeviceStatusModel({
    required this.isRegistered,
    this.token,
    this.registeredAt,
    this.lastUsedAt,
  });

  factory DeviceStatusModel.fromJson(Map<String, dynamic> json) {
    return DeviceStatusModel(
      isRegistered: json['is_registered'] ?? false,
      token: json['token'],
      registeredAt: json['registered_at'],
      lastUsedAt: json['last_used_at'],
    );
  }

  DeviceStatusEntity toEntity() {
    return DeviceStatusEntity(
      isRegistered: isRegistered,
      token: token,
      registeredAt: registeredAt != null ? DateTime.tryParse(registeredAt!) : null,
      lastUsedAt: lastUsedAt != null ? DateTime.tryParse(lastUsedAt!) : null,
    );
  }
}