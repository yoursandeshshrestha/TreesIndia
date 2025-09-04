import '../repositories/notification_repository.dart';

class UnregisterDeviceUsecase {
  final NotificationRepository notificationRepository;

  UnregisterDeviceUsecase({required this.notificationRepository});

  Future<bool> call(String fcmToken) async {
    return await notificationRepository.unregisterDevice(fcmToken);
  }
}