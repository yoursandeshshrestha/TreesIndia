import '../entities/device_registration_entity.dart';
import '../repositories/notification_repository.dart';

class RegisterDeviceUsecase {
  final NotificationRepository notificationRepository;

  RegisterDeviceUsecase({required this.notificationRepository});

  Future<bool> call(DeviceRegistrationEntity deviceRegistration) async {
    return await notificationRepository.registerDevice(deviceRegistration);
  }
}