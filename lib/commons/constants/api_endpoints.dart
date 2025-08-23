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

    locationAutocomplete,
    walletSummary,
    walletTransactions,
    walletTransactionsByType,
    walletRecharge,
    walletRechargeComplete,
    walletRechargeCancel,
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

  static ApiEndpoint locationAutocomplete = ApiEndpoint(
    path: '/places/autocomplete',
    requiresAuth: false,
    useRegionBaseUrl: true,
  );

  static ApiEndpoint walletSummary = ApiEndpoint(
    path: '/wallet/summary',
    requiresAuth: true,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint walletTransactions = ApiEndpoint(
    path: '/wallet/transactions',
    requiresAuth: true,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint walletTransactionsByType = ApiEndpoint(
    path: '/wallet/transactions/type/{type}',
    requiresAuth: true,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint walletRecharge = ApiEndpoint(
    path: '/wallet/recharge',
    requiresAuth: true,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint walletRechargeComplete = ApiEndpoint(
    path: '/wallet/recharge/{rechargeId}/complete',
    requiresAuth: true,
    useRegionBaseUrl: true,
  );
  static ApiEndpoint walletRechargeCancel = ApiEndpoint(
    path: '/wallet/recharge/{rechargeId}/cancel',
    requiresAuth: true,
    useRegionBaseUrl: true,
  );

  // HTTP Headers
  static const String contentType = AppConstants.contentType;
  static const String accept = AppConstants.accept;
}
