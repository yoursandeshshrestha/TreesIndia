import 'package:trees_india/commons/data/datasources/auth_datasource.dart';
import 'package:trees_india/commons/data/models/otp_request_model.dart';
import 'package:trees_india/commons/data/models/refresh_token_request_model.dart';
import 'package:trees_india/commons/domain/entities/otp_request_entity.dart';
import 'package:trees_india/commons/domain/entities/otp_response_entity.dart';
import 'package:trees_india/commons/domain/entities/refresh_token_request_entity.dart';
import 'package:trees_india/commons/domain/entities/user_profile_entity.dart';
import 'package:trees_india/commons/domain/repositories/auth_repository.dart';
import 'package:trees_india/pages/login_page/data/models/login_request_model.dart';
import 'package:trees_india/pages/login_page/domain/entities/login_request_entity.dart';
import 'package:trees_india/pages/login_page/domain/entities/login_response_entity.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthDatasource authDatasource;

  AuthRepositoryImpl({required this.authDatasource});

  @override
  Future<LoginResponseEntity> login(LoginRequestEntity request) async {
    final model = LoginRequestModel(phone: request.phone);
    try {
      final response = await authDatasource.login(model);
      return response.toEntity();
    } catch (e) {
      // Handle 404 errors at repository level and return a proper response
      if (e.toString().contains('User not found') ||
          e.toString().contains('Please register first')) {
        final errorMessage = e.toString().replaceFirst('Exception: ', '');
        print(
            "Repository creating error response: success=false, message=$errorMessage");
        return LoginResponseEntity(
          success: false,
          message: errorMessage,
          timestamp: DateTime.now().toIso8601String(),
        );
      }
      rethrow; // Re-throw other errors
    }
  }

  @override
  Future<OtpResponseEntity> verifyOtp(OtpRequestEntity request) async {
    final model = OtpRequestModel(phone: request.phone, otp: request.otp);
    try {
      final response = await authDatasource.verifyOtp(model);
      return response.toEntity();
    } catch (e) {
      // Handle OTP verification errors at repository level and return a proper response
      if (e.toString().contains('Invalid OTP') ||
          e.toString().contains('OTP expired') ||
          e.toString().contains('User not found')) {
        final errorMessage = e.toString().replaceFirst('Exception: ', '');
        print(
            "Repository creating OTP error response: success=false, message=$errorMessage");
        return OtpResponseEntity(
          success: false,
          message: errorMessage,
          timestamp: DateTime.now().toIso8601String(),
        );
      }
      rethrow; // Re-throw other errors
    }
  }

  @override
  Future<OtpResponseEntity> refreshToken(
      RefreshTokenRequestEntity request) async {
    final model = RefreshTokenRequestModel(refreshToken: request.refreshToken);
    final response = await authDatasource.refreshToken(model);
    return response.toEntity();
  }

  @override
  Future<UserProfileResponseEntity> getUserProfile({String? authToken}) async {
    final response = await authDatasource.getUserProfile(authToken: authToken);
    return response.toEntity();
  }
}
