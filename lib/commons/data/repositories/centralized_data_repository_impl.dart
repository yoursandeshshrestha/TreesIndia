import 'package:flutter/material.dart';
import 'package:logger/logger.dart';
import 'package:trees_india/commons/data/models/user_model.dart';
import 'package:trees_india/commons/domain/entities/user_entity.dart';
import 'package:trees_india/commons/domain/repositories/centralized_data_repository.dart';

import '../../utils/services/centralized_local_storage_service.dart';
import '../datasources/centralized_datasource.dart';

// Utility function to safely convert storage data to Map<String, dynamic>
Map<String, dynamic> convertToStringDynamicMap(dynamic data) {
  if (data is Map<String, dynamic>) {
    return data;
  } else if (data is Map) {
    return Map<String, dynamic>.from(data);
  } else {
    throw Exception(
        'Cannot convert data to Map<String, dynamic>: ${data.runtimeType}');
  }
}

class CentralizedDataRepositoryImpl implements CentralizedDataRepository {
  final CentralizedDatasource datasource;
  final CentralizedLocalStorageService localStorageService;
  final Logger _logger = Logger();

  static const String userStorageKey = 'user_profile';

  CentralizedDataRepositoryImpl({
    required this.datasource,
    required this.localStorageService,
  });

  Future<String?> getAuthToken({bool forceRemote = false}) async {
    try {
      final localUserJson = await localStorageService.getData(userStorageKey);

      if (localUserJson != null && !forceRemote) {
        final Map<String, dynamic> typedJson =
            convertToStringDynamicMap(localUserJson);
        final userModel = UserModel.fromJson(typedJson);
        return userModel.token?.authToken;
      }

      throw Exception('Error fetching auth token!');
    } catch (e) {
      debugPrint('Error fetching auth token: $e');
      return null;
    }
  }

  @override
  Future<void> logout() async {
    try {
      _logger.i('🚪 [Flutter] Starting logout process...');

      // Clear local storage first
      await localStorageService.saveData('selectedRegion', '');
      await localStorageService.deleteData(userStorageKey);
      _logger.i('✅ [Flutter] Local storage cleared during logout');

      // Clear ALL iCloud data using the comprehensive cleanup method - ONLY ON iOS

      _logger.i('✅ [Flutter] User logged out successfully');
    } catch (e) {
      _logger.e('❌ [Flutter] Error during logout: $e');
      throw Exception('Failed to log out. Please try again.');
    }
  }

  @override
  Future<bool> resetPassword(String email) async {
    try {
      return await datasource.resetPassword(email);
    } catch (e) {
      _logger.e('Error resetting password for $email: $e');
      throw Exception('Failed to reset password. Please try again.');
    }
  }

  @override
  Future<bool> changePassword(
      String email, String currentPassword, String newPassword) async {
    try {
      return await datasource.changePassword(
          email, currentPassword, newPassword);
    } catch (e) {
      _logger.e('Error changing password for $email: $e');
      throw Exception('Failed to change password. Please try again.');
    }
  }

  @override
  Future<UserEntity> getUserProfile() async {
    try {
      final userJson = await localStorageService.getData(userStorageKey);
      UserEntity? userEntity;
      UserModel? userModel;

      _logger.i('🔍 [Flutter] GetUserProfile - Checking local storage...');
      debugPrint('GetUserProfile - UserJson from storage: $userJson');

      if (userJson != null) {
        final Map<String, dynamic> typedJson =
            convertToStringDynamicMap(userJson);
        try {
          userModel = UserModel.fromJson(typedJson);
          userEntity = userModel.toEntity();

          _logger.i('✅ [Flutter] User profile found in local storage');
          _logger.i('   - User: ${userModel.fullName ?? "Unknown"}');
          _logger.i(
              '   - Token length: ${userModel.token?.authToken.length ?? 0}');

          // Still save to iCloud for watch sync even if using cached data
          // await _saveTokenToICloud(userModel);

          return userEntity;
        } catch (e) {
          _logger.w('⚠️ [Flutter] Error parsing stored user data: $e');
          debugPrint('Error parsing stored user data: $e');
        }
      }

      _logger.i('🌐 [Flutter] Fetching fresh user profile from API...');
      debugPrint('Fetching fresh user profile from API');

      userModel = await datasource.getUserProfile();
      userEntity = userModel.toEntity();

      _logger.i('✅ [Flutter] Fresh user profile fetched from API');
      _logger.i('   - User: ${userModel.fullName ?? "Unknown"}');
      _logger
          .i('   - Token length: ${userModel.token?.authToken.length ?? 0}');

      // Save to local storage
      await localStorageService.saveData(userStorageKey, userModel.toJson());
      _logger.i('💾 [Flutter] User profile saved to local storage');

      // Save to iCloud for watch sync

      return userEntity;
    } catch (e) {
      _logger.e('❌ [Flutter] Error in getUserProfile: $e');
      debugPrint('Error in getUserProfile: $e');
      rethrow;
    }
  }

  /// Force save token to iCloud (used after fresh login)

  /// Optional utility to refresh iCloud token directly
  Future<void> refreshAuthToken() async {
    try {
      _logger.i('🔄 [Flutter] Refreshing auth token and syncing to iCloud...');
      await getUserProfile(); // This triggers iCloud sync
      _logger.i('✅ [Flutter] Auth token refreshed and synced to iCloud');
    } catch (e) {
      _logger.e('❌ [Flutter] Error refreshing auth token: $e');
      rethrow;
    }
  }
}
