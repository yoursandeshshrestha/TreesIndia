import '../../entities/user_settings/delete_otp_response_entity.dart';
import '../../repositories/user_settings/user_settings_repository.dart';

class RequestDeleteOtpUsecase {
  final UserSettingsRepository userSettingsRepository;

  RequestDeleteOtpUsecase({
    required this.userSettingsRepository,
  });

  Future<DeleteOtpResponseEntity> call() async {
    return await userSettingsRepository.requestDeleteOtp();
  }
}