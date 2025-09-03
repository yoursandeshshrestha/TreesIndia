import 'dart:async';

import 'package:trees_india/commons/domain/entities/user_entity.dart';
import 'package:trees_india/commons/domain/usecases/get_user_profile_usecase.dart';
import 'package:trees_india/commons/presenters/providers/login_usecase_providers.dart';
import 'package:trees_india/commons/presenters/providers/local_storage_provider.dart';
import 'package:trees_india/commons/utils/services/centralized_local_storage_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';

final userProfileProvider =
    StateNotifierProvider<UserProfileNotifier, UserProfileState>((ref) {
  debugPrint('Creating UserProfileNotifier...');
  final localStorageService = ref.watch(localStorageServiceProvider);
  final getUserProfileUsecase = ref.watch(getUserProfileUsecaseProvider);
  return UserProfileNotifier(localStorageService, getUserProfileUsecase, ref);
});

class UserProfileState {
  final UserEntity? user;
  final bool isLoading;
  final bool isUpdatingProfile;
  final bool isUploadingAvatar;
  final String? error;

  const UserProfileState({
    this.user,
    this.isLoading = false,
    this.isUpdatingProfile = false,
    this.isUploadingAvatar = false,
    this.error,
  });

  UserProfileState copyWith({
    UserEntity? user,
    bool? isLoading,
    bool? isUpdatingProfile,
    bool? isUploadingAvatar,
    String? error,
  }) {
    return UserProfileState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      isUpdatingProfile: isUpdatingProfile ?? this.isUpdatingProfile,
      isUploadingAvatar: isUploadingAvatar ?? this.isUploadingAvatar,
      error: error ?? this.error,
    );
  }

  @override
  String toString() {
    return 'UserProfileState(user: $user, isLoading: $isLoading, isUpdatingProfile: $isUpdatingProfile, isUploadingAvatar: $isUploadingAvatar, error: $error)';
  }
}

class UserProfileNotifier extends StateNotifier<UserProfileState> {
  final Ref ref;
  final CentralizedLocalStorageService _localStorageService;
  final GetUserProfileUsecase _getUserProfileUsecase;
  final Logger _logger = Logger();
  static const String profileStorageKey = 'user_profile_data';
  bool _mounted = true;

  UserProfileNotifier(
      this._localStorageService, this._getUserProfileUsecase, this.ref)
      : super(const UserProfileState()) {
    debugPrint('UserProfileNotifier initialized');
  }

  @override
  void dispose() {
    _mounted = false;
    super.dispose();
  }

  void _checkMounted() {
    if (!_mounted) {
      throw StateError(
          'Tried to use UserProfileNotifier after `dispose` was called. Consider checking `mounted`.');
    }
  }

  /// Load user profile from local storage
  Future<void> loadUserProfile() async {
    _checkMounted();
    debugPrint('Loading user profile from storage...');

    try {
      state = state.copyWith(isLoading: true, error: null);

      final userJson = await _localStorageService.getData(profileStorageKey);
      debugPrint('User profile JSON from storage: $userJson');

      if (!_mounted) return;

      if (userJson != null) {
        final Map<String, dynamic> typedJson =
            convertToStringDynamicMap(userJson);

        try {
          if (!_mounted) return;

          // Create UserEntity from profile data (without token)
          final userEntity = UserEntity(
            userId: typedJson['userId'],
            name: typedJson['fullName'] ?? typedJson['name'],
            email: typedJson['email'],
            userImage: typedJson['userImage'] ?? typedJson['avatar'],
            phone: typedJson['phone'],
            gender: typedJson['gender'],
            isActive: typedJson['isActive'] ?? typedJson['is_active'],
            isVerified: typedJson['isVerified'] ?? typedJson['is_verified'],
            userType: typedJson['userType'] ?? typedJson['user_type'],
            createdAt: typedJson['createdAt'] ?? typedJson['created_at'],
            updatedAt: typedJson['updatedAt'] ?? typedJson['updated_at'],
          );

          state = state.copyWith(user: userEntity, isLoading: false);
          debugPrint('User profile loaded successfully');
        } catch (e) {
          debugPrint('Error parsing user profile: $e');
          if (!_mounted) return;
          state = state.copyWith(
              isLoading: false, error: 'Failed to parse user profile');
        }
      } else {
        if (!_mounted) return;
        debugPrint('No user profile data found in storage');
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      if (!_mounted) return;
      debugPrint('Error loading user profile: $e');
      state = state.copyWith(
          isLoading: false, error: 'Failed to load user profile');
    }
  }

  /// Save user profile to local storage
  Future<void> saveUserProfile(UserEntity user) async {
    _checkMounted();
    try {
      debugPrint('Saving user profile to storage...');

      // Convert UserEntity to Map for storage (without token)
      final profileData = {
        'userId': user.userId,
        'fullName': user.name,
        'email': user.email,
        'userImage': user.userImage,
        'phone': user.phone,
        'gender': user.gender,
        'isActive': user.isActive,
        'isVerified': user.isVerified,
        'userType': user.userType,
        'createdAt': user.createdAt,
        'updatedAt': user.updatedAt,
      };

      await _localStorageService.saveData(profileStorageKey, profileData);

      if (!_mounted) return;
      state = state.copyWith(user: user);
      debugPrint('User profile saved successfully');
    } catch (e) {
      debugPrint('Error saving user profile: $e');
      if (!_mounted) return;
      state = state.copyWith(error: 'Failed to save user profile');
    }
  }

  /// Refresh user profile data from server
  Future<void> refreshUserProfile() async {
    _checkMounted();

    try {
      debugPrint('Refreshing user profile from server...');
      state = state.copyWith(isLoading: true, error: null);

      final profileResponse = await _getUserProfileUsecase();

      if (!_mounted) return;

      if (profileResponse.success && profileResponse.data != null) {
        final profileData = profileResponse.data!;

        final userEntity = UserEntity(
          userId: profileData.id,
          name: profileData.name,
          email: profileData.email,
          userImage: profileData.avatar,
          phone: profileData.phone,
          gender: profileData.gender,
          isActive: profileData.isActive,
          isVerified: profileData.isVerified,
          userType: profileData.userType,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
        );

        // Save to storage and update state
        await saveUserProfile(userEntity);

        if (!_mounted) return;
        state = state.copyWith(isLoading: false);
        debugPrint('User profile refreshed successfully');
      } else {
        if (!_mounted) return;
        debugPrint(
            'Failed to refresh user profile: ${profileResponse.message}');
        state = state.copyWith(
            isLoading: false,
            error:
                'Failed to refresh user profile: ${profileResponse.message}');
      }
    } catch (e) {
      if (!_mounted) return;
      debugPrint('Error refreshing user profile: $e');
      state = state.copyWith(
          isLoading: false, error: 'Error refreshing user profile: $e');
    }
  }

  /// Update user profile
  Future<void> updateProfile(String name, String email, String gender) async {
    _checkMounted();
    // Implementation would be added here based on your update profile use case
    // For now, this is a placeholder
    debugPrint(
        'Update profile called with name: $name, email: $email, gender: $gender');
    state = state.copyWith(isUpdatingProfile: true, error: null);

    // Simulate API call delay
    await Future.delayed(const Duration(seconds: 1));

    if (!_mounted) return;
    state = state.copyWith(isUpdatingProfile: false);
  }

  /// Upload avatar
  Future<void> uploadAvatar(List<int> imageBytes, String fileName) async {
    _checkMounted();
    // Implementation would be added here based on your upload avatar use case
    // For now, this is a placeholder
    debugPrint('Upload avatar called with fileName: $fileName');
    state = state.copyWith(isUploadingAvatar: true, error: null);

    // Simulate API call delay
    await Future.delayed(const Duration(seconds: 2));

    if (!_mounted) return;
    state = state.copyWith(isUploadingAvatar: false);
  }

  /// Clear user profile data
  Future<void> clearUserProfile() async {
    _checkMounted();
    try {
      _logger.i('🗑️ [UserProfileNotifier] Clearing user profile data...');

      await _localStorageService.deleteData(profileStorageKey);

      if (!_mounted) return;
      state = const UserProfileState();

      _logger.i('✅ [UserProfileNotifier] User profile data cleared');
      debugPrint('User profile data cleared successfully');
    } catch (e) {
      if (!_mounted) return;
      _logger.e('❌ [UserProfileNotifier] Error clearing user profile: $e');
      debugPrint('Error clearing user profile: $e');
      state = state.copyWith(error: 'Failed to clear user profile');
    }
  }

  UserEntity? get currentUser {
    _checkMounted();
    return state.user;
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
