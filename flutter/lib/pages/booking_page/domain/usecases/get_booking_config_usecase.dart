import '../entities/booking_config_entity.dart';
import '../repositories/booking_repository.dart';

class GetBookingConfigUseCase {
  final BookingRepository repository;

  GetBookingConfigUseCase(this.repository);

  Future<BookingConfigEntity> call() async {
    return await repository.getBookingConfig();
  }
}