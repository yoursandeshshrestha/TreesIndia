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
    categories,
    subcategories,
    services,
    walletSummary,
    walletTransactions,
    walletTransactionsByType,
    walletRecharge,
    walletRechargeComplete,
    walletRechargeCancel,
    bookingConfig,
    availableSlots,
    createBooking,
    createWalletBooking,
    createInquiryBooking,
    serviceAvailability,
    verifyPayment,
    verifyInquiryPayment,
    bookings,
    cancelBooking,
    addresses,
    createAddress,
    updateAddress,
    deleteAddress,
  ];

  static ApiEndpoint requestOtp = ApiEndpoint(
    path: '/auth/request-otp',
    requiresAuth: false,
  );

  static ApiEndpoint verifyOtp = ApiEndpoint(
    path: '/auth/verify-otp',
    requiresAuth: false,
  );
  static ApiEndpoint refreshToken = ApiEndpoint(
    path: '/auth/refresh-token',
    requiresAuth: false,
  );
  static ApiEndpoint resetPassword = ApiEndpoint(
    path: '/Mobvalidatelogin',
    requiresAuth: false,
  );
  static ApiEndpoint changePassword = ApiEndpoint(
    path: '/Mobvalidatelogin',
    requiresAuth: false,
  );
  static ApiEndpoint userProfile = ApiEndpoint(
    path: '/users/profile',
    requiresAuth: true,
  );
  static ApiEndpoint uploadAvatar = ApiEndpoint(
    path: '/users/upload-avatar',
    requiresAuth: true,
  );

  static ApiEndpoint locationAutocomplete = ApiEndpoint(
    path: '/places/autocomplete',
    requiresAuth: false,
  );

  static ApiEndpoint categories = ApiEndpoint(
    path: '/categories',
    requiresAuth: false,
  );

  static ApiEndpoint subcategories = ApiEndpoint(
    path: '/subcategories/category/{categoryId}',
    requiresAuth: false,
  );

  static ApiEndpoint services = ApiEndpoint(
    path: '/services',
    requiresAuth: false,
  );

  static ApiEndpoint walletSummary = ApiEndpoint(
    path: '/wallet/summary',
    requiresAuth: true,
  );
  static ApiEndpoint walletTransactions = ApiEndpoint(
    path: '/wallet/transactions',
    requiresAuth: true,
  );
  static ApiEndpoint walletTransactionsByType = ApiEndpoint(
    path: '/wallet/transactions/type/{type}',
    requiresAuth: true,
  );
  static ApiEndpoint walletRecharge = ApiEndpoint(
    path: '/wallet/recharge',
    requiresAuth: true,
  );
  static ApiEndpoint walletRechargeComplete = ApiEndpoint(
    path: '/wallet/recharge/{rechargeId}/complete',
    requiresAuth: true,
  );
  static ApiEndpoint walletRechargeCancel = ApiEndpoint(
    path: '/wallet/recharge/{rechargeId}/cancel',
    requiresAuth: true,
  );

  static ApiEndpoint bookingConfig = ApiEndpoint(
    path: '/bookings/config',
    requiresAuth: true,
  );

  static ApiEndpoint availableSlots = ApiEndpoint(
    path: '/bookings/available-slots',
    requiresAuth: true,
  );

  static ApiEndpoint createBooking = ApiEndpoint(
    path: '/bookings',
    requiresAuth: true,
  );

  static ApiEndpoint createWalletBooking = ApiEndpoint(
    path: '/bookings/wallet',
    requiresAuth: true,
  );

  static ApiEndpoint createInquiryBooking = ApiEndpoint(
    path: '/bookings/inquiry',
    requiresAuth: true,
  );

  static ApiEndpoint serviceAvailability = ApiEndpoint(
    path: '/service-availability/{id}',
    requiresAuth: true,
  );

  static ApiEndpoint verifyPayment = ApiEndpoint(
    path: '/bookings/{bookingId}/verify-payment',
    requiresAuth: true,
  );

  static ApiEndpoint verifyInquiryPayment = ApiEndpoint(
    path: '/bookings/inquiry/verify-payment',
    requiresAuth: true,
  );

  static ApiEndpoint bookings = ApiEndpoint(
    path: '/bookings',
    requiresAuth: true,
  );

  static ApiEndpoint cancelBooking = ApiEndpoint(
    path: '/bookings/{bookingId}/cancel',
    requiresAuth: true,
  );

  static ApiEndpoint addresses = ApiEndpoint(
    path: '/addresses',
    requiresAuth: true,
  );

  static ApiEndpoint createAddress = ApiEndpoint(
    path: '/addresses',
    requiresAuth: true,
  );

  static ApiEndpoint updateAddress = ApiEndpoint(
    path: '/addresses/{addressId}',
    requiresAuth: true,
  );

  static ApiEndpoint deleteAddress = ApiEndpoint(
    path: '/addresses/{addressId}',
    requiresAuth: true,
  );

  // HTTP Headers
  static const String contentType = AppConstants.contentType;
  static const String accept = AppConstants.accept;
}
