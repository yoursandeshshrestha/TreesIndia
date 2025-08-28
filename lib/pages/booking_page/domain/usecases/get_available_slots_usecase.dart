import '../entities/available_slot_entity.dart';
import '../repositories/booking_repository.dart';

class GetAvailableSlotsUseCase {
  final BookingRepository repository;

  GetAvailableSlotsUseCase(this.repository);

  Future<AvailableSlotsResponseEntity> call(int serviceId, String date) async {
    return await repository.getAvailableSlots(serviceId, date);
  }
}