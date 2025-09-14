import '../../domain/entities/device_registration_entity.dart';
import '../../domain/entities/device_entity.dart';
import '../../domain/entities/device_status_entity.dart';
import '../../domain/repositories/notification_repository.dart';
import '../datasources/notification_remote_datasource.dart';
import '../models/device_registration_model.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final NotificationRemoteDatasource notificationRemoteDatasource;

  NotificationRepositoryImpl({
    required this.notificationRemoteDatasource,
  });

  @override
  Future<bool> registerDevice(DeviceRegistrationEntity deviceRegistration) async {
    final deviceRegistrationModel = DeviceRegistrationModel.fromEntity(deviceRegistration);
    return await notificationRemoteDatasource.registerDevice(deviceRegistrationModel);
  }

  @override
  Future<List<DeviceEntity>> getUserDevices() async {
    final deviceModels = await notificationRemoteDatasource.getUserDevices();
    return deviceModels.map((model) => model.toEntity()).toList();
  }

  @override
  Future<DeviceStatusEntity> checkDeviceStatus(String fcmToken) async {
    final deviceStatusModel = await notificationRemoteDatasource.checkDeviceStatus(fcmToken);
    return deviceStatusModel.toEntity();
  }

  @override
  Future<bool> unregisterDevice(String fcmToken) async {
    return await notificationRemoteDatasource.unregisterDevice(fcmToken);
  }
}