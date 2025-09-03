import '../entities/booking_entity.dart';
import '../repositories/booking_repository.dart';

class CreateInquiryBookingWithWalletUsecase {
  final BookingRepository repository;

  CreateInquiryBookingWithWalletUsecase(this.repository);

  Future<BookingResponseEntity> call(
      CreateInquiryBookingRequestEntity request) async {
    return await repository.createInquiryBookingWithWallet(request);
  }
}
