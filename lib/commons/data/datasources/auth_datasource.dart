import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/data/models/otp_request_model.dart';
import 'package:trees_india/commons/data/models/otp_response_model.dart';
import 'package:trees_india/commons/data/models/refresh_token_request_model.dart';
import 'package:trees_india/commons/data/models/user_profile_model.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';
import 'package:trees_india/pages/login_page/data/models/login_request_model.dart';
import 'package:trees_india/pages/login_page/data/models/login_response_model.dart';
import 'package:trees_india/pages/register_page/data/models/register_request_model.dart';
import 'package:trees_india/pages/register_page/data/models/register_response_model.dart';

class AuthDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  AuthDatasource({
    required this.dioClient,
    required this.errorHandler,
  });

  Future<LoginResponseModel> login(LoginRequestModel request) async {
    final url = ApiEndpoints.login.path;

    try {
      final response = await dioClient.dio.post(url, data: request.toJson());

      // Always try to parse the response, regardless of status code
      return LoginResponseModel.fromJson(response.data);
    } catch (e) {
      if (e is DioException) {
        print("DioException caught - Status: ${e.response?.statusCode}");
        print("DioException data: ${e.response?.data}");

        // Handle specific status codes
        if (e.response?.statusCode == 404) {
          // User not found - extract server's message
          final errorData = e.response?.data;
          if (errorData != null && errorData['message'] != null) {
            print("404 error message: ${errorData['message']}");
            throw Exception(errorData['message']);
          }
          throw Exception('User not found. Please register first.');
        }
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error during login.');
    }
  }

  Future<RegisterResponseModel> register(RegisterRequestModel request) async {
    final url = ApiEndpoints.register.path;

    try {
      final response = await dioClient.dio.post(url, data: request.toJson());
      print("Success response: ${response.data}");

      // Only handle successful responses here
      return RegisterResponseModel.fromJson(response.data);
    } catch (e) {
      if (e is DioException) {
        print("DioException caught - Status: ${e.response?.statusCode}");
        print("DioException data: ${e.response?.data}");

        // Handle specific status codes
        if (e.response?.statusCode == 409) {
          // User already exists - extract server's message
          final errorData = e.response?.data;
          if (errorData != null && errorData['message'] != null) {
            print("409 error message: ${errorData['message']}");
            throw Exception(errorData['message']);
          }
          throw Exception(
              'Phone number is already registered. Please try logging in instead.');
        }
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error during registration.');
    }
  }

  Future<OtpResponseModel> verifyOtp(OtpRequestModel request) async {
    final url = ApiEndpoints.verifyOtp.path;

    try {
      final response = await dioClient.dio.post(url, data: request.toJson());

      // Always try to parse the response, regardless of status code
      return OtpResponseModel.fromJson(response.data);
    } catch (e) {
      if (e is DioException) {
        print("DioException caught - Status: ${e.response?.statusCode}");
        print("DioException data: ${e.response?.data}");

        // Handle specific status codes
        if (e.response?.statusCode == 400 || e.response?.statusCode == 404) {
          // Invalid OTP or user not found - extract server's message
          final errorData = e.response?.data;
          if (errorData != null && errorData['message'] != null) {
            print("OTP error message: ${errorData['message']}");
            throw Exception(errorData['message']);
          }
          throw Exception('Invalid OTP. Please try again.');
        }
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error during OTP verification.');
    }
  }

  Future<OtpResponseModel> refreshToken(
      RefreshTokenRequestModel request) async {
    final url = ApiEndpoints.refreshToken.path;

    try {
      final response = await dioClient.dio.post(url, data: request.toJson());

      if (response.statusCode == 200) {
        return OtpResponseModel.fromJson(response.data);
      } else {
        throw Exception('Failed to refresh token. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error during token refresh.');
    }
  }

  Future<UserProfileResponseModel> getUserProfile({String? authToken}) async {
    final url = ApiEndpoints.userProfile.path;

    try {
      // If authToken is provided, use it directly in headers
      final Map<String, dynamic> headers = {};
      if (authToken != null) {
        headers['Authorization'] = 'Bearer $authToken';
      }

      final response = await dioClient.dio.get(
        url,
        options: authToken != null ? Options(headers: headers) : null,
      );

      if (response.statusCode == 200) {
        return UserProfileResponseModel.fromJson(response.data);
      } else {
        throw Exception('Failed to get user profile. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error fetching user profile.');
    }
  }
}
