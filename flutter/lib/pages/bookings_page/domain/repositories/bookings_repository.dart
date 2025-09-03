import '../entities/bookings_response_entity.dart';
import '../../app/viewmodels/bookings_state.dart';

abstract class BookingsRepository {
  Future<BookingsResponseEntity> getBookings({
    int page = 1,
    int limit = 10,
    BookingTab tab = BookingTab.all,
  });

  Future<void> cancelBooking({
    required int bookingId,
    required String reason,
    String? cancellationReason,
  });
}
