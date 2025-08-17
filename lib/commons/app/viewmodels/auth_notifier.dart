import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/app/viewmodels/auth_state.dart'
    as auth_flow;
import 'package:trees_india/commons/data/models/token_model.dart';
import 'package:trees_india/commons/data/models/user_model.dart';
import 'package:trees_india/commons/domain/entities/otp_request_entity.dart';
import 'package:trees_india/commons/domain/entities/refresh_token_request_entity.dart';
import 'package:trees_india/commons/domain/usecases/get_user_profile_usecase.dart';
import 'package:trees_india/commons/domain/usecases/refresh_token_usecase.dart';
import 'package:trees_india/commons/domain/usecases/verify_otp_usecase.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:trees_india/commons/utils/services/auth_notifier.dart';
import 'package:trees_india/commons/utils/services/centralized_local_storage_service.dart';
import 'package:trees_india/commons/utils/services/notification_service.dart';
import 'package:trees_india/pages/login_page/domain/entities/login_request_entity.dart';
import 'package:trees_india/pages/login_page/domain/usecases/login_usecase.dart';
import 'package:trees_india/pages/register_page/domain/entities/register_request_entity.dart';
import 'package:trees_india/pages/register_page/domain/usecases/register_usecase.dart';

class AuthFlowNotifier extends StateNotifier<auth_flow.AuthFlowStateModel>
    with ResettableNotifier<auth_flow.AuthFlowStateModel> {
  final LoginUsecase loginUsecase;
  final RegisterUsecase registerUsecase;
  final VerifyOtpUsecase verifyOtpUsecase;
  final RefreshTokenUsecase refreshTokenUsecase;
  final GetUserProfileUsecase getUserProfileUsecase;
  final CentralizedLocalStorageService localStorageService;
  final NotificationService notificationService;
  final Ref ref;
  bool _mounted = true;

  AuthFlowNotifier({
    required this.loginUsecase,
    required this.registerUsecase,
    required this.verifyOtpUsecase,
    required this.refreshTokenUsecase,
    required this.getUserProfileUsecase,
    required this.localStorageService,
    required this.notificationService,
    required this.ref,
  }) : super(const auth_flow.AuthFlowStateModel());

  @override
  void dispose() {
    _mounted = false;
    super.dispose();
  }

  // Removed unused method _checkMounted

  @override
  void reset() {
    if (!_mounted) return;
    state = const auth_flow.AuthFlowStateModel();
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
      state: auth_flow.AuthFlowState.loadingLogin,
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
          state: auth_flow.AuthFlowState.loginSuccess,
          isLoading: false,
          successMessage: response.message,
        );
        // Show success message
        notificationService.showSuccessSnackBar(response.message);
      } else {
        if (!_mounted) return;
        state = state.copyWith(
          state: auth_flow.AuthFlowState.error,
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
        state: auth_flow.AuthFlowState.error,
        isLoading: false,
        errorMessage: errorMessage,
      );

      // Show error message
      notificationService.showErrorSnackBar(errorMessage);
    }
  }

  Future<void> register(String phoneNumber) async {
    if (!_mounted) return;
    state = state.copyWith(
      state: auth_flow.AuthFlowState.loadingRegister,
      phoneNumber: phoneNumber,
      isLoading: true,
      errorMessage: null,
      successMessage: null,
    );

    try {
      final response =
          await registerUsecase(RegisterRequestEntity(phone: phoneNumber));

      if (!_mounted) return;

      debugPrint(
          "AuthFlowNotifier received response: success=${response.success}, message=${response.message}");

      if (response.success) {
        state = state.copyWith(
          state: auth_flow.AuthFlowState.registerSuccess,
          isLoading: false,
          successMessage: response.message,
        );
        // Show success message
        notificationService.showSuccessSnackBar(response.message);
      } else {
        // Handle error response (including 409 "User already exists")
        debugPrint("Register failed with message: ${response.message}");
        state = state.copyWith(
          state: auth_flow.AuthFlowState.error,
          isLoading: false,
          errorMessage: response.message,
        );
        debugPrint("Error state set - errorMessage: ${state.errorMessage}");
        // Show error message
        notificationService.showErrorSnackBar(response.message);
      }
    } catch (e) {
      debugPrint('Register exception: $e');
      if (!_mounted) return;
      state = state.copyWith(
        state: auth_flow.AuthFlowState.error,
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      debugPrint("Exception caught - error: $e");
      debugPrint("Exception caught - errorMessage: ${state.errorMessage}");
      // Show error message
      notificationService.showErrorSnackBar(
        e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> verifyOtp(String otp) async {
    if (state.phoneNumber == null) {
      state = state.copyWith(
        state: auth_flow.AuthFlowState.error,
        errorMessage: 'Phone number is required for OTP verification.',
      );
      return;
    }

    state = state.copyWith(
      state: auth_flow.AuthFlowState.loadingOtpVerification,
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
        // Save tokens to local storage
        await _saveTokensToStorage(
            response.data!.accessToken, response.data!.refreshToken);

        // Fetch user profile and save complete user data
        await _fetchAndSaveUserProfile(
            response.data!.accessToken, response.data!.refreshToken);

        if (!_mounted) return;
        state = state.copyWith(
          state: auth_flow.AuthFlowState.authenticationSuccess,
          isLoading: false,
          successMessage: response.message,
        );

        // Show success message
        notificationService.showSuccessSnackBar(response.message);

        // Update the main auth notifier
        await ref.read(authProvider.notifier).checkAuthState();
      } else {
        state = state.copyWith(
          state: auth_flow.AuthFlowState.error,
          isLoading: false,
          errorMessage: response.message,
        );
        // Show error message
        notificationService.showErrorSnackBar(response.message);
      }
    } catch (e) {
      debugPrint('OTP verification error: $e');
      state = state.copyWith(
        state: auth_flow.AuthFlowState.error,
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
      final tokenModel = TokenModel(
        authToken: accessToken,
        refreshToken: refreshToken,
      );

      // Create a minimal user model with just tokens
      final userModel = UserModel(
        userId: null,
        fullName: null,
        email: null,
        userImage: null,
        token: tokenModel,
      );

      await localStorageService.saveData('user_profile', userModel.toJson());
      debugPrint('Tokens saved to local storage successfully');
    } catch (e) {
      debugPrint('Error saving tokens to storage: $e');
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

        // Create complete user model with profile data and tokens
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

        await localStorageService.saveData(
            'user_profile', completeUserModel.toJson());
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
    state = const auth_flow.AuthFlowStateModel();
  }
}
