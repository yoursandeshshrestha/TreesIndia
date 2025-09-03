import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/data/models/user_model.dart';
import 'package:trees_india/commons/data/models/location_autocomplete_model.dart';
import 'package:trees_india/commons/domain/entities/location_entity.dart';
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

  Future<List<LocationEntity>> searchLocations(String query) async {
    try {
      final url = ApiEndpoints.locationAutocomplete.path;
      final response = await dioClient.dio.get(url, queryParameters: {
        'input': query,
      });

      if (response.statusCode == 200) {
        final autocompleteModel =
            LocationAutocompleteModel.fromJson(response.data);
        if (autocompleteModel.success) {
          return autocompleteModel.toLocationEntities();
        } else {
          throw Exception(autocompleteModel.message);
        }
      } else {
        throw Exception('Failed to search locations. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw CustomException(
          message: 'Could not search locations. Please try again.');
    }
  }
}
