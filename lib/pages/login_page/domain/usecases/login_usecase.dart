import 'package:trees_india/commons/domain/repositories/login_repository.dart';
import 'package:trees_india/pages/login_page/domain/entities/login_request_entity.dart';
import 'package:trees_india/pages/login_page/domain/entities/login_response_entity.dart';

class LoginUsecase {
  final LoginRepository loginRepository;

  LoginUsecase({required this.loginRepository});

  Future<LoginResponseEntity> call(LoginRequestEntity request) async {
    return await loginRepository.login(request);
  }
}
