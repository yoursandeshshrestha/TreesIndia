import '../entities/device_entity.dart';
import '../repositories/notification_repository.dart';

class GetUserDevicesUsecase {
  final NotificationRepository notificationRepository;

  GetUserDevicesUsecase({required this.notificationRepository});

  Future<List<DeviceEntity>> call() async {
    return await notificationRepository.getUserDevices();
  }
}