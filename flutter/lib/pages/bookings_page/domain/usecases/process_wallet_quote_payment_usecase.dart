import '../entities/quote_payment_request_entity.dart';
import '../repositories/bookings_repository.dart';

class ProcessWalletQuotePaymentUseCase {
  final BookingsRepository repository;

  ProcessWalletQuotePaymentUseCase({required this.repository});

  Future<void> call({
    required int bookingId,
    required String scheduledDate,
    required String scheduledTime,
    required int amount,
  }) async {
    final request = WalletQuotePaymentRequestEntity(
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      amount: amount,
    );

    return await repository.processWalletQuotePayment(
      bookingId: bookingId,
      request: request,
    );
  }
}