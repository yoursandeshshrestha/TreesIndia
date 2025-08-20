import '../repositories/profile_repository.dart';
import '../entities/avatar_upload_entity.dart';

class UploadAvatarUsecase {
  final ProfileRepository profileRepository;

  UploadAvatarUsecase({required this.profileRepository});

  Future<AvatarUploadResponseEntity> call(AvatarUploadRequestEntity request) async {
    return await profileRepository.uploadAvatar(request);
  }
}
