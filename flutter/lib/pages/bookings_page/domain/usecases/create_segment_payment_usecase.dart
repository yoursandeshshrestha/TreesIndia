import '../entities/segment_payment_request_entity.dart';
import '../entities/segment_payment_response_entity.dart';
import '../repositories/bookings_repository.dart';

class CreateSegmentPaymentUseCase {
  final BookingsRepository repository;

  CreateSegmentPaymentUseCase({required this.repository});

  Future<SegmentPaymentResponseEntity> call({
    required int bookingId,
    required SegmentPaymentRequestEntity request,
  }) async {
    return await repository.createSegmentPayment(
      bookingId: bookingId,
      request: request,
    );
  }
}