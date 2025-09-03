import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import 'package:trees_india/pages/booking_page/domain/usecases/create_inquiry_booking_with_wallet_usecase.dart';

import '../../../../commons/presenters/providers/dio_provider.dart';
import '../../data/datasources/booking_remote_datasource.dart';
import '../../data/repositories/booking_repository_impl.dart';
import '../../domain/usecases/check_service_availability_usecase.dart';
import '../../domain/usecases/create_fixed_booking_usecase.dart';
import '../../domain/usecases/create_wallet_booking_usecase.dart';
import '../../domain/usecases/create_inquiry_booking_usecase.dart';
import '../../domain/usecases/get_available_slots_usecase.dart';
import '../../domain/usecases/get_booking_config_usecase.dart';
import '../../domain/usecases/verify_payment_usecase.dart';
import '../../domain/usecases/verify_inquiry_payment_usecase.dart';
import '../viewmodels/booking_notifier.dart';
import '../viewmodels/booking_state.dart';

final bookingRemoteDataSourceProvider =
    Provider<BookingRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return BookingRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

final bookingRepositoryProvider = Provider((ref) {
  final remoteDataSource = ref.read(bookingRemoteDataSourceProvider);
  return BookingRepositoryImpl(remoteDataSource: remoteDataSource);
});

final getBookingConfigUseCaseProvider = Provider((ref) {
  final repository = ref.read(bookingRepositoryProvider);
  return GetBookingConfigUseCase(repository);
});

final getAvailableSlotsUseCaseProvider = Provider((ref) {
  final repository = ref.read(bookingRepositoryProvider);
  return GetAvailableSlotsUseCase(repository);
});

final checkServiceAvailabilityUseCaseProvider = Provider((ref) {
  final repository = ref.read(bookingRepositoryProvider);
  return CheckServiceAvailabilityUseCase(repository);
});

final createFixedBookingUseCaseProvider = Provider((ref) {
  final repository = ref.read(bookingRepositoryProvider);
  return CreateFixedBookingUseCase(repository);
});

final createWalletBookingUseCaseProvider = Provider((ref) {
  final repository = ref.read(bookingRepositoryProvider);
  return CreateWalletBookingUseCase(repository);
});

final createInquiryBookingUseCaseProvider = Provider((ref) {
  final repository = ref.read(bookingRepositoryProvider);
  return CreateInquiryBookingUseCase(repository);
});

final verifyPaymentUseCaseProvider = Provider((ref) {
  final repository = ref.read(bookingRepositoryProvider);
  return VerifyPaymentUseCase(repository);
});

final verifyInquiryPaymentUseCaseProvider = Provider((ref) {
  final repository = ref.read(bookingRepositoryProvider);
  return VerifyInquiryPaymentUseCase(repository);
});

final createInquiryBookingWithWalletUseCaseProvider = Provider((ref) {
  final repository = ref.read(bookingRepositoryProvider);
  return CreateInquiryBookingWithWalletUsecase(repository);
});

// Razorpay Provider
final razorpayProvider = Provider<Razorpay>((ref) {
  return Razorpay();
});

final bookingNotifierProvider =
    StateNotifierProvider<BookingNotifier, BookingState>((ref) {
  final razorpay = ref.read(razorpayProvider);
  return BookingNotifier(
    getBookingConfigUseCase: ref.read(getBookingConfigUseCaseProvider),
    getAvailableSlotsUseCase: ref.read(getAvailableSlotsUseCaseProvider),
    checkServiceAvailabilityUseCase:
        ref.read(checkServiceAvailabilityUseCaseProvider),
    createFixedBookingUseCase: ref.read(createFixedBookingUseCaseProvider),
    createWalletBookingUseCase: ref.read(createWalletBookingUseCaseProvider),
    createInquiryBookingUseCase: ref.read(createInquiryBookingUseCaseProvider),
    createInquiryBookingWithWalletUseCase:
        ref.read(createInquiryBookingWithWalletUseCaseProvider),
    verifyPaymentUseCase: ref.read(verifyPaymentUseCaseProvider),
    verifyInquiryPaymentUseCase: ref.read(verifyInquiryPaymentUseCaseProvider),
    razorpay: razorpay,
    ref: ref,
  );
});
