import '../entities/booking_entity.dart';
import '../repositories/booking_repository.dart';

class VerifyInquiryPaymentUseCase {
  final BookingRepository repository;

  const VerifyInquiryPaymentUseCase(this.repository);

  Future<BookingResponseEntity> call(
      VerifyPaymentRequestEntity verifyPaymentRequest) async {
    return await repository.verifyInquiryPayment(verifyPaymentRequest);
  }
}