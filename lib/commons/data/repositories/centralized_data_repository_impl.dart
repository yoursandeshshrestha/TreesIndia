import 'package:flutter/material.dart';
import 'package:logger/logger.dart';
import 'package:trees_india/commons/domain/repositories/centralized_data_repository.dart';
import 'package:trees_india/commons/domain/entities/location_entity.dart';

import '../../utils/services/centralized_local_storage_service.dart';
import '../datasources/centralized_datasource.dart';

// Utility function to safely convert storage data to Map<String, dynamic>
Map<String, dynamic> convertToStringDynamicMap(dynamic data) {
  if (data is Map<String, dynamic>) {
    return data;
  } else if (data is Map) {
    return data.map((key, value) {
      if (value is Map) {
        return MapEntry(key.toString(), convertToStringDynamicMap(value));
      } else if (value is List) {
        return MapEntry(
            key.toString(),
            value.map((item) {
              if (item is Map) {
                return convertToStringDynamicMap(item);
              }
              return item;
            }).toList());
      } else {
        return MapEntry(key.toString(), value);
      }
    });
  } else {
    throw Exception(
        'Cannot convert data to Map<String, dynamic>: ${data.runtimeType}');
  }
}

class CentralizedDataRepositoryImpl implements CentralizedDataRepository {
  final CentralizedDatasource datasource;
  final CentralizedLocalStorageService localStorageService;
  final Logger _logger = Logger();

  static const String authStorageKey = 'user_auth_tokens';
  static const String profileStorageKey = 'user_profile_data';

  CentralizedDataRepositoryImpl({
    required this.datasource,
    required this.localStorageService,
  });

  Future<String?> getAuthToken({bool forceRemote = false}) async {
    try {
      final localTokenJson = await localStorageService.getData(authStorageKey);
      debugPrint('getAuthToken - localTokenJson: $localTokenJson');

      if (localTokenJson != null && !forceRemote) {
        final Map<String, dynamic> typedJson =
            convertToStringDynamicMap(localTokenJson);
        // Auth storage now contains token data directly, not wrapped in UserModel
        final token = typedJson['authToken'] as String?;
        debugPrint(
            'getAuthToken - retrieved token: ${token != null ? "Token found (${token.length} chars)" : "No token"}');
        return token;
      }

      debugPrint(
          'getAuthToken - No local token data found or forceRemote=true');
      return null;
    } catch (e) {
      debugPrint('Error fetching auth token: $e');
      return null;
    }
  }

  @override
  Future<void> logout() async {
    try {
      _logger.i('🚪 [Flutter] Starting logout process...');

      await localStorageService.deleteData(authStorageKey);
      await localStorageService.deleteData(profileStorageKey);
      _logger.i('✅ [Flutter] Local storage cleared during logout');

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
  Future<List<LocationEntity>> searchLocations(String query) async {
    try {
      return await datasource.searchLocations(query);
    } catch (e) {
      _logger.e('Error searching locations for query "$query": $e');
      throw Exception('Failed to search locations. Please try again.');
    }
  }
}
