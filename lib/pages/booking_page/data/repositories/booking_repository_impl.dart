import '../../domain/entities/booking_config_entity.dart';
import '../../domain/entities/available_slot_entity.dart';
import '../../domain/entities/booking_entity.dart';
import '../../domain/entities/service_availability_entity.dart';
import '../../domain/repositories/booking_repository.dart';
import '../datasources/booking_remote_datasource.dart';
import '../models/booking_model.dart';

class BookingRepositoryImpl implements BookingRepository {
  final BookingRemoteDataSource remoteDataSource;

  BookingRepositoryImpl({required this.remoteDataSource});

  @override
  Future<BookingConfigEntity> getBookingConfig() async {
    final model = await remoteDataSource.getBookingConfig();
    return model.toEntity();
  }

  @override
  Future<AvailableSlotsResponseEntity> getAvailableSlots(int serviceId, String date) async {
    final model = await remoteDataSource.getAvailableSlots(serviceId, date);
    return model.toEntity();
  }

  @override
  Future<ServiceAvailabilityEntity> checkServiceAvailability(int serviceId, String city, String state) async {
    final model = await remoteDataSource.checkServiceAvailability(serviceId, city, state);
    return model.toEntity();
  }

  @override
  Future<BookingResponseEntity> createFixedPriceBooking(CreateBookingRequestEntity request) async {
    final requestModel = CreateBookingRequestModel.fromEntity(request);
    final responseModel = await remoteDataSource.createFixedPriceBooking(requestModel);
    return responseModel.toEntity();
  }

  @override
  Future<BookingResponseEntity> createInquiryBooking(CreateInquiryBookingRequestEntity request) async {
    final requestModel = CreateInquiryBookingRequestModel.fromEntity(request);
    final responseModel = await remoteDataSource.createInquiryBooking(requestModel);
    return responseModel.toEntity();
  }

  @override
  Future<BookingResponseEntity> verifyPayment(int bookingId, VerifyPaymentRequestEntity verifyPaymentRequest) async {
    final requestModel = VerifyPaymentRequestModel.fromEntity(verifyPaymentRequest);
    final responseModel = await remoteDataSource.verifyPayment(bookingId, requestModel);
    return responseModel.toEntity();
  }

  @override
  Future<BookingResponseEntity> verifyInquiryPayment(Map<String, dynamic> paymentData) async {
    final responseModel = await remoteDataSource.verifyInquiryPayment(paymentData);
    return responseModel.toEntity();
  }
}