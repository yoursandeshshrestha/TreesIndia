import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../../../commons/presenters/providers/dio_provider.dart';
import '../../../../commons/presenters/providers/error_handler_provider.dart';
import '../../data/datasources/bookings_datasource.dart';
import '../../data/repositories/bookings_repository_impl.dart';
import '../../domain/repositories/bookings_repository.dart';
import '../../domain/usecases/get_bookings_usecase.dart';
import '../../domain/usecases/cancel_booking_usecase.dart';
import '../../domain/usecases/reject_quote_usecase.dart';
import '../../domain/usecases/accept_quote_usecase.dart';
import '../../domain/usecases/create_quote_payment_usecase.dart';
import '../../domain/usecases/verify_quote_payment_usecase.dart';
import '../../domain/usecases/process_wallet_quote_payment_usecase.dart';
import '../../domain/usecases/create_segment_payment_usecase.dart';
import '../../domain/usecases/verify_segment_payment_usecase.dart';
import '../../../booking_page/app/providers/booking_providers.dart';
import '../viewmodels/bookings_notifier.dart';
import '../viewmodels/bookings_state.dart';

final bookingsDatasourceProvider = Provider<BookingsDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return BookingsDatasource(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

final bookingsRepositoryProvider = Provider<BookingsRepository>((ref) {
  final datasource = ref.read(bookingsDatasourceProvider);

  return BookingsRepositoryImpl(datasource: datasource);
});

final getBookingsUseCaseProvider = Provider<GetBookingsUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return GetBookingsUseCase(repository: repository);
});

final cancelBookingUseCaseProvider = Provider<CancelBookingUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return CancelBookingUseCase(repository: repository);
});

final rejectQuoteUseCaseProvider = Provider<RejectQuoteUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return RejectQuoteUseCase(repository: repository);
});

final acceptQuoteUseCaseProvider = Provider<AcceptQuoteUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return AcceptQuoteUseCase(repository: repository);
});

final createQuotePaymentUseCaseProvider =
    Provider<CreateQuotePaymentUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return CreateQuotePaymentUseCase(repository: repository);
});

final verifyQuotePaymentUseCaseProvider =
    Provider<VerifyQuotePaymentUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return VerifyQuotePaymentUseCase(repository: repository);
});

final processWalletQuotePaymentUseCaseProvider =
    Provider<ProcessWalletQuotePaymentUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return ProcessWalletQuotePaymentUseCase(repository: repository);
});

final createSegmentPaymentUseCaseProvider =
    Provider<CreateSegmentPaymentUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return CreateSegmentPaymentUseCase(repository: repository);
});

final verifySegmentPaymentUseCaseProvider =
    Provider<VerifySegmentPaymentUseCase>((ref) {
  final repository = ref.read(bookingsRepositoryProvider);

  return VerifySegmentPaymentUseCase(repository: repository);
});

final bookingsNotifierProvider =
    StateNotifierProvider<BookingsNotifier, BookingsState>((ref) {
  final getBookingsUseCase = ref.read(getBookingsUseCaseProvider);
  final cancelBookingUseCase = ref.read(cancelBookingUseCaseProvider);
  final rejectQuoteUseCase = ref.read(rejectQuoteUseCaseProvider);
  final acceptQuoteUseCase = ref.read(acceptQuoteUseCaseProvider);
  final createQuotePaymentUseCase = ref.read(createQuotePaymentUseCaseProvider);
  final verifyQuotePaymentUseCase = ref.read(verifyQuotePaymentUseCaseProvider);
  final processWalletQuotePaymentUseCase =
      ref.read(processWalletQuotePaymentUseCaseProvider);
  final createSegmentPaymentUseCase = ref.read(createSegmentPaymentUseCaseProvider);
  final verifySegmentPaymentUseCase = ref.read(verifySegmentPaymentUseCaseProvider);
  final getBookingConfigUseCase = ref.read(getBookingConfigUseCaseProvider);
  final getAvailableSlotsUseCase = ref.read(getAvailableSlotsUseCaseProvider);
  final razorpayProvider = Provider<Razorpay>((ref) {
    return Razorpay();
  });
  return BookingsNotifier(
    getBookingsUseCase: getBookingsUseCase,
    cancelBookingUseCase: cancelBookingUseCase,
    rejectQuoteUseCase: rejectQuoteUseCase,
    acceptQuoteUseCase: acceptQuoteUseCase,
    createQuotePaymentUseCase: createQuotePaymentUseCase,
    verifyQuotePaymentUseCase: verifyQuotePaymentUseCase,
    processWalletQuotePaymentUseCase: processWalletQuotePaymentUseCase,
    createSegmentPaymentUseCase: createSegmentPaymentUseCase,
    verifySegmentPaymentUseCase: verifySegmentPaymentUseCase,
    getBookingConfigUseCase: getBookingConfigUseCase,
    getAvailableSlotsUseCase: getAvailableSlotsUseCase,
    razorpay: ref.read(razorpayProvider),
  );
});
