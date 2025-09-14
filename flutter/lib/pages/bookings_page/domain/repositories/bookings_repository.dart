import '../entities/bookings_response_entity.dart';
import '../entities/quote_payment_request_entity.dart';
import '../entities/quote_payment_response_entity.dart';
import '../../app/viewmodels/bookings_state.dart';

abstract class BookingsRepository {
  Future<BookingsResponseEntity> getBookings({
    int page = 1,
    int limit = 10,
    BookingTab tab = BookingTab.all,
  });

  Future<void> cancelBooking({
    required int bookingId,
    required String reason,
    String? cancellationReason,
  });

  Future<void> rejectQuote({
    required int bookingId,
    String reason,
  });

  Future<void> acceptQuote({
    required int bookingId,
    String notes,
  });

  Future<QuotePaymentResponseEntity> createQuotePayment({
    required int bookingId,
    required QuotePaymentRequestEntity request,
  });

  Future<void> verifyQuotePayment({
    required int bookingId,
    required QuotePaymentVerificationEntity verification,
  });

  Future<void> processWalletQuotePayment({
    required int bookingId,
    required WalletQuotePaymentRequestEntity request,
  });
}
