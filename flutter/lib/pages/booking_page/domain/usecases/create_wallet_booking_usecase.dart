import '../entities/booking_entity.dart';
import '../repositories/booking_repository.dart';

class CreateWalletBookingUseCase {
  final BookingRepository repository;

  CreateWalletBookingUseCase(this.repository);

  Future<BookingResponseEntity> call(CreateBookingRequestEntity request) async {
    return await repository.createWalletBooking(request);
  }
}