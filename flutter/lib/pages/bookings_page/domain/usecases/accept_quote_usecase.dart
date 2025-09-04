import '../repositories/bookings_repository.dart';

class AcceptQuoteUseCase {
  final BookingsRepository repository;

  AcceptQuoteUseCase({required this.repository});

  Future<void> call({
    required int bookingId,
    String notes = "Quote accepted via mobile app",
  }) async {
    return await repository.acceptQuote(
      bookingId: bookingId,
      notes: notes,
    );
  }
}