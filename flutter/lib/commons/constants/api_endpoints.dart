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
    searchServices,
    searchSuggestions,
    popularServices,
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
    createInquiryBookingWithWallet,
    serviceAvailability,
    verifyPayment,
    verifyInquiryPayment,
    bookings,
    cancelBooking,
    rejectQuote,
    acceptQuote,
    createQuotePayment,
    verifyQuotePayment,
    walletQuotePayment,
    addresses,
    createAddress,
    updateAddress,
    deleteAddress,
    registerDevice,
    getUserDevices,
    unregisterDevice,
    getAssignments,
    acceptAssignment,
    rejectAssignment,
    startWork,
    completeWork,
    chatRooms,
    chatMessages,
    sendMessage,
    markMessageRead,
    bookingChatRoom,
    getTrackingStatus,
    getUserProperties,
    createProperty,
    deleteProperty,
    mySubscription,
    subscriptionHistory,
    subscriptionPlans,
    createPaymentOrder,
    completePurchase,
    getUserVendors,
    createVendor,
    getProperties,
    getPropertyDetails,
    projectsStats,
    vendorsStats,
    workersStats,
    getVendors,
    getVendorDetails,
    getWorkers,
    getWorkerDetails,
    getProjects,
    getProjectDetails,
    createSegmentPayment,
    verifySegmentPayment,
    notifications,
    unreadCount,
    markAllNotificationsAsRead,
    submitWorkerApplication,
    getUserApplicationStatus,
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

  static ApiEndpoint searchServices = ApiEndpoint(
    path: '/services/search',
    requiresAuth: false,
  );

  static ApiEndpoint searchSuggestions = ApiEndpoint(
    path: '/services/search/suggestions',
    requiresAuth: false,
  );

  static ApiEndpoint popularServices = ApiEndpoint(
    path: '/services/popular',
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

  static ApiEndpoint createInquiryBookingWithWallet = ApiEndpoint(
    path: '/bookings/inquiry/wallet',
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

  static ApiEndpoint rejectQuote = ApiEndpoint(
    path: '/bookings/{bookingId}/reject-quote',
    requiresAuth: true,
  );

  static ApiEndpoint acceptQuote = ApiEndpoint(
    path: '/bookings/{bookingId}/accept-quote',
    requiresAuth: true,
  );

  static ApiEndpoint createQuotePayment = ApiEndpoint(
    path: '/bookings/{bookingId}/create-quote-payment',
    requiresAuth: true,
  );

  static ApiEndpoint verifyQuotePayment = ApiEndpoint(
    path: '/bookings/{bookingId}/verify-quote-payment',
    requiresAuth: true,
  );

  static ApiEndpoint walletQuotePayment = ApiEndpoint(
    path: '/bookings/{bookingId}/wallet-payment',
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

  static ApiEndpoint registerDevice = ApiEndpoint(
    path: '/notifications/register-device',
    requiresAuth: true,
  );

  static ApiEndpoint getUserDevices = ApiEndpoint(
    path: '/notifications/devices',
    requiresAuth: true,
  );

  static ApiEndpoint unregisterDevice = ApiEndpoint(
    path: '/notifications/unregister-device',
    requiresAuth: true,
  );

  static ApiEndpoint getAssignments = ApiEndpoint(
    path: '/worker/assignments',
    requiresAuth: true,
  );

  static ApiEndpoint acceptAssignment = ApiEndpoint(
    path: '/worker/assignments/{assignmentId}/accept',
    requiresAuth: true,
  );

  static ApiEndpoint rejectAssignment = ApiEndpoint(
    path: '/worker/assignments/{assignmentId}/reject',
    requiresAuth: true,
  );

  static ApiEndpoint startWork = ApiEndpoint(
    path: '/worker/assignments/{assignmentId}/start',
    requiresAuth: true,
  );

  static ApiEndpoint completeWork = ApiEndpoint(
    path: '/worker/assignments/{assignmentId}/complete',
    requiresAuth: true,
  );

  static ApiEndpoint chatRooms = ApiEndpoint(
    path: '/chat/rooms',
    requiresAuth: true,
  );

  static ApiEndpoint chatMessages = ApiEndpoint(
    path: '/chat/rooms/{roomId}/messages',
    requiresAuth: true,
  );

  static ApiEndpoint sendMessage = ApiEndpoint(
    path: '/chat/rooms/{roomId}/messages',
    requiresAuth: true,
  );

  static ApiEndpoint markMessageRead = ApiEndpoint(
    path: '/chat/messages/{messageId}/read',
    requiresAuth: true,
  );

  static ApiEndpoint bookingChatRoom = ApiEndpoint(
    path: '/chat/bookings/{bookingId}/room',
    requiresAuth: true,
  );

  // Location Tracking Endpoints
  static ApiEndpoint getTrackingStatus = ApiEndpoint(
    path: '/assignments/{assignmentId}/tracking-status',
    requiresAuth: true,
  );

  // Property Endpoints
  static ApiEndpoint getUserProperties = ApiEndpoint(
    path: '/user/properties',
    requiresAuth: true,
  );

  static ApiEndpoint createProperty = ApiEndpoint(
    path: '/user/properties',
    requiresAuth: true,
  );

  static ApiEndpoint deleteProperty = ApiEndpoint(
    path: '/user/properties/{propertyId}',
    requiresAuth: true,
  );

  // Subscription Endpoints
  static ApiEndpoint mySubscription = ApiEndpoint(
    path: '/subscriptions/my-subscription',
    requiresAuth: true,
  );

  static ApiEndpoint subscriptionHistory = ApiEndpoint(
    path: '/subscriptions/history',
    requiresAuth: true,
  );

  static ApiEndpoint subscriptionPlans = ApiEndpoint(
    path: '/subscription-plans',
    requiresAuth: true,
  );

  static ApiEndpoint createPaymentOrder = ApiEndpoint(
    path: '/subscriptions/create-payment-order',
    requiresAuth: true,
  );

  static ApiEndpoint completePurchase = ApiEndpoint(
    path: '/subscriptions/complete-purchase',
    requiresAuth: true,
  );

  // Vendor Endpoints
  static ApiEndpoint getUserVendors = ApiEndpoint(
    path: '/vendors',
    requiresAuth: true,
  );

  static ApiEndpoint createVendor = ApiEndpoint(
    path: '/vendors',
    requiresAuth: true,
  );

  static ApiEndpoint getProperties = ApiEndpoint(
    path: '/properties',
    requiresAuth: true,
  );

  static ApiEndpoint getPropertyDetails = ApiEndpoint(
    path: '/properties/{id}',
    requiresAuth: true,
  );

  // Stats Endpoints
  static ApiEndpoint projectsStats = ApiEndpoint(
    path: '/projects/stats',
    requiresAuth: true,
  );

  static ApiEndpoint vendorsStats = ApiEndpoint(
    path: '/vendors/stats',
    requiresAuth: true,
  );

  static ApiEndpoint workersStats = ApiEndpoint(
    path: '/workers/stats',
    requiresAuth: true,
  );
  static ApiEndpoint getVendors = ApiEndpoint(
    path: '/public/vendors',
    requiresAuth: true,
  );

  static ApiEndpoint getVendorDetails = ApiEndpoint(
    path: '/vendors/{vendorId}',
    requiresAuth: true,
  );

  static ApiEndpoint getWorkers = ApiEndpoint(
    path: '/public/workers',
    requiresAuth: false,
  );

  static ApiEndpoint getWorkerDetails = ApiEndpoint(
    path: '/public/workers/{workerId}',
    requiresAuth: false,
  );

  static ApiEndpoint getProjects = ApiEndpoint(
    path: '/projects',
    requiresAuth: true,
  );

  static ApiEndpoint getProjectDetails = ApiEndpoint(
    path: '/projects/{projectId}',
    requiresAuth: true,
  );

  static ApiEndpoint createSegmentPayment = ApiEndpoint(
    path: '/bookings/{bookindId}/payment-segments/pay',
    requiresAuth: true,
  );

  static ApiEndpoint verifySegmentPayment = ApiEndpoint(
    path: '/bookings/{bookindId}/payment-segments/verify',
    requiresAuth: true,
  );

  // Notification Endpoints
  static ApiEndpoint notifications = ApiEndpoint(
    path: '/in-app-notifications',
    requiresAuth: true,
  );

  static ApiEndpoint unreadCount = ApiEndpoint(
    path: '/in-app-notifications/unread-count',
    requiresAuth: true,
  );

  static ApiEndpoint markAllNotificationsAsRead = ApiEndpoint(
    path: '/in-app-notifications/read-all',
    requiresAuth: true,
  );

  // Worker Application Endpoints
  static ApiEndpoint submitWorkerApplication = ApiEndpoint(
    path: '/role-applications/worker',
    requiresAuth: true,
  );

  static ApiEndpoint getUserApplicationStatus = ApiEndpoint(
    path: '/role-applications/me',
    requiresAuth: true,
  );

  // HTTP Headers
  static const String contentType = AppConstants.contentType;
  static const String accept = AppConstants.accept;
}
