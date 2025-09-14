import 'package:equatable/equatable.dart';
import 'package:trees_india/commons/domain/entities/device_entity.dart';
import 'package:trees_india/commons/domain/entities/device_status_entity.dart';

class NotificationStateModel extends Equatable {
  final bool isRegistering;
  final bool isLoadingDevices;
  final bool isCheckingStatus;
  final bool isUnregistering;
  final String? fcmToken;
  final List<DeviceEntity> userDevices;
  final DeviceStatusEntity? deviceStatus;
  final String? error;
  final bool isRegistered;

  const NotificationStateModel({
    this.isRegistering = false,
    this.isLoadingDevices = false,
    this.isCheckingStatus = false,
    this.isUnregistering = false,
    this.fcmToken,
    this.userDevices = const [],
    this.deviceStatus,
    this.error,
    this.isRegistered = false,
  });

  NotificationStateModel copyWith({
    bool? isRegistering,
    bool? isLoadingDevices,
    bool? isCheckingStatus,
    bool? isUnregistering,
    String? fcmToken,
    List<DeviceEntity>? userDevices,
    DeviceStatusEntity? deviceStatus,
    String? error,
    bool? isRegistered,
  }) {
    return NotificationStateModel(
      isRegistering: isRegistering ?? this.isRegistering,
      isLoadingDevices: isLoadingDevices ?? this.isLoadingDevices,
      isCheckingStatus: isCheckingStatus ?? this.isCheckingStatus,
      isUnregistering: isUnregistering ?? this.isUnregistering,
      fcmToken: fcmToken ?? this.fcmToken,
      userDevices: userDevices ?? this.userDevices,
      deviceStatus: deviceStatus ?? this.deviceStatus,
      error: error,
      isRegistered: isRegistered ?? this.isRegistered,
    );
  }

  NotificationStateModel clearError() {
    return copyWith(error: '');
  }

  @override
  List<Object?> get props => [
        isRegistering,
        isLoadingDevices,
        isCheckingStatus,
        isUnregistering,
        fcmToken,
        userDevices,
        deviceStatus,
        error,
        isRegistered,
      ];
}