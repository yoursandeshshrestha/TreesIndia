import 'package:trees_india/commons/domain/entities/otp_response_entity.dart';
import 'package:trees_india/commons/domain/entities/refresh_token_request_entity.dart';
import 'package:trees_india/commons/domain/repositories/login_repository.dart';

class RefreshTokenUsecase {
  final LoginRepository loginRepository;

  RefreshTokenUsecase({required this.loginRepository});

  Future<OtpResponseEntity> call(RefreshTokenRequestEntity request) async {
    return await loginRepository.refreshToken(request);
  }
}
