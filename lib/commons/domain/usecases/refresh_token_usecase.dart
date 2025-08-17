import 'package:trees_india/commons/domain/entities/otp_response_entity.dart';
import 'package:trees_india/commons/domain/entities/refresh_token_request_entity.dart';
import 'package:trees_india/commons/domain/repositories/auth_repository.dart';

class RefreshTokenUsecase {
  final AuthRepository authRepository;

  RefreshTokenUsecase({required this.authRepository});

  Future<OtpResponseEntity> call(RefreshTokenRequestEntity request) async {
    return await authRepository.refreshToken(request);
  }
}
