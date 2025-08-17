import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/data/models/user_model.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';

class CentralizedDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  CentralizedDatasource({
    required this.dioClient,
    required this.errorHandler,
  });

  Future<bool> resetPassword(String email) async {
    final url = ApiEndpoints.resetPassword.path;

    try {
      final response = await dioClient.dio.post(url, data: {
        'emailId': email,
      });

      if (response.statusCode == 200 && response.data['Response'] != null) {
        return response.data['Response'];
      } else {
        throw Exception('Failed to reset password. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error during password reset.');
    }
  }

  Future<bool> changePassword(
      String email, String currentPassword, String newPassword) async {
    final url = ApiEndpoints.changePassword.path;

    try {
      final response = await dioClient.dio.post(url, data: {
        'EmailId': email,
        'CurrentPassword': currentPassword,
        'NewPassword': newPassword,
      });

      if (response.statusCode == 200 && response.data['Response'] != null) {
        return response.data['Response'];
      } else {
        throw Exception('Failed to change password. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error during password change.');
    }
  }

  Future<UserModel> getUserProfile() async {
    try {
      final url = ApiEndpoints.userProfile.path;
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200 &&
          response.data['IsSuccess'] == true &&
          response.data['Response'] != null) {
        return UserModel.fromJson(response.data['Response']);
      } else {
        throw Exception('Failed to get user profile. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw CustomException(
          message: 'Could not fetch user profile. Please try again.');
    }
  }
}
