import '../entities/quote_payment_request_entity.dart';
import '../entities/quote_payment_response_entity.dart';
import '../repositories/bookings_repository.dart';

class CreateQuotePaymentUseCase {
  final BookingsRepository repository;

  CreateQuotePaymentUseCase({required this.repository});

  Future<QuotePaymentResponseEntity> call({
    required int bookingId,
    required String scheduledDate,
    required String scheduledTime,
    required int amount,
  }) async {
    final request = QuotePaymentRequestEntity(
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      amount: amount,
    );

    return await repository.createQuotePayment(
      bookingId: bookingId,
      request: request,
    );
  }
}