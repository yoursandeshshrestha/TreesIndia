import '../../domain/entities/bookings_response_entity.dart';
import '../../domain/repositories/bookings_repository.dart';
import '../datasources/bookings_datasource.dart';

class BookingsRepositoryImpl implements BookingsRepository {
  final BookingsDatasource datasource;

  BookingsRepositoryImpl({required this.datasource});

  @override
  Future<BookingsResponseEntity> getBookings({
    int page = 1,
    int limit = 10,
  }) async {
    final model = await datasource.getBookings(page: page, limit: limit);
    return model.toEntity();
  }
}