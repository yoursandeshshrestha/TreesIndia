import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/utils/services/notification_service.dart';

import '../../domain/entities/avatar_upload_entity.dart';
import '../../domain/entities/profile_update_entity.dart';
import '../../domain/usecases/get_profile_usecase.dart';
import '../../domain/usecases/update_profile_usecase.dart';
import '../../domain/usecases/upload_avatar_usecase.dart';
import 'profile_state.dart';

class ProfileNotifier extends StateNotifier<ProfileState> {
  final UpdateProfileUsecase _updateProfileUsecase;
  final UploadAvatarUsecase _uploadAvatarUsecase;
  final GetProfileUsecase _getProfileUsecase;
  final NotificationService _notificationService;
  bool _mounted = true;

  ProfileNotifier(
    this._updateProfileUsecase,
    this._uploadAvatarUsecase,
    this._getProfileUsecase,
    this._notificationService,
  ) : super(const ProfileState());

  void _checkMounted() {
    if (!_mounted) {
      throw StateError('ProfileNotifier is disposed');
    }
  }

  @override
  void dispose() {
    _mounted = false;
    super.dispose();
  }

  Future<void> loadProfile() async {
    _checkMounted();
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final response = await _getProfileUsecase();

      if (response.success && response.data != null) {
        final data = response.data!;
        state = state.copyWith(
          isLoading: false,
          isProfileLoaded: true,
          avatarUrl: data.avatar,
          name: data.name,
          email: data.email,
          gender: data.gender,
          phone: data.phone,
          subscription: data.subscription,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          errorMessage: response.message,
        );
        _notificationService.showErrorSnackBar(response.message);
      }
    } catch (e) {
      debugPrint('Error loading profile: $e');
      if (!_mounted) return;

      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load profile. Please try again.',
      );
      _notificationService
          .showErrorSnackBar('Failed to load profile. Please try again.');
    }
  }

  Future<void> updateProfile(String name, String email, String gender) async {
    _checkMounted();
    state = state.copyWith(isUpdatingProfile: true, errorMessage: null);

    try {
      final request = ProfileUpdateRequestEntity(
        name: name,
        email: email,
        gender: gender,
      );

      final response = await _updateProfileUsecase(request);

      if (response.success) {
        state = state.copyWith(
          isUpdatingProfile: false,
          successMessage: response.message,
        );
        _notificationService.showSuccessSnackBar(response.message);
      } else {
        state = state.copyWith(
          isUpdatingProfile: false,
          errorMessage: response.message,
        );
        _notificationService.showErrorSnackBar(response.message);
      }
    } catch (e) {
      debugPrint('Error updating profile: $e');
      if (!_mounted) return;

      final message = e.toString().replaceFirst('Exception: ', '');
      state = state.copyWith(
        isUpdatingProfile: false,
        errorMessage: message.isNotEmpty
            ? message
            : 'Failed to update profile. Please try again.',
      );
      _notificationService.showErrorSnackBar(
        message.isNotEmpty
            ? message
            : 'Failed to update profile. Please try again.',
      );
    }
  }

  Future<void> uploadAvatar(Uint8List fileData, String fileName) async {
    _checkMounted();
    state = state.copyWith(isUploadingAvatar: true, errorMessage: null);

    try {
      final request = AvatarUploadRequestEntity(
        fileData: fileData,
        fileName: fileName,
      );

      final response = await _uploadAvatarUsecase(request);

      if (response.success && response.data != null) {
        state = state.copyWith(
          isUploadingAvatar: false,
          avatarUrl: response.data!.avatarUrl,
          successMessage: response.message,
        );
        _notificationService.showSuccessSnackBar(response.message);
      } else {
        state = state.copyWith(
          isUploadingAvatar: false,
          errorMessage: response.message,
        );
        _notificationService.showErrorSnackBar(response.message);
      }
    } catch (e) {
      debugPrint('Error uploading avatar: $e');
      if (!_mounted) return;

      state = state.copyWith(
        isUploadingAvatar: false,
        errorMessage: 'Failed to upload avatar. Please try again.',
      );
      _notificationService
          .showErrorSnackBar('Failed to upload avatar. Please try again.');
    }
  }

  void clearMessages() {
    _checkMounted();
    state = state.clearMessages();
  }
}
