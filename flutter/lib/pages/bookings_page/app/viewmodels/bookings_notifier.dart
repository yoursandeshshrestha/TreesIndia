import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:trees_india/commons/environment/global_environment.dart';
import '../../domain/usecases/get_bookings_usecase.dart';
import '../../domain/usecases/cancel_booking_usecase.dart';
import '../../domain/usecases/reject_quote_usecase.dart';
import '../../domain/usecases/accept_quote_usecase.dart';
import '../../domain/usecases/create_quote_payment_usecase.dart';
import '../../domain/usecases/verify_quote_payment_usecase.dart';
import '../../domain/usecases/process_wallet_quote_payment_usecase.dart';
import '../../../booking_page/domain/usecases/get_booking_config_usecase.dart';
import '../../../booking_page/domain/usecases/get_available_slots_usecase.dart';
import '../../domain/entities/booking_details_entity.dart';
import '../../domain/entities/quote_payment_response_entity.dart';
import '../../../booking_page/domain/entities/booking_config_entity.dart';
import '../../../booking_page/domain/entities/available_slot_entity.dart';
import 'bookings_state.dart';

class BookingsNotifier extends StateNotifier<BookingsState> {
  final GetBookingsUseCase getBookingsUseCase;
  final CancelBookingUseCase cancelBookingUseCase;
  final RejectQuoteUseCase rejectQuoteUseCase;
  final AcceptQuoteUseCase acceptQuoteUseCase;
  final CreateQuotePaymentUseCase createQuotePaymentUseCase;
  final VerifyQuotePaymentUseCase verifyQuotePaymentUseCase;
  final ProcessWalletQuotePaymentUseCase processWalletQuotePaymentUseCase;
  final GetBookingConfigUseCase getBookingConfigUseCase;
  final GetAvailableSlotsUseCase getAvailableSlotsUseCase;
  Timer? _autoRefreshTimer;
  final Razorpay razorpay;

  // Store current payment bookingId to ensure it's available after Razorpay success
  int? _currentPaymentBookingId;

  BookingsNotifier({
    required this.getBookingsUseCase,
    required this.cancelBookingUseCase,
    required this.rejectQuoteUseCase,
    required this.acceptQuoteUseCase,
    required this.createQuotePaymentUseCase,
    required this.verifyQuotePaymentUseCase,
    required this.processWalletQuotePaymentUseCase,
    required this.getBookingConfigUseCase,
    required this.getAvailableSlotsUseCase,
    required this.razorpay,
  }) : super(const BookingsState()) {
    _startAutoRefresh();
    razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  void _startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 60), (timer) {
      if (state.currentBookings.isNotEmpty) {
        _refreshCurrentTab();
      }
    });
  }

  void _refreshCurrentTab() {
    switch (state.currentTab) {
      case BookingTab.all:
        getBookings(tab: BookingTab.all, isRefresh: true);
        break;
      case BookingTab.upcoming:
        getBookings(tab: BookingTab.upcoming, isRefresh: true);
        break;
      case BookingTab.completed:
        getBookings(tab: BookingTab.completed, isRefresh: true);
        break;
      case BookingTab.cancelled:
        getBookings(tab: BookingTab.cancelled, isRefresh: true);
        break;
    }
  }

  void switchTab(BookingTab tab) {
    state = state.copyWith(currentTab: tab);

    // Load data for the new tab if it's empty
    if (state.currentBookings.isEmpty) {
      getBookings(tab: tab, page: 1);
    }
  }

  Future<void> getBookings({
    BookingTab tab = BookingTab.all,
    bool isRefresh = false,
    int? page,
  }) async {
    final currentPage = page ?? state.currentTabPage;

    if (isRefresh) {
      state = state.copyWith(
        isRefreshing: true,
        errorMessage: '',
      );
    } else {
      state = state.copyWith(
        status: BookingsStatus.loading,
        errorMessage: '',
      );
    }

    try {
      final response = await getBookingsUseCase.call(
        page: isRefresh ? 1 : currentPage,
        limit: 10,
        tab: tab,
      );

      final newBookings = response.bookings;
      final hasMore = response.pagination.page < response.pagination.totalPages;

      if (isRefresh) {
        _updateTabBookings(tab, newBookings, 2, hasMore);
        state = state.copyWith(isRefreshing: false);
      } else {
        final updatedBookings = currentPage == 1
            ? newBookings
            : [...state.currentBookings, ...newBookings];
        _updateTabBookings(tab, updatedBookings, currentPage + 1, hasMore);
        state = state.copyWith(
          status: BookingsStatus.success,
          isLoadingMore: false,
        );
      }
    } catch (e) {
      if (isRefresh) {
        state = state.copyWith(
          isRefreshing: false,
          errorMessage: e.toString(),
        );
      } else {
        state = state.copyWith(
          status: BookingsStatus.failure,
          isLoadingMore: false,
          errorMessage: e.toString(),
        );
      }
    }
  }

  void _updateTabBookings(BookingTab tab, List<BookingDetailsEntity> bookings,
      int nextPage, bool hasMore) {
    switch (tab) {
      case BookingTab.all:
        state = state.copyWith(
          allBookings: bookings,
          allCurrentPage: nextPage,
          allHasMore: hasMore,
        );
        break;
      case BookingTab.upcoming:
        state = state.copyWith(
          upcomingBookings: bookings,
          upcomingCurrentPage: nextPage,
          upcomingHasMore: hasMore,
        );
        break;
      case BookingTab.completed:
        state = state.copyWith(
          completedBookings: bookings,
          completedCurrentPage: nextPage,
          completedHasMore: hasMore,
        );
        break;
      case BookingTab.cancelled:
        state = state.copyWith(
          cancelledBookings: bookings,
          cancelledCurrentPage: nextPage,
          cancelledHasMore: hasMore,
        );
        break;
    }
  }

  Future<void> loadMoreBookings() async {
    if (state.isLoadingMore || !state.currentTabHasMore) return;

    state = state.copyWith(isLoadingMore: true);

    try {
      final response = await getBookingsUseCase.call(
        page: state.currentTabPage,
        limit: 10,
        tab: state.currentTab,
      );

      final newBookings = response.bookings;
      final hasMore = response.pagination.page < response.pagination.totalPages;

      final updatedBookings = [...state.currentBookings, ...newBookings];
      _updateTabBookings(
          state.currentTab, updatedBookings, state.currentTabPage + 1, hasMore);

      state = state.copyWith(isLoadingMore: false);
    } catch (e) {
      state = state.copyWith(
        isLoadingMore: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> cancelBooking({
    required int bookingId,
    required String reason,
    String? cancellationReason,
  }) async {
    state = state.copyWith(
      isCancelling: true,
      errorMessage: '',
    );

    try {
      await cancelBookingUseCase.call(
        bookingId: bookingId,
        reason: reason,
        cancellationReason: cancellationReason,
      );

      // Update the booking status in all relevant tab lists
      refresh();
    } catch (e) {
      state = state.copyWith(
        isCancelling: false,
        errorMessage: e.toString(),
      );
      rethrow;
    } finally {
      state = state.copyWith(isCancelling: false);
    }
  }

  Future<void> rejectQuote({
    required int bookingId,
    String reason = "Quote rejected via mobile app",
  }) async {
    state = state.copyWith(
      isRejectingQuote: true,
      errorMessage: '',
    );

    try {
      await rejectQuoteUseCase.call(
        bookingId: bookingId,
        reason: reason,
      );

      state = state.copyWith(
        isRejectingQuote: false,
        errorMessage: '',
      );

      // Refresh the current tab to get updated data
      refresh();
    } catch (e) {
      state = state.copyWith(
        isRejectingQuote: false,
        errorMessage: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> acceptQuote({
    required int bookingId,
    String notes = "Quote accepted via mobile app",
  }) async {
    state = state.copyWith(
      isAcceptingQuote: true,
      errorMessage: '',
    );

    try {
      await acceptQuoteUseCase.call(
        bookingId: bookingId,
        notes: notes,
      );

      state = state.copyWith(
        isAcceptingQuote: false,
        errorMessage: '',
      );

      // Refresh the current tab to get updated data
      refresh();
    } catch (e) {
      state = state.copyWith(
        isAcceptingQuote: false,
        errorMessage: e.toString(),
      );
      rethrow;
    }
  }

  void refresh() {
    _refreshCurrentTab();
  }

  Future<void> loadBookingConfig() async {
    state = state.copyWith(isConfigLoading: true);
    try {
      final config = await getBookingConfigUseCase.call();
      state = state.copyWith(
        status: BookingsStatus.success,
        bookingConfig: config,
        isConfigLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        status: BookingsStatus.failure,
        errorMessage: e.toString(),
        isConfigLoading: false,
      );
    }
  }

  Future<void> loadAvailableSlots(int serviceId, String date) async {
    state = state.copyWith(isSlotsFetching: true);
    try {
      final slots = await getAvailableSlotsUseCase.call(serviceId, date);
      state = state.copyWith(
        status: BookingsStatus.success,
        availableSlots: slots,
        isSlotsFetching: false,
      );
    } catch (e) {
      state = state.copyWith(
        status: BookingsStatus.failure,
        errorMessage: e.toString(),
        isSlotsFetching: false,
      );
    }
  }

  Future<void> createQuotePayment({
    required int bookingId,
    required String scheduledDate,
    required String scheduledTime,
    required int amount,
  }) async {
    state = state.copyWith(isPaymentProcessing: true);

    try {
      final response = await createQuotePaymentUseCase.call(
        bookingId: bookingId,
        scheduledDate: scheduledDate,
        scheduledTime: scheduledTime,
        amount: amount,
      );

      state = state.copyWith(
          isPaymentProcessing: false, quotePaymentResponse: response);
      if (response.success) {
        // Store the bookingId for payment verification
        _currentPaymentBookingId = bookingId;
        _openRazorpayCheckout(response);
      }
    } catch (e) {
      // Clear stored bookingId on error
      _currentPaymentBookingId = null;
      state = state.copyWith(
        isPaymentProcessing: false,
        errorMessage: e.toString(),
      );
      rethrow;
    }
  }

  void _openRazorpayCheckout(QuotePaymentResponseEntity response) {
    final paymentOrder = response.data.paymentOrder;
    final options = {
      'key': GlobalEnvironment.razorpayKey,
      'amount': paymentOrder.amount,
      'currency': paymentOrder.currency,
      'order_id': paymentOrder.id,
      'receipt': paymentOrder.receipt,
      'name': 'Trees India',
      'description': 'Quote Acceptance Payment',
      'prefill': {'contact': '', 'email': ''}
    };

    try {
      razorpay.open(options);
    } catch (error) {
      // Clear stored bookingId on error
      _currentPaymentBookingId = null;
      state = state.copyWith(
        status: BookingsStatus.failure,
        errorMessage: 'Failed to open payment gateway: $error',
      );
    }
  }

  Future<void> verifyQuotePayment({
    required int bookingId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    state = state.copyWith(isPaymentProcessing: true);

    try {
      await verifyQuotePaymentUseCase.call(
        bookingId: bookingId,
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
      );

      state = state.copyWith(
        isPaymentProcessing: false,
        isRazorpayPaymentSuccess: true,
      );
      // Clear stored bookingId after successful verification
      _currentPaymentBookingId = null;
      refresh(); // Refresh bookings after successful payment
    } catch (e) {
      // Clear stored bookingId on verification error
      _currentPaymentBookingId = null;
      state = state.copyWith(
        isPaymentProcessing: false,
        errorMessage: e.toString(),
      );
      rethrow;
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    // Use stored bookingId for payment verification
    final bookingId = _currentPaymentBookingId;

    if (bookingId != null) {
      verifyQuotePayment(
        bookingId: bookingId,
        razorpayOrderId: response.orderId ?? '',
        razorpayPaymentId: response.paymentId ?? '',
        razorpaySignature: response.signature ?? '',
      );
    } else {
      state = state.copyWith(
        status: BookingsStatus.failure,
        errorMessage: 'Unable to verify payment: Booking ID not found',
      );
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    // Clear stored bookingId on payment error
    _currentPaymentBookingId = null;

    state = state.copyWith(
      status: BookingsStatus.failure,
      errorMessage: response.message ?? 'Payment failed',
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    // Clear stored bookingId on external wallet selection
    _currentPaymentBookingId = null;

    state = state.copyWith(
      status: BookingsStatus.failure,
      errorMessage: 'External wallet selected: ${response.walletName}',
    );
  }

  Future<void> processWalletQuotePayment({
    required int bookingId,
    required String scheduledDate,
    required String scheduledTime,
    required int amount,
  }) async {
    state = state.copyWith(isPaymentProcessing: true);

    try {
      await processWalletQuotePaymentUseCase.call(
        bookingId: bookingId,
        scheduledDate: scheduledDate,
        scheduledTime: scheduledTime,
        amount: amount,
      );

      state = state.copyWith(
        isPaymentProcessing: false,
        isWalletPaymentSuccess: true,
      );
      refresh(); // Refresh bookings after successful payment
    } catch (e) {
      state = state.copyWith(
        isPaymentProcessing: false,
        errorMessage: e.toString(),
      );
      rethrow;
    }
  }

  /// Clear payment-related data
  void _clearPaymentData() {
    _currentPaymentBookingId = null;
    state = state.copyWith(
      quotePaymentResponse: null,
      isPaymentProcessing: false,
      isWalletPaymentSuccess: false,
      isRazorpayPaymentSuccess: false,
    );
  }

  /// Public method to clear payment data (can be called from UI)
  void clearPaymentData() {
    _clearPaymentData();
  }

  /// Check if there's an ongoing payment
  bool get hasOngoingPayment => _currentPaymentBookingId != null;

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    _clearPaymentData();
    super.dispose();
  }
}
