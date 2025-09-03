import '../entities/booking_entity.dart';
import '../repositories/booking_repository.dart';

class VerifyPaymentUseCase {
  final BookingRepository repository;

  const VerifyPaymentUseCase(this.repository);

  Future<BookingResponseEntity> call({
    required int bookingId,
    required VerifyPaymentRequestEntity verifyPaymentRequest,
  }) async {
    return await repository.verifyPayment(
      bookingId,
      verifyPaymentRequest,
    );
  }
}
