import 'package:trees_india/commons/domain/entities/otp_request_entity.dart';
import 'package:trees_india/commons/domain/entities/otp_response_entity.dart';
import 'package:trees_india/commons/domain/entities/refresh_token_request_entity.dart';
import 'package:trees_india/commons/domain/entities/user_profile_entity.dart';
import 'package:trees_india/pages/login_page/domain/entities/login_request_entity.dart';
import 'package:trees_india/pages/login_page/domain/entities/login_response_entity.dart';

abstract class LoginRepository {
  Future<LoginResponseEntity> login(LoginRequestEntity request);
  Future<OtpResponseEntity> verifyOtp(OtpRequestEntity request);
  Future<OtpResponseEntity> refreshToken(RefreshTokenRequestEntity request);
  Future<UserProfileResponseEntity> getUserProfile({String? authToken});
}
