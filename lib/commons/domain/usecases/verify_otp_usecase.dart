import 'package:trees_india/commons/domain/entities/otp_request_entity.dart';
import 'package:trees_india/commons/domain/entities/otp_response_entity.dart';
import 'package:trees_india/commons/domain/repositories/login_repository.dart';

class VerifyOtpUsecase {
  final LoginRepository loginRepository;

  VerifyOtpUsecase({required this.loginRepository});

  Future<OtpResponseEntity> call(OtpRequestEntity request) async {
    return await loginRepository.verifyOtp(request);
  }
}
