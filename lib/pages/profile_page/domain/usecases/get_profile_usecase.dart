import '../repositories/profile_repository.dart';
import 'package:trees_india/commons/domain/entities/user_profile_entity.dart';

class GetProfileUsecase {
  final ProfileRepository profileRepository;

  GetProfileUsecase({required this.profileRepository});

  Future<UserProfileResponseEntity> call() async {
    return await profileRepository.getUserProfile();
  }
}
