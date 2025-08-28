import '../entities/bookings_response_entity.dart';
import '../repositories/bookings_repository.dart';

class GetBookingsUseCase {
  final BookingsRepository repository;

  GetBookingsUseCase({required this.repository});

  Future<BookingsResponseEntity> call({
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.getBookings(page: page, limit: limit);
  }
}