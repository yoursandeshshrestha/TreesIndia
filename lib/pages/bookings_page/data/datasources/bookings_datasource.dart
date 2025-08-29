import 'package:dio/dio.dart';
import '../../../../commons/constants/api_endpoints.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../../../../commons/utils/error_handler.dart';
import '../models/bookings_response_model.dart';

class BookingsDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  BookingsDatasource({
    required this.dioClient,
    required this.errorHandler,
  });

  Future<BookingsResponseModel> getBookings({
    int page = 1,
    int limit = 10,
  }) async {
    final url = ApiEndpoints.bookings.path;

    try {
      final response = await dioClient.dio.get(
        url,
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        print('📍 Parsing bookings response...');
        try {
          return BookingsResponseModel.fromJson(response.data);
        } catch (parseError) {
          print('📍 Parsing error: $parseError');
          print('📍 Response data: ${response.data}');
          rethrow;
        }
      } else {
        throw Exception('Failed to get bookings. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting bookings.');
    }
  }

  Future<void> cancelBooking({
    required int bookingId,
    required String reason,
    String? cancellationReason,
  }) async {
    final url = ApiEndpoints.cancelBooking.path
        .replaceAll('{bookingId}', bookingId.toString());

    final payload = <String, dynamic>{
      'reason': reason,
    };

    if (cancellationReason != null && cancellationReason.isNotEmpty) {
      payload['cancellation_reason'] = cancellationReason;
    }

    try {
      final response = await dioClient.dio.put(url, data: payload);

      if (response.statusCode == 200) {
        print('📍 Booking cancelled successfully: $bookingId');
      } else {
        throw Exception('Failed to cancel booking. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error cancelling booking.');
    }
  }
}
