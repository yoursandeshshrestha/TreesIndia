import 'package:trees_india/commons/domain/entities/otp_request_entity.dart';
import 'package:trees_india/commons/domain/entities/otp_response_entity.dart';
import 'package:trees_india/commons/domain/repositories/auth_repository.dart';

class VerifyOtpUsecase {
  final AuthRepository authRepository;

  VerifyOtpUsecase({required this.authRepository});

  Future<OtpResponseEntity> call(OtpRequestEntity request) async {
    return await authRepository.verifyOtp(request);
  }
}
