import '../../entities/user_settings/notification_settings_entity.dart';
import '../../repositories/user_settings/user_settings_repository.dart';

class GetNotificationSettingsUsecase {
  final UserSettingsRepository userSettingsRepository;

  GetNotificationSettingsUsecase({
    required this.userSettingsRepository,
  });

  Future<NotificationSettingsEntity> call() async {
    return await userSettingsRepository.getNotificationSettings();
  }
}