import 'package:equatable/equatable.dart';

class DeviceRegistrationEntity extends Equatable {
  final int userId;
  final String token;
  final String platform;
  final String appVersion;
  final String deviceModel;
  final String osVersion;

  const DeviceRegistrationEntity({
    required this.userId,
    required this.token,
    required this.platform,
    required this.appVersion,
    required this.deviceModel,
    required this.osVersion,
  });

  @override
  List<Object?> get props => [
        userId,
        token,
        platform,
        appVersion,
        deviceModel,
        osVersion,
      ];
}