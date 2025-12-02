import '../entities/service_availability_entity.dart';
import '../repositories/booking_repository.dart';

class CheckServiceAvailabilityUseCase {
  final BookingRepository repository;

  CheckServiceAvailabilityUseCase(this.repository);

  Future<ServiceAvailabilityEntity> call(
      int serviceId, String city, String state, String pincode) async {
    return await repository.checkServiceAvailability(
        serviceId, city, state, pincode);
  }
}
