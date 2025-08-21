// lib/commons/app/auth_provider.dart
import 'dart:async';

import 'package:trees_india/commons/data/models/user_model.dart';
import 'package:trees_india/commons/domain/entities/user_entity.dart';
import 'package:trees_india/commons/domain/entities/token_entity.dart';
import 'package:trees_india/commons/domain/entities/refresh_token_request_entity.dart';
import 'package:trees_india/commons/domain/usecases/refresh_token_usecase.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/commons/presenters/providers/login_usecase_providers.dart';
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
  return AuthNotifier(localStorageService, refreshTokenUsecase, ref);
})
  ..registerProvider();

class AuthState {
  final bool isLoggedIn;
  final TokenEntity? token;

  const AuthState({
    this.isLoggedIn = false,
    this.token,
  });

  AuthState copyWith({
    bool? isLoggedIn,
    TokenEntity? token,
  }) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      token: token ?? this.token,
    );
  }

  @override
  toString() {
    return 'AuthState(isLoggedIn: $isLoggedIn, token: ${token != null ? 'present' : 'null'})';
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref ref;
  final CentralizedLocalStorageService _localStorageService;
  final RefreshTokenUsecase _refreshTokenUsecase;
  final Logger _logger = Logger();
  static const String authStorageKey = 'user_auth_tokens';
  bool _mounted = true;

  AuthNotifier(this._localStorageService, this._refreshTokenUsecase, this.ref)
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
      final tokenJson = await _localStorageService.getData(authStorageKey);
      debugPrint('Token JSON from storage: $tokenJson');

      if (!_mounted) return;

      if (tokenJson != null) {
        final Map<String, dynamic> typedJson =
            convertToStringDynamicMap(tokenJson);

        try {
          if (!_mounted) return;

          final tokenEntity = TokenEntity(
            token: typedJson['authToken'] ?? '',
            refreshToken: typedJson['refreshToken'] ?? '',
            userId: typedJson['userId']?.toString(),
          );

          if (tokenEntity.token.isNotEmpty) {
            // Check if token needs refresh
            if (_isTokenExpired(tokenEntity.token)) {
              debugPrint('Token is expired, attempting to refresh...');
              final refreshed =
                  await _refreshTokenIfNeeded(tokenEntity.refreshToken);
              if (refreshed) {
                debugPrint('Token refreshed successfully');
                await checkAuthState();
                return;
              } else {
                debugPrint('Token refresh failed, logging out');
                await logout();
                return;
              }
            }

            state = AuthState(isLoggedIn: true, token: tokenEntity);
            debugPrint('Auth state set to true - valid token found');

            // Load profile data separately
            await ref.read(userProfileProvider.notifier).loadUserProfile();
            return;
          }
        } catch (e) {
          debugPrint('Error parsing token data: $e');
        }
      }

      if (!_mounted) return;
      debugPrint('No valid token found, setting auth state to logged out');
      state = const AuthState(isLoggedIn: false, token: null);
    } catch (e) {
      if (!_mounted) return;
      debugPrint('Error checking auth state: $e');
      state = const AuthState(isLoggedIn: false, token: null);
    }
    debugPrint('Auth state is: ${state.isLoggedIn}');
  }

  Future<void> login(UserModel userModel) async {
    _checkMounted();
    debugPrint('Login called');
    try {
      if (userModel.token != null) {
        // Save auth tokens separately
        final tokenData = {
          'authToken': userModel.token!.authToken,
          'refreshToken': userModel.token!.refreshToken,
          'userId': userModel.userId?.toString(),
        };

        await _localStorageService.saveData(authStorageKey, tokenData);

        // Save profile data separately
        await ref.read(userProfileProvider.notifier).saveUserProfile(
              UserEntity(
                userId: userModel.userId,
                name: userModel.fullName,
                email: userModel.email,
                userImage: userModel.userImage,
                phone: userModel.phone,
                gender: userModel.gender,
                isActive: userModel.isActive,
                isVerified: userModel.isVerified,
                userType: userModel.userType,
                createdAt: userModel.createdAt,
                updatedAt: userModel.updatedAt,
              ),
            );

        if (!_mounted) return;

        final tokenEntity =
            userModel.token!.toEntity(userId: userModel.userId?.toString());
        state = AuthState(isLoggedIn: true, token: tokenEntity);
        debugPrint('User logged in and auth state updated');
        _authStatusController.add(true);
      }
    } catch (e) {
      if (!_mounted) return;
      debugPrint('Error during login: $e');
      state = const AuthState(isLoggedIn: false, token: null);
      throw Exception('Failed to initialize user session');
    }
  }

  /// Get current token for API calls
  TokenEntity? get currentToken {
    _checkMounted();
    return state.token;
  }

  Future<void> logout() async {
    _checkMounted();
    try {
      _logger.i('🚪 [AuthNotifier] Starting logout process...');

      // Clear auth tokens
      await _localStorageService.deleteData(authStorageKey);
      _logger.i('✅ [AuthNotifier] Auth tokens cleared during logout');

      // Clear profile data
      await ref.read(userProfileProvider.notifier).clearUserProfile();
      _logger.i('✅ [AuthNotifier] Profile data cleared during logout');

      if (!_mounted) return;

      // Reset all registered providers
      ProviderRegistry.resetAll(ref.container);

      if (!_mounted) return;
      state = const AuthState(isLoggedIn: false, token: null);

      _logger.i('✅ [AuthNotifier] User logged out successfully');
      debugPrint('Logout completed successfully');
      _authStatusController.add(false);
    } catch (e) {
      if (!_mounted) return;
      _logger.e('❌ [AuthNotifier] Error during logout: $e');
      debugPrint('Error during logout: $e');
      state = const AuthState(isLoggedIn: false, token: null);
      throw Exception('Failed to log out. Please try again.');
    }
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
        final tokenData = {
          'authToken': response.data!.accessToken,
          'refreshToken': response.data!.refreshToken,
          'userId': state.token?.userId,
        };

        await _localStorageService.saveData(authStorageKey, tokenData);

        // Update auth state with new tokens
        final newTokenEntity = TokenEntity(
          token: response.data!.accessToken,
          refreshToken: response.data!.refreshToken,
          userId: state.token?.userId,
        );

        if (!_mounted) return false;
        state = state.copyWith(token: newTokenEntity);
        return true;
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
