import '../repositories/profile_repository.dart';
import '../entities/profile_update_entity.dart';

class UpdateProfileUsecase {
  final ProfileRepository profileRepository;

  UpdateProfileUsecase({required this.profileRepository});

  Future<ProfileUpdateResponseEntity> call(ProfileUpdateRequestEntity request) async {
    return await profileRepository.updateProfile(request);
  }
}
