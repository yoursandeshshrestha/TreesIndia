import '../repositories/bookings_repository.dart';

class CancelBookingUseCase {
  final BookingsRepository repository;

  CancelBookingUseCase({required this.repository});

  Future<void> call({
    required int bookingId,
    required String reason,
    String? cancellationReason,
  }) async {
    return await repository.cancelBooking(
      bookingId: bookingId,
      reason: reason,
      cancellationReason: cancellationReason,
    );
  }
}
