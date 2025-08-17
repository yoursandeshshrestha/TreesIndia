import 'package:trees_india/commons/domain/entities/user_profile_entity.dart';
import 'package:trees_india/commons/domain/repositories/auth_repository.dart';

class GetUserProfileUsecase {
  final AuthRepository authRepository;

  GetUserProfileUsecase({required this.authRepository});

  Future<UserProfileResponseEntity> call({String? authToken}) async {
    return await authRepository.getUserProfile(authToken: authToken);
  }
}
