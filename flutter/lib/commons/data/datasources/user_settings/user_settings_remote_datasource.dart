import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';

import '../../models/user_settings/notification_settings_model.dart';
import '../../models/user_settings/delete_otp_response_model.dart';

class UserSettingsRemoteDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  UserSettingsRemoteDatasource({
    required this.dioClient,
    required this.errorHandler,
  });

  Future<NotificationSettingsModel> getNotificationSettings() async {
    final url = ApiEndpoints.getUserNotificationSettings.path;

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200 && response.data['success'] == true) {
        return NotificationSettingsModel.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get notification settings');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting notification settings: ${e.toString()}');
    }
  }

  Future<bool> updateNotificationSettings(NotificationSettingsModel settings) async {
    final url = ApiEndpoints.updateUserNotificationSettings.path;

    try {
      final response = await dioClient.dio.put(
        url,
        data: settings.toJson(),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return true;
      } else {
        throw Exception(response.data['message'] ?? 'Failed to update notification settings');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error updating notification settings: ${e.toString()}');
    }
  }

  Future<DeleteOtpResponseModel> requestDeleteOtp() async {
    final url = ApiEndpoints.requestDeleteOtp.path;

    try {
      final response = await dioClient.dio.post(url);

      if (response.statusCode == 200 && response.data['success'] == true) {
        return DeleteOtpResponseModel.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to request delete OTP');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error requesting delete OTP: ${e.toString()}');
    }
  }

  Future<bool> deleteAccount(String otp) async {
    final url = ApiEndpoints.deleteUserAccount.path;

    try {
      final response = await dioClient.dio.delete(
        url,
        data: {'otp': otp},
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return true;
      } else {
        throw Exception(response.data['message'] ?? 'Failed to delete account');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error deleting account: ${e.toString()}');
    }
  }
}