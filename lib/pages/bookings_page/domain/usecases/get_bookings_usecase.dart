import '../repositories/bookings_repository.dart';
import '../entities/bookings_response_entity.dart';
import '../../app/viewmodels/bookings_state.dart';

class GetBookingsUseCase {
  final BookingsRepository repository;

  GetBookingsUseCase({required this.repository});

  Future<BookingsResponseEntity> call({
    int page = 1,
    int limit = 10,
    BookingTab tab = BookingTab.all,
  }) async {
    return await repository.getBookings(
      page: page,
      limit: limit,
      tab: tab,
    );
  }
}
