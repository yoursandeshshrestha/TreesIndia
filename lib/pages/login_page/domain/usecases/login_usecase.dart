import 'package:trees_india/commons/domain/repositories/auth_repository.dart';
import 'package:trees_india/pages/login_page/domain/entities/login_request_entity.dart';
import 'package:trees_india/pages/login_page/domain/entities/login_response_entity.dart';

class LoginUsecase {
  final AuthRepository authRepository;

  LoginUsecase({required this.authRepository});

  Future<LoginResponseEntity> call(LoginRequestEntity request) async {
    return await authRepository.login(request);
  }
}
