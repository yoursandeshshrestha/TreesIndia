import 'package:equatable/equatable.dart';

class DeviceEntity extends Equatable {
  final int id;
  final int userId;
  final String token;
  final String platform;
  final String appVersion;
  final String deviceModel;
  final String osVersion;
  final bool isActive;
  final DateTime registeredAt;
  final DateTime? lastUsedAt;

  const DeviceEntity({
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

  @override
  List<Object?> get props => [
        id,
        userId,
        token,
        platform,
        appVersion,
        deviceModel,
        osVersion,
        isActive,
        registeredAt,
        lastUsedAt,
      ];
}