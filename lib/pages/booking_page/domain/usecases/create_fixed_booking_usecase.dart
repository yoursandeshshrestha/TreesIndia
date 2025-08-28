import '../entities/booking_entity.dart';
import '../repositories/booking_repository.dart';

class CreateFixedBookingUseCase {
  final BookingRepository repository;

  CreateFixedBookingUseCase(this.repository);

  Future<BookingResponseEntity> call(CreateBookingRequestEntity request) async {
    return await repository.createFixedPriceBooking(request);
  }
}