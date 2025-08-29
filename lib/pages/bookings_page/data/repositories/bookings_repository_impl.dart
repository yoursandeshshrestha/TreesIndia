import '../../domain/entities/bookings_response_entity.dart';
import '../../domain/repositories/bookings_repository.dart';
import '../../app/viewmodels/bookings_state.dart';
import '../datasources/bookings_datasource.dart';

class BookingsRepositoryImpl implements BookingsRepository {
  final BookingsDatasource datasource;

  BookingsRepositoryImpl({required this.datasource});

  @override
  Future<BookingsResponseEntity> getBookings({
    int page = 1,
    int limit = 10,
    BookingTab tab = BookingTab.all,
  }) async {
    final model = await datasource.getBookings(
      page: page,
      limit: limit,
      tab: tab,
    );
    return model.toEntity();
  }

  @override
  Future<void> cancelBooking({
    required int bookingId,
    required String reason,
    String? cancellationReason,
  }) async {
    await datasource.cancelBooking(
      bookingId: bookingId,
      reason: reason,
      cancellationReason: cancellationReason,
    );
  }
}
