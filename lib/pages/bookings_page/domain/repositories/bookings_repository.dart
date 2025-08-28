import '../entities/bookings_response_entity.dart';

abstract class BookingsRepository {
  Future<BookingsResponseEntity> getBookings({
    int page = 1,
    int limit = 10,
  });
}