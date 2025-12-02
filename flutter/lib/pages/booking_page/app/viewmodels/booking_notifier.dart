import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:trees_india/pages/booking_page/domain/usecases/create_inquiry_booking_with_wallet_usecase.dart';
import '../../../../commons/environment/global_environment.dart';
import '../../domain/usecases/get_booking_config_usecase.dart';
import '../../domain/usecases/get_available_slots_usecase.dart';
import '../../domain/usecases/create_fixed_booking_usecase.dart';
import '../../domain/usecases/create_wallet_booking_usecase.dart';
import '../../domain/usecases/create_inquiry_booking_usecase.dart';
import '../../domain/usecases/verify_payment_usecase.dart';
import '../../domain/usecases/verify_inquiry_payment_usecase.dart';
import '../../domain/usecases/check_service_availability_usecase.dart';
import '../../domain/entities/booking_entity.dart';
import 'booking_state.dart';

class BookingNotifier extends StateNotifier<BookingState>
    with ResettableNotifier<BookingState> {
  final GetBookingConfigUseCase getBookingConfigUseCase;
  final GetAvailableSlotsUseCase getAvailableSlotsUseCase;
  final CheckServiceAvailabilityUseCase checkServiceAvailabilityUseCase;
  final CreateFixedBookingUseCase createFixedBookingUseCase;
  final CreateInquiryBookingWithWalletUsecase
      createInquiryBookingWithWalletUseCase;
  final CreateWalletBookingUseCase createWalletBookingUseCase;
  final CreateInquiryBookingUseCase createInquiryBookingUseCase;
  final VerifyPaymentUseCase verifyPaymentUseCase;
  final VerifyInquiryPaymentUseCase verifyInquiryPaymentUseCase;
  final Razorpay razorpay;
  final Ref ref;

  int? _currentServiceId;

  BookingNotifier({
    required this.getBookingConfigUseCase,
    required this.getAvailableSlotsUseCase,
    required this.checkServiceAvailabilityUseCase,
    required this.createFixedBookingUseCase,
    required this.createInquiryBookingWithWalletUseCase,
    required this.createWalletBookingUseCase,
    required this.createInquiryBookingUseCase,
    required this.verifyPaymentUseCase,
    required this.verifyInquiryPaymentUseCase,
    required this.razorpay,
    required this.ref,
  }) : super(const BookingState()) {
    razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  void startLoading() {
    state = state.copyWith(status: BookingStatus.loading, isLoading: true);
  }

  void stopLoading() {
    state = state.copyWith(status: BookingStatus.loading, isLoading: false);
  }

  Future<void> loadBookingConfig() async {
    state = state.copyWith(status: BookingStatus.loading, isLoading: true);

    try {
      final config = await getBookingConfigUseCase();
      state = state.copyWith(
        status: BookingStatus.success,
        bookingConfig: config,
        isLoading: false,
      );
    } catch (error) {
      state = state.copyWith(
        status: BookingStatus.failure,
        errorMessage: error.toString(),
        isLoading: false,
      );
    }
  }

  Future<void> loadAvailableSlots(int serviceId, String date) async {
    state = state.copyWith(status: BookingStatus.loading, isLoading: true);

    try {
      final slots = await getAvailableSlotsUseCase(serviceId, date);
      state = state.copyWith(
        status: BookingStatus.success,
        availableSlots: slots,
        selectedDate: date,
        isLoading: false,
      );
    } catch (error) {
      state = state.copyWith(
        status: BookingStatus.failure,
        errorMessage: error.toString(),
        isLoading: false,
      );
    }
  }

  void selectTimeSlot(String time) {
    state = state.copyWith(selectedTime: time);
  }

  Future<bool> checkServiceAvailability(
      int serviceId, String city, String state, String pincode) async {
    try {
      final availability = await checkServiceAvailabilityUseCase(
          serviceId, city, state, pincode);
      return availability.isAvailable;
    } catch (error) {
      return false;
    }
  }

  Future<void> createFixedPriceBooking(
      CreateBookingRequestEntity request) async {
    state = state.copyWith(status: BookingStatus.loading, isLoading: true);

    try {
      final response = await createFixedBookingUseCase(request);
      state = state.copyWith(
        status: BookingStatus.success,
        bookingResponse: response,
        isLoading: false,
      );

      // If payment is required, open Razorpay
      if (response.paymentRequired == true && response.paymentOrder != null) {
        _openRazorpayCheckout(response);
      }
    } catch (error) {
      state = state.copyWith(
        status: BookingStatus.failure,
        errorMessage: error.toString(),
        isLoading: false,
      );
    }
  }

  Future<void> createFixedPriceBookingWithWallet(
      CreateBookingRequestEntity request) async {
    state = state.copyWith(status: BookingStatus.loading, isLoading: true);

    try {
      final response = await createWalletBookingUseCase(request);
      state = state.copyWith(
        status: BookingStatus.success,
        bookingResponse: response,
        isLoading: false,
      );
    } catch (error) {
      state = state.copyWith(
        status: BookingStatus.failure,
        errorMessage: error.toString(),
        isLoading: false,
      );
    }
  }

  Future<void> createInquiryBooking(
      CreateInquiryBookingRequestEntity request) async {
    state = state.copyWith(status: BookingStatus.loading, isLoading: true);

    try {
      final response = await createInquiryBookingUseCase(request);
      state = state.copyWith(
        status: BookingStatus.success,
        inquiryBookingResponse: response,
        isLoading: false,
      );

      // If payment is required, open Razorpay for inquiry fee
      if (response.paymentRequired == true && response.paymentOrder != null) {
        _openInquiryRazorpayCheckout(response, request.serviceId);
      }
    } catch (error) {
      state = state.copyWith(
        status: BookingStatus.failure,
        errorMessage: error.toString(),
        isLoading: false,
      );
    }
  }

  Future<void> createInquiryBookingWithWallet(
      CreateInquiryBookingRequestEntity request) async {
    state = state.copyWith(status: BookingStatus.loading, isLoading: true);

    try {
      final response = await createInquiryBookingWithWalletUseCase(request);
      state = state.copyWith(
        status: BookingStatus.success,
        bookingResponse: response,
        inquiryBookingResponse:
            null, // Explicitly set to null for wallet payment
        isLoading: false,
      );
    } catch (error) {
      state = state.copyWith(
        status: BookingStatus.failure,
        errorMessage: error.toString(),
        isLoading: false,
      );
    }
  }

  void _openRazorpayCheckout(BookingResponseEntity bookingResponse) {
    final paymentOrder = bookingResponse.paymentOrder!;
    final options = {
      'key': GlobalEnvironment.razorpayKey,
      'amount': paymentOrder.amount,
      'currency': paymentOrder.currency,
      'order_id': paymentOrder.id,
      'receipt': paymentOrder.receipt,
      'name': 'Trees India',
      'description': 'Service Booking Payment',
      'prefill': {'contact': '', 'email': ''}
    };

    try {
      razorpay.open(options);
    } catch (error) {
      state = state.copyWith(
        status: BookingStatus.failure,
        errorMessage: 'Failed to open payment gateway: $error',
      );
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    final bookingResponse = state.bookingResponse;
    final inquiryResponse = state.inquiryBookingResponse;

    if (bookingResponse != null) {
      _verifyBookingPayment(
        bookingId: bookingResponse.booking.id,
        razorpayOrderId: response.orderId ?? '',
        razorpayPaymentId: response.paymentId ?? '',
        razorpaySignature: response.signature ?? '',
      );
    } else if (inquiryResponse != null) {
      _verifyInquiryPayment(
        serviceId: _currentServiceId ?? 0,
        razorpayOrderId: response.orderId ?? '',
        razorpayPaymentId: response.paymentId ?? '',
        razorpaySignature: response.signature ?? '',
      );
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    state = state.copyWith(
      status: BookingStatus.failure,
      errorMessage: response.message ?? 'Payment failed',
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    state = state.copyWith(
      status: BookingStatus.failure,
      errorMessage: 'External wallet selected: ${response.walletName}',
    );
  }

  Future<void> _verifyBookingPayment({
    required int bookingId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    state = state.copyWith(status: BookingStatus.loading, isLoading: true);
    try {
      final verifyRequest = VerifyPaymentRequestEntity(
        serviceId: 0, // This is for regular bookings, not inquiry
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId,
        razorpaySignature: razorpaySignature,
      );

      final response = await verifyPaymentUseCase(
        bookingId: bookingId,
        verifyPaymentRequest: verifyRequest,
      );

      state = state.copyWith(
        status: BookingStatus.success,
        bookingResponse: response,
      );
    } catch (error) {
      state = state.copyWith(
        status: BookingStatus.failure,
        errorMessage: 'Failed to verify payment: $error',
      );
    } finally {
      state = state.copyWith(status: BookingStatus.loading, isLoading: false);
    }
  }

  void _openInquiryRazorpayCheckout(
      InquiryBookingResponseEntity inquiryResponse, int serviceId) {
    _currentServiceId = serviceId;
    final paymentOrder = inquiryResponse.paymentOrder!;
    final options = {
      'key': GlobalEnvironment.razorpayKey,
      'amount': paymentOrder.amount,
      'currency': paymentOrder.currency,
      'order_id': paymentOrder.id,
      'receipt': paymentOrder.receipt,
      'name': 'Trees India',
      'description': 'Inquiry Fee Payment',
      'prefill': {'contact': '', 'email': ''}
    };

    try {
      razorpay.open(options);
    } catch (error) {
      state = state.copyWith(
        status: BookingStatus.failure,
        errorMessage: 'Failed to open payment gateway: $error',
      );
    }
  }

  Future<void> _verifyInquiryPayment({
    required int serviceId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    state = state.copyWith(status: BookingStatus.loading, isLoading: true);
    try {
      final verifyRequest = VerifyPaymentRequestEntity(
        serviceId: serviceId,
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId,
        razorpaySignature: razorpaySignature,
      );

      final response = await verifyInquiryPaymentUseCase(verifyRequest);

      state = state.copyWith(
        status: BookingStatus.success,
        bookingResponse: response,
        inquiryBookingResponse: const InquiryBookingResponseEntity(),
      );
      _currentServiceId = null;
    } catch (error) {
      state = state.copyWith(
        status: BookingStatus.failure,
        errorMessage: 'Failed to verify payment: $error',
      );
    } finally {
      state = state.copyWith(status: BookingStatus.loading, isLoading: false);
    }
  }

  @override
  void reset() {
    state = const BookingState();
  }

  @override
  void dispose() {
    razorpay.clear();
    super.dispose();
  }
}
