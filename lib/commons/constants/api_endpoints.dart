import '../data/models/api_endpoint.dart';
import 'app_constants.dart';

class ApiEndpoints {
  static final List<ApiEndpoint> endpoints = [
    requestOtp,
    verifyOtp,
    refreshToken,
    userProfile,
    uploadAvatar,
    resetPassword,
    changePassword,
    signUp,
    locationAutocomplete,
  ];

  static ApiEndpoint requestOtp = ApiEndpoint(
    path: '/auth/request-otp',
    requiresAuth: false,
    useRegionBaseUrl: true,
  );

  static ApiEndpoint verifyOtp = ApiEndpoint(
    path: '/auth/verify-otp',
    requiresAuth: false,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint refreshToken = ApiEndpoint(
    path: '/auth/refresh-token',
    requiresAuth: false,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint resetPassword = ApiEndpoint(
    path: '/Mobvalidatelogin',
    requiresAuth: false,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint changePassword = ApiEndpoint(
    path: '/Mobvalidatelogin',
    requiresAuth: false,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint userProfile = ApiEndpoint(
    path: '/users/profile',
    requiresAuth: true,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint uploadAvatar = ApiEndpoint(
    path: '/users/upload-avatar',
    requiresAuth: true,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint signUp = ApiEndpoint(
    path: '/Mobvalidatelogin',
    requiresAuth: false,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint locationAutocomplete = ApiEndpoint(
    path: '/places/autocomplete',
    requiresAuth: false,
    useRegionBaseUrl: true,
  );

  // HTTP Headers
  static const String contentType = AppConstants.contentType;
  static const String accept = AppConstants.accept;
}
