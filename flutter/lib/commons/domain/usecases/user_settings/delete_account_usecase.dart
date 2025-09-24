import '../../repositories/user_settings/user_settings_repository.dart';

class DeleteAccountUsecase {
  final UserSettingsRepository userSettingsRepository;

  DeleteAccountUsecase({
    required this.userSettingsRepository,
  });

  Future<bool> call(String otp) async {
    return await userSettingsRepository.deleteAccount(otp);
  }
}