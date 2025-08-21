import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/presenters/viewmodels/login_viewmodel/login_state.dart';
import 'package:trees_india/commons/data/models/token_model.dart';
import 'package:trees_india/commons/data/models/user_model.dart';
import 'package:trees_india/commons/domain/entities/otp_request_entity.dart';
import 'package:trees_india/commons/domain/entities/refresh_token_request_entity.dart';
import 'package:trees_india/commons/domain/usecases/get_user_profile_usecase.dart';
import 'package:trees_india/commons/domain/usecases/refresh_token_usecase.dart';
import 'package:trees_india/commons/domain/usecases/verify_otp_usecase.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:trees_india/commons/utils/services/centralized_local_storage_service.dart';
import 'package:trees_india/commons/utils/services/notification_service.dart';
import 'package:trees_india/pages/login_page/domain/entities/login_request_entity.dart';
import 'package:trees_india/pages/login_page/domain/usecases/login_usecase.dart';

class LoginNotifier extends StateNotifier<LoginStateModel>
    with ResettableNotifier<LoginStateModel> {
  final LoginUsecase loginUsecase;
  final VerifyOtpUsecase verifyOtpUsecase;
  final RefreshTokenUsecase refreshTokenUsecase;
  final GetUserProfileUsecase getUserProfileUsecase;
  final CentralizedLocalStorageService localStorageService;
  final NotificationService notificationService;
  final Ref ref;
  bool _mounted = true;

  LoginNotifier({
    required this.loginUsecase,
    required this.verifyOtpUsecase,
    required this.refreshTokenUsecase,
    required this.getUserProfileUsecase,
    required this.localStorageService,
    required this.notificationService,
    required this.ref,
  }) : super(const LoginStateModel());

  @override
  void dispose() {
    _mounted = false;
    super.dispose();
  }

  // Removed unused method _checkMounted

  @override
  void reset() {
    if (!_mounted) return;
    state = const LoginStateModel();
  }

  void clearMessages() {
    if (!_mounted) return;
    // Only clear if there are actually messages to clear
    if (state.errorMessage != null || state.successMessage != null) {
      state = state.clearMessages();
    }
  }

  Future<void> login(String phoneNumber) async {
    if (!_mounted) return;
    state = state.copyWith(
      state: LoginState.loadingLogin,
      phoneNumber: phoneNumber,
      isLoading: true,
      errorMessage: null,
      successMessage: null,
    );

    try {
      final response =
          await loginUsecase(LoginRequestEntity(phone: phoneNumber));

      if (response.success) {
        if (!_mounted) return;
        state = state.copyWith(
          state: LoginState.loginSuccess,
          isLoading: false,
          successMessage: response.message,
        );
        // Show success message
        notificationService.showSuccessSnackBar(response.message);
      } else {
        if (!_mounted) return;
        state = state.copyWith(
          state: LoginState.error,
          isLoading: false,
          errorMessage: response.message,
        );
        // Show error message
        notificationService.showErrorSnackBar(response.message);
      }
    } catch (e) {
      debugPrint('Login error: $e');
      if (!_mounted) return;

      // Handle any other unexpected errors
      String errorMessage = 'Login failed. Please try again.';

      state = state.copyWith(
        state: LoginState.error,
        isLoading: false,
        errorMessage: errorMessage,
      );

      // Show error message
      notificationService.showErrorSnackBar(errorMessage);
    }
  }

  Future<void> verifyOtp(String otp) async {
    if (state.phoneNumber == null) {
      state = state.copyWith(
        state: LoginState.error,
        errorMessage: 'Phone number is required for OTP verification.',
      );
      return;
    }

    state = state.copyWith(
      state: LoginState.loadingOtpVerification,
      otp: otp,
      isLoading: true,
      errorMessage: null,
      successMessage: null,
    );

    try {
      final response = await verifyOtpUsecase(
        OtpRequestEntity(phone: state.phoneNumber!, otp: otp),
      );

      if (response.success && response.data != null) {
        // Tokens will be saved by auth provider

        // Fetch user profile and save complete user data
        await _fetchAndSaveUserProfile(
            response.data!.accessToken, response.data!.refreshToken);

        if (!_mounted) return;
        state = state.copyWith(
          state: LoginState.authenticationSuccess,
          isLoading: false,
          successMessage: response.message,
        );

        // Show success message
        notificationService.showSuccessSnackBar(response.message);


      } else {
        state = state.copyWith(
          state: LoginState.error,
          isLoading: false,
          errorMessage: response.message,
        );
        // Show error message
        notificationService.showErrorSnackBar(response.message);
      }
    } catch (e) {
      debugPrint('OTP verification error: $e');
      state = state.copyWith(
        state: LoginState.error,
        isLoading: false,
        errorMessage: 'OTP verification failed. Please try again.',
      );
      // Show error message
      notificationService
          .showErrorSnackBar('OTP verification failed. Please try again.');
    }
  }

  Future<void> _saveTokensToStorage(
      String accessToken, String refreshToken) async {
    try {
      debugPrint(
          '🔐 Saving tokens - Access token length: ${accessToken.length}');
      debugPrint(
          '🔐 Saving tokens - Refresh token length: ${refreshToken.length}');

      // TokenModel creation removed - handled by auth provider

      // Tokens are now handled by the auth provider during login
      debugPrint('✅ Tokens saved to local storage successfully');

      // Verify tokens were saved correctly
      final savedData = await localStorageService.getData('user_profile');
      debugPrint(
          '🔍 Verification - Saved data: ${savedData != null ? "Data found" : "No data"}');
    } catch (e) {
      debugPrint('❌ Error saving tokens to storage: $e');
    }
  }

  Future<void> _fetchAndSaveUserProfile(
      String accessToken, String refreshToken) async {
    if (!_mounted) return;
    try {
      debugPrint('Fetching user profile...');
      final profileResponse =
          await getUserProfileUsecase(authToken: accessToken);

      if (profileResponse.success && profileResponse.data != null) {
        final profileData = profileResponse.data!;

        // Update the auth provider with complete user model
        final tokenModel = TokenModel(
          authToken: accessToken,
          refreshToken: refreshToken,
        );

        final completeUserModel = UserModel(
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
          token: tokenModel,
        );

        // Use the new login method to save both auth and profile data separately
        await ref.read(authProvider.notifier).login(completeUserModel);
        debugPrint('Complete user profile saved to local storage successfully');
      } else {
        debugPrint('Failed to fetch user profile: ${profileResponse.message}');
      }
    } catch (e) {
      debugPrint('Error fetching and saving user profile: $e');
      // Don't throw error, continue with just tokens
    }
  }

  Future<bool> refreshTokenIfNeeded() async {
    try {
      final userJson = await localStorageService.getData('user_profile');
      if (userJson == null) return false;

      final userModel = UserModel.fromJson(userJson);
      if (userModel.token?.refreshToken == null) return false;

      final response = await refreshTokenUsecase(
        RefreshTokenRequestEntity(refreshToken: userModel.token!.refreshToken),
      );

      if (response.success && response.data != null) {
        await _saveTokensToStorage(
            response.data!.accessToken, response.data!.refreshToken);
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error refreshing token: $e');
      return false;
    }
  }

  void setPhoneNumber(String phoneNumber) {
    if (!_mounted) return;
    // Only update if phone number is actually different to prevent unnecessary state changes
    if (state.phoneNumber != phoneNumber) {
      state = state.copyWith(phoneNumber: phoneNumber);
    }
  }

  void resetState() {
    if (!_mounted) return;
    state = const LoginStateModel();
  }
}
