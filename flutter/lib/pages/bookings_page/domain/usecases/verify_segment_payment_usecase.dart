import '../repositories/bookings_repository.dart';

class VerifySegmentPaymentUseCase {
  final BookingsRepository repository;

  VerifySegmentPaymentUseCase({required this.repository});

  Future<void> call({
    required int bookingId,
    required Map<String, String> verificationData,
  }) async {
    return await repository.verifySegmentPayment(
      bookingId: bookingId,
      verificationData: verificationData,
    );
  }
}