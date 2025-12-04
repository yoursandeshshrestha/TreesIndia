import '../entities/booking_config_entity.dart';
import '../entities/available_slot_entity.dart';
import '../entities/booking_entity.dart';
import '../entities/service_availability_entity.dart';

abstract class BookingRepository {
  Future<BookingConfigEntity> getBookingConfig();
  Future<AvailableSlotsResponseEntity> getAvailableSlots(int serviceId, String date);
  Future<ServiceAvailabilityEntity> checkServiceAvailability(int serviceId, String city, String state, String pincode);
  Future<BookingResponseEntity> createFixedPriceBooking(CreateBookingRequestEntity request);
  Future<BookingResponseEntity> createWalletBooking(CreateBookingRequestEntity request);
  Future<InquiryBookingResponseEntity> createInquiryBooking(CreateInquiryBookingRequestEntity request);
  Future<BookingResponseEntity> createInquiryBookingWithWallet(CreateInquiryBookingRequestEntity request);
  Future<BookingResponseEntity> verifyPayment(int bookingId, VerifyPaymentRequestEntity verifyPaymentRequest);
  Future<BookingResponseEntity> verifyInquiryPayment(VerifyPaymentRequestEntity verifyPaymentRequest);
}