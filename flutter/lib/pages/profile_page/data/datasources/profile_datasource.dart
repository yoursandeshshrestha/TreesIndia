import 'package:dio/dio.dart';
import 'dart:convert';
import 'package:trees_india/commons/utils/services/dio_client.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import '../models/profile_update_model.dart';
import '../models/avatar_upload_model.dart';
import 'package:trees_india/commons/data/models/user_profile_model.dart';

class ProfileDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  ProfileDatasource({
    required this.dioClient,
    required this.errorHandler,
  });

  Future<ProfileUpdateResponseModel> updateProfile(
      ProfileUpdateRequestModel request) async {
    final url = ApiEndpoints.userProfile.path;

    try {
      final response = await dioClient.dio.put(url, data: request.toJson());
      return ProfileUpdateResponseModel.fromJson(response.data);
    } catch (e) {
      if (e is DioException) {
        // Log/process the error
        errorHandler.handleNetworkError(e);
        // Extract server-provided message
        String? extractedMessage;
        dynamic data = e.response?.data;
        if (data is String) {
          try {
            data = jsonDecode(data);
          } catch (_) {}
        }
        if (data is Map) {
          final dynamic message = data['message'] ?? data['error'];
          if (message is String && message.trim().isNotEmpty) {
            extractedMessage = message;
          }
        } else if (data is String && data.trim().isNotEmpty) {
          extractedMessage = data;
        }
        throw Exception(extractedMessage ?? 'Failed to update profile');
      } else {
        throw errorHandler.handleGenericError(e);
      }
    }
  }

  Future<AvatarUploadResponseModel> uploadAvatar(
      AvatarUploadRequestModel request) async {
    final url = ApiEndpoints.uploadAvatar.path;

    try {
      // Create form data for file upload
      final formData = FormData.fromMap({
        'avatar': MultipartFile.fromBytes(
          request.fileData,
          filename: request.fileName,
        ),
      });

      final response = await dioClient.dio.post(url, data: formData);
      return AvatarUploadResponseModel.fromJson(response.data);
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error uploading avatar.');
    }
  }

  Future<UserProfileResponseModel> getUserProfile() async {
    final url = ApiEndpoints.userProfile.path;

    try {
      final response = await dioClient.dio.get(url);
      return UserProfileResponseModel.fromJson(response.data);
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
