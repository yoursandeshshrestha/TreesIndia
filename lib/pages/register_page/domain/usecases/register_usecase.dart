import 'package:trees_india/commons/domain/repositories/auth_repository.dart';
import 'package:trees_india/pages/register_page/domain/entities/register_request_entity.dart';
import 'package:trees_india/pages/register_page/domain/entities/register_response_entity.dart';

class RegisterUsecase {
  final AuthRepository authRepository;

  RegisterUsecase({required this.authRepository});

  Future<RegisterResponseEntity> call(RegisterRequestEntity request) async {
    return await authRepository.register(request);
  }
}
