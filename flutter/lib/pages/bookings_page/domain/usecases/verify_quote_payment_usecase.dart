import '../entities/quote_payment_request_entity.dart';
import '../repositories/bookings_repository.dart';

class VerifyQuotePaymentUseCase {
  final BookingsRepository repository;

  VerifyQuotePaymentUseCase({required this.repository});

  Future<void> call({
    required int bookingId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    final verification = QuotePaymentVerificationEntity(
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
    );

    return await repository.verifyQuotePayment(
      bookingId: bookingId,
      verification: verification,
    );
  }
}