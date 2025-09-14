import '../../domain/entities/bookings_response_entity.dart';
import '../../domain/entities/quote_payment_request_entity.dart';
import '../../domain/entities/quote_payment_response_entity.dart';
import '../../domain/repositories/bookings_repository.dart';
import '../../app/viewmodels/bookings_state.dart';
import '../datasources/bookings_datasource.dart';
import '../models/quote_payment_request_model.dart';

class BookingsRepositoryImpl implements BookingsRepository {
  final BookingsDatasource datasource;

  BookingsRepositoryImpl({required this.datasource});

  @override
  Future<BookingsResponseEntity> getBookings({
    int page = 1,
    int limit = 10,
    BookingTab tab = BookingTab.all,
  }) async {
    final model = await datasource.getBookings(
      page: page,
      limit: limit,
      tab: tab,
    );
    return model.toEntity();
  }

  @override
  Future<void> cancelBooking({
    required int bookingId,
    required String reason,
    String? cancellationReason,
  }) async {
    await datasource.cancelBooking(
      bookingId: bookingId,
      reason: reason,
      cancellationReason: cancellationReason,
    );
  }

  @override
  Future<void> rejectQuote({
    required int bookingId,
    String reason = "Quote rejected via mobile app",
  }) async {
    await datasource.rejectQuote(
      bookingId: bookingId,
      reason: reason,
    );
  }

  @override
  Future<void> acceptQuote({
    required int bookingId,
    String notes = "Quote accepted via mobile app",
  }) async {
    await datasource.acceptQuote(
      bookingId: bookingId,
      notes: notes,
    );
  }

  @override
  Future<QuotePaymentResponseEntity> createQuotePayment({
    required int bookingId,
    required QuotePaymentRequestEntity request,
  }) async {
    final requestModel = QuotePaymentRequestModel.fromEntity(request);
    final responseModel = await datasource.createQuotePayment(
      bookingId: bookingId,
      request: requestModel,
    );
    return responseModel.toEntity();
  }

  @override
  Future<void> verifyQuotePayment({
    required int bookingId,
    required QuotePaymentVerificationEntity verification,
  }) async {
    final verificationModel = QuotePaymentVerificationModel.fromEntity(verification);
    await datasource.verifyQuotePayment(
      bookingId: bookingId,
      verification: verificationModel,
    );
  }

  @override
  Future<void> processWalletQuotePayment({
    required int bookingId,
    required WalletQuotePaymentRequestEntity request,
  }) async {
    final requestModel = WalletQuotePaymentRequestModel.fromEntity(request);
    await datasource.processWalletQuotePayment(
      bookingId: bookingId,
      request: requestModel,
    );
  }
}
