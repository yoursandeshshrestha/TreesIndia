import '../entities/device_status_entity.dart';
import '../repositories/notification_repository.dart';

class CheckDeviceStatusUsecase {
  final NotificationRepository notificationRepository;

  CheckDeviceStatusUsecase({required this.notificationRepository});

  Future<DeviceStatusEntity> call(String fcmToken) async {
    return await notificationRepository.checkDeviceStatus(fcmToken);
  }
}