import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import '../../../../commons/utils/error_handler.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../models/booking_config_model.dart';
import '../models/available_slot_model.dart';
import '../models/booking_model.dart';
import '../models/service_availability_model.dart';

abstract class BookingRemoteDataSource {
  Future<BookingConfigModel> getBookingConfig();
  Future<AvailableSlotsResponseModel> getAvailableSlots(
      int serviceId, String date);
  Future<ServiceAvailabilityModel> checkServiceAvailability(
      int serviceId, String city, String state);
  Future<BookingResponseModel> createFixedPriceBooking(
      CreateBookingRequestModel request);
  Future<BookingResponseModel> createWalletBooking(
      CreateBookingRequestModel request);
  Future<InquiryBookingResponseModel> createInquiryBooking(
      CreateInquiryBookingRequestModel request);
  Future<BookingResponseModel> verifyPayment(
      int bookingId, VerifyPaymentRequestModel verifyPaymentRequest);
  Future<BookingResponseModel> verifyInquiryPayment(
      VerifyPaymentRequestModel verifyPaymentRequest);
}

class BookingRemoteDataSourceImpl implements BookingRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  BookingRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<BookingConfigModel> getBookingConfig() async {
    try {
      final response = await dioClient.dio.get(ApiEndpoints.bookingConfig.path);

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          return BookingConfigModel.fromJson(data['data']);
        } else {
          throw Exception(data['message'] ?? 'Failed to get booking config');
        }
      } else {
        throw Exception('Failed to get booking config');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not fetch booking config. Please try again.');
    }
  }

  @override
  Future<AvailableSlotsResponseModel> getAvailableSlots(
      int serviceId, String date) async {
    try {
      final response = await dioClient.dio.get(
        ApiEndpoints.availableSlots.path,
        queryParameters: {
          'service_id': serviceId,
          'date': date,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          return AvailableSlotsResponseModel.fromJson(data['data']);
        } else {
          throw Exception(data['message'] ?? 'Failed to get available slots');
        }
      } else {
        throw Exception('Failed to get available slots');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not fetch available slots. Please try again.');
    }
  }

  @override
  Future<ServiceAvailabilityModel> checkServiceAvailability(
      int serviceId, String city, String state) async {
    try {
      final response = await dioClient.dio.get(
        ApiEndpoints.serviceAvailability.path
            .replaceAll('{id}', serviceId.toString()),
        queryParameters: {
          'city': city,
          'state': state,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          return ServiceAvailabilityModel.fromJson(data);
        } else {
          throw Exception(data['message'] ?? 'Failed to check service availability');
        }
      } else {
        throw Exception('Failed to check service availability');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not check service availability. Please try again.');
    }
  }

  @override
  Future<BookingResponseModel> createFixedPriceBooking(
      CreateBookingRequestModel request) async {
    try {
      final response = await dioClient.dio.post(
        ApiEndpoints.createBooking.path,
        data: request.toJson(),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return BookingResponseModel.fromJson(data);
      } else {
        throw Exception('Failed to create booking');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not create booking. Please try again.');
    }
  }

  @override
  Future<BookingResponseModel> createWalletBooking(
      CreateBookingRequestModel request) async {
    try {
      final response = await dioClient.dio.post(
        ApiEndpoints.createWalletBooking.path,
        data: request.toJson(),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return BookingResponseModel.fromJson(data);
      } else {
        throw Exception('Failed to create wallet booking');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not create wallet booking. Please try again.');
    }
  }

  @override
  Future<InquiryBookingResponseModel> createInquiryBooking(
      CreateInquiryBookingRequestModel request) async {
    try {
      final response = await dioClient.dio.post(
        ApiEndpoints.createInquiryBooking.path,
        data: request.toJson(),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return InquiryBookingResponseModel.fromJson(data['data']);
      } else {
        throw Exception('Failed to create inquiry booking');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not create inquiry booking. Please try again.');
    }
  }

  @override
  Future<BookingResponseModel> verifyPayment(
      int bookingId, VerifyPaymentRequestModel verifyPaymentRequest) async {
    try {
      final response = await dioClient.dio.post(
        ApiEndpoints.verifyPayment.path
            .replaceAll('{bookingId}', bookingId.toString()),
        data: verifyPaymentRequest.toJson(),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        return BookingResponseModel.fromJson(data);
      } else {
        throw Exception('Failed to verify payment');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not verify payment. Please try again.');
    }
  }

  @override
  Future<BookingResponseModel> verifyInquiryPayment(
      VerifyPaymentRequestModel verifyPaymentRequest) async {
    try {
      final response = await dioClient.dio.post(
        ApiEndpoints.verifyInquiryPayment.path,
        data: verifyPaymentRequest.toJson(),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          // The API returns a booking object directly, so we need to wrap it in a response format
          final responseData = {
            'booking': data['data'],
            'message': data['message'],
            'payment_required': false,
            'payment_order': null,
            'hold_expires_at': null,
            'payment_type': null,
          };
          
          return BookingResponseModel.fromJson(responseData);
        } else {
          throw Exception(
              data['message'] ?? 'Failed to verify inquiry payment');
        }
      } else {
        throw Exception('Failed to verify inquiry payment');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not verify inquiry payment. Please try again.');
    }
  }
}
