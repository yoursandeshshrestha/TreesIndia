import 'package:trees_india/commons/domain/entities/user_profile_entity.dart';
import 'package:trees_india/commons/domain/repositories/login_repository.dart';

class GetUserProfileUsecase {
  final LoginRepository loginRepository;

  GetUserProfileUsecase({required this.loginRepository});

  Future<UserProfileResponseEntity> call({String? authToken}) async {
    return await loginRepository.getUserProfile(authToken: authToken);
  }
}
