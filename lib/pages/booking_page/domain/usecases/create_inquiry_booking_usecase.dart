import '../entities/booking_entity.dart';
import '../repositories/booking_repository.dart';

class CreateInquiryBookingUseCase {
  final BookingRepository repository;

  CreateInquiryBookingUseCase(this.repository);

  Future<InquiryBookingResponseEntity> call(CreateInquiryBookingRequestEntity request) async {
    return await repository.createInquiryBooking(request);
  }
}