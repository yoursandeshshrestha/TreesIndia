import '../repositories/bookings_repository.dart';

class RejectQuoteUseCase {
  final BookingsRepository repository;

  RejectQuoteUseCase({required this.repository});

  Future<void> call({
    required int bookingId,
    String reason = "Quote rejected via Mobile app",
  }) async {
    return await repository.rejectQuote(
      bookingId: bookingId,
      reason: reason,
    );
  }
}
