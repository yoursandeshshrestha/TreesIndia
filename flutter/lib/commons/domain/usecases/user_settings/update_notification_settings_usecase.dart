import '../../entities/user_settings/notification_settings_entity.dart';
import '../../repositories/user_settings/user_settings_repository.dart';

class UpdateNotificationSettingsUsecase {
  final UserSettingsRepository userSettingsRepository;

  UpdateNotificationSettingsUsecase({
    required this.userSettingsRepository,
  });

  Future<bool> call(NotificationSettingsEntity settings) async {
    return await userSettingsRepository.updateNotificationSettings(settings);
  }
}