import 'package:dio/dio.dart';
import '../../../../commons/constants/api_endpoints.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../../../../commons/utils/error_handler.dart';
import '../models/bookings_response_model.dart';
import '../models/quote_payment_request_model.dart';
import '../models/quote_payment_response_model.dart';
import '../../app/viewmodels/bookings_state.dart';

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
    BookingTab tab = BookingTab.all,
  }) async {
    final url = ApiEndpoints.bookings.path;

    // Build query parameters based on tab
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    // Add status filter based on tab
    switch (tab) {
      case BookingTab.all:
        // No status filter for all bookings
        break;
      case BookingTab.upcoming:
        queryParams['status'] =
            'confirmed,scheduled,assigned,in_progress,pending,quote_provided';
        break;
      case BookingTab.completed:
        queryParams['status'] = 'completed';
        break;
      case BookingTab.cancelled:
        queryParams['status'] = 'cancelled,rejected';
        break;
    }

    try {
      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParams,
      );

      if (response.statusCode == 200 && response.data != null) {
        print('📍 Parsing bookings response for tab: $tab');
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

  Future<void> rejectQuote({
    required int bookingId,
    String reason = "Quote rejected via mobile app",
  }) async {
    final url = ApiEndpoints.rejectQuote.path
        .replaceAll('{bookingId}', bookingId.toString());

    final payload = <String, dynamic>{
      'reason': reason,
    };

    try {
      final response = await dioClient.dio.post(url, data: payload);

      if (response.statusCode == 200) {
        print('📍 Quote rejected successfully: $bookingId');
      } else {
        throw Exception('Failed to reject quote. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error rejecting quote.');
    }
  }

  Future<void> acceptQuote({
    required int bookingId,
    String notes = "Quote accepted via mobile app",
  }) async {
    final url = ApiEndpoints.acceptQuote.path
        .replaceAll('{bookingId}', bookingId.toString());

    final payload = <String, dynamic>{
      'notes': notes,
    };

    try {
      final response = await dioClient.dio.post(url, data: payload);

      if (response.statusCode == 200) {
        print('📍 Quote accepted successfully: $bookingId');
      } else {
        throw Exception('Failed to accept quote. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error accepting quote.');
    }
  }

  Future<QuotePaymentResponseModel> createQuotePayment({
    required int bookingId,
    required QuotePaymentRequestModel request,
  }) async {
    final url = ApiEndpoints.createQuotePayment.path
        .replaceAll('{bookingId}', bookingId.toString());

    try {
      final response = await dioClient.dio.post(url, data: request.toJson());

      if (response.statusCode == 200 && response.data != null) {
        print('📍 Quote payment order created successfully: $bookingId');
        return QuotePaymentResponseModel.fromJson(response.data);
      } else {
        throw Exception('Failed to create quote payment. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error creating quote payment.');
    }
  }

  Future<void> verifyQuotePayment({
    required int bookingId,
    required QuotePaymentVerificationModel verification,
  }) async {
    final url = ApiEndpoints.verifyQuotePayment.path
        .replaceAll('{bookingId}', bookingId.toString());

    try {
      final response = await dioClient.dio.post(url, data: verification.toJson());

      if (response.statusCode == 200) {
        print('📍 Quote payment verified successfully: $bookingId');
      } else {
        throw Exception('Failed to verify quote payment. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error verifying quote payment.');
    }
  }

  Future<void> processWalletQuotePayment({
    required int bookingId,
    required WalletQuotePaymentRequestModel request,
  }) async {
    final url = ApiEndpoints.walletQuotePayment.path
        .replaceAll('{bookingId}', bookingId.toString());

    try {
      final response = await dioClient.dio.post(url, data: request.toJson());

      if (response.statusCode == 200) {
        print('📍 Wallet quote payment processed successfully: $bookingId');
      } else {
        throw Exception('Failed to process wallet payment. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error processing wallet quote payment.');
    }
  }
}
