// lib/commons/app/auth_provider.dart
import 'dart:async';

import 'package:trees_india/commons/data/models/user_model.dart';
import 'package:trees_india/commons/domain/entities/user_entity.dart';
import 'package:trees_india/commons/domain/entities/refresh_token_request_entity.dart';
import 'package:trees_india/commons/domain/usecases/get_user_profile_usecase.dart';
import 'package:trees_india/commons/domain/usecases/refresh_token_usecase.dart';
import 'package:trees_india/commons/presenters/providers/auth_usecase_providers.dart';
import 'package:trees_india/commons/presenters/providers/local_storage_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:trees_india/commons/utils/services/centralized_local_storage_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  debugPrint('Creating AuthNotifier...');
  final localStorageService = ref.watch(localStorageServiceProvider);
  final refreshTokenUsecase = ref.watch(refreshTokenUsecaseProvider);
  final getUserProfileUsecase = ref.watch(getUserProfileUsecaseProvider);
  return AuthNotifier(
      localStorageService, refreshTokenUsecase, getUserProfileUsecase, ref);
})
  ..registerProvider();

class AuthState {
  final bool isLoggedIn;
  final UserEntity? user;

  const AuthState({
    this.isLoggedIn = false,
    this.user,
  });

  AuthState copyWith({
    bool? isLoggedIn,
    UserEntity? user,
  }) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      user: user ?? this.user,
    );
  }

  @override
  toString() {
    return 'AuthState(isLoggedIn: $isLoggedIn, user: $user)';
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref ref;
  final CentralizedLocalStorageService _localStorageService;
  final RefreshTokenUsecase _refreshTokenUsecase;
  final GetUserProfileUsecase _getUserProfileUsecase;
  final Logger _logger = Logger();
  static const String userStorageKey = 'user_profile';
  bool _mounted = true;

  AuthNotifier(this._localStorageService, this._refreshTokenUsecase,
      this._getUserProfileUsecase, this.ref)
      : super(const AuthState()) {
    debugPrint('AuthNotifier initialized');
  }

  final _authStatusController = StreamController<bool>.broadcast();
  Stream<bool> get authStatusStream => _authStatusController.stream;

  @override
  void dispose() {
    _mounted = false;
    super.dispose();
  }

  // Helper method to check if the notifier is still mounted
  void _checkMounted() {
    if (!_mounted) {
      throw StateError(
          'Tried to use AuthNotifier after `dispose` was called. Consider checking `mounted`.');
    }
  }

  Future<void> checkAuthState() async {
    _checkMounted();
    debugPrint('Checking auth state...');
    try {
      final userJson = await _localStorageService.getData(userStorageKey);
      debugPrint('User JSON from storage: $userJson');

      if (!_mounted) return; // Check mounted after async operation

      if (userJson != null) {
        final Map<String, dynamic> typedJson =
            convertToStringDynamicMap(userJson);

        try {
          if (!_mounted) return; // Check mounted before state update

          final userModel = UserModel.fromJson(typedJson);
          final userEntity = userModel.toEntity();

          if (userModel.token != null) {
            // Check if token needs refresh
            if (_isTokenExpired(userModel.token!.authToken)) {
              debugPrint('Token is expired, attempting to refresh...');
              final refreshed =
                  await _refreshTokenIfNeeded(userModel.token!.refreshToken);
              if (refreshed) {
                debugPrint('Token refreshed successfully');
                // Reload user data after refresh
                await checkAuthState();
                return;
              } else {
                debugPrint('Token refresh failed, logging out');
                await logout();
                return;
              }
            }

            state = AuthState(isLoggedIn: true, user: userEntity);
            debugPrint('Auth state set to true - valid token found');
            return;
          }
        } catch (e) {
          debugPrint('Error parsing UserModel: $e');
        }
      }

      if (!_mounted) return;
      debugPrint('No valid user data found, setting auth state to logged out');
      state = const AuthState(isLoggedIn: false, user: null);
    } catch (e) {
      if (!_mounted) return;
      debugPrint('Error checking auth state: $e');
      state = const AuthState(isLoggedIn: false, user: null);
    }
    debugPrint('Auth state is: ${state.isLoggedIn}');
  }

  Future<void> login() async {
    _checkMounted();
    debugPrint('Login called');
    try {
      final userJson = await _localStorageService.getData(userStorageKey);

      if (!_mounted) return;

      if (userJson != null) {
        final Map<String, dynamic> typedJson =
            convertToStringDynamicMap(userJson);

        try {
          if (!_mounted) return;

          final userModel = UserModel.fromJson(typedJson);
          final userEntity = userModel.toEntity();
          state = AuthState(isLoggedIn: true, user: userEntity);
          debugPrint('User loaded from storage and auth state updated');
          _authStatusController.add(true);
        } catch (e) {
          debugPrint('Error parsing UserModel: $e');
        }
        // }
      }
    } catch (e) {
      if (!_mounted) return;
      debugPrint('Error during login: $e');
      state = const AuthState(isLoggedIn: false, user: null);
      throw Exception('Failed to initialize user session');
    }
  }

  /// Refresh user profile data from server
  Future<void> refreshUserProfile() async {
    _checkMounted();
    if (!state.isLoggedIn) {
      debugPrint('User not logged in, cannot refresh profile');
      return;
    }

    try {
      debugPrint('Refreshing user profile from server...');
      final profileResponse = await _getUserProfileUsecase();

      if (profileResponse.success && profileResponse.data != null) {
        final profileData = profileResponse.data!;

        // Get current user data to preserve tokens
        final currentUserJson =
            await _localStorageService.getData(userStorageKey);
        if (currentUserJson != null) {
          final Map<String, dynamic> typedJson = convertToStringDynamicMap(currentUserJson);
          final currentUserModel = UserModel.fromJson(typedJson);

          // Create updated user model with new profile data but keeping tokens
          final updatedUserModel = UserModel(
            userId: profileData.id,
            fullName: profileData.name,
            email: profileData.email,
            userImage: profileData.avatar,
            phone: profileData.phone,
            gender: profileData.gender,
            isActive: profileData.isActive,
            isVerified: profileData.isVerified,
            userType: profileData.userType,
            createdAt: profileData.createdAt,
            updatedAt: profileData.updatedAt,
            token: currentUserModel.token, // Preserve existing tokens
          );

          // Save updated profile to storage
          await _localStorageService.saveData(
              userStorageKey, updatedUserModel.toJson());

          // Update state
          if (!_mounted) return;
          state =
              AuthState(isLoggedIn: true, user: updatedUserModel.toEntity());
          debugPrint('User profile refreshed successfully');
        }
      } else {
        debugPrint(
            'Failed to refresh user profile: ${profileResponse.message}');
      }
    } catch (e) {
      debugPrint('Error refreshing user profile: $e');
      // Don't throw error, profile refresh is not critical
    }
  }

  /// Update user avatar

  Future<void> logout() async {
    _checkMounted();
    try {
      _logger.i('🚪 [AuthNotifier] Starting logout process...');

      // Clear local storage first
      await _localStorageService.deleteData(userStorageKey);
      _logger.i('✅ [AuthNotifier] Local storage cleared during logout');

      if (!_mounted) return;

      // Reset all registered providers
      ProviderRegistry.resetAll(ref.container);

      if (!_mounted) return;
      state = const AuthState(isLoggedIn: false, user: null);

      _logger.i('✅ [AuthNotifier] User logged out successfully');
      debugPrint('Logout completed successfully');
      _authStatusController.add(false);
    } catch (e) {
      if (!_mounted) return;
      _logger.e('❌ [AuthNotifier] Error during logout: $e');
      debugPrint('Error during logout: $e');
      state = const AuthState(isLoggedIn: false, user: null);
      throw Exception('Failed to log out. Please try again.');
    }
  }

  UserEntity? get currentUser {
    _checkMounted();
    return state.user;
  }

  // Helper method to check if token is expired
  bool _isTokenExpired(String token) {
    try {
      // For a real implementation, you would decode the JWT token and check the exp claim
      // For now, we'll assume tokens are valid for demonstration
      // You can use packages like dart_jsonwebtoken or jose for JWT handling
      return false; // Placeholder - implement JWT token expiry check
    } catch (e) {
      debugPrint('Error checking token expiry: $e');
      return true; // If we can't check, assume it's expired
    }
  }

  // Helper method to refresh token
  Future<bool> _refreshTokenIfNeeded(String refreshToken) async {
    try {
      final response = await _refreshTokenUsecase(
        RefreshTokenRequestEntity(refreshToken: refreshToken),
      );

      if (response.success && response.data != null) {
        // Save new tokens
        final userJson = await _localStorageService.getData(userStorageKey);
        if (userJson != null) {
          final typedJson = convertToStringDynamicMap(userJson);
          final userModel = UserModel.fromJson(typedJson);

          final updatedTokenModel = userModel.token?.copyWith(
            authToken: response.data!.accessToken,
            refreshToken: response.data!.refreshToken,
          );

          final updatedUserModel = userModel.copyWith(token: updatedTokenModel);

          await _localStorageService.saveData(
              userStorageKey, updatedUserModel.toJson());
          return true;
        }
      }
      return false;
    } catch (e) {
      debugPrint('Error refreshing token: $e');
      return false;
    }
  }
}

// Helper method to recursively convert Map<dynamic, dynamic> to Map<String, dynamic>
Map<String, dynamic> convertToStringDynamicMap(dynamic item) {
  if (item is Map) {
    return item.map((key, value) {
      if (value is Map) {
        return MapEntry(key.toString(), convertToStringDynamicMap(value));
      } else if (value is List) {
        return MapEntry(key.toString(), convertListItems(value));
      } else {
        return MapEntry(key.toString(), value);
      }
    });
  }
  return {};
}

// Helper method to handle list items
List<dynamic> convertListItems(List items) {
  return items.map((item) {
    if (item is Map) {
      return convertToStringDynamicMap(item);
    } else if (item is List) {
      return convertListItems(item);
    }
    return item;
  }).toList();
}
