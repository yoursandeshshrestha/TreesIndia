import 'package:dio/dio.dart';

/// Converts exceptions to user-friendly error messages
///
/// This helper function sanitizes technical errors and presents
/// clean, understandable messages to end users.
String getErrorMessage(dynamic error, {String? fallbackMessage}) {
  // Handle DioException (network errors)
  if (error is DioException) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Request timed out. Please try again.';

      case DioExceptionType.connectionError:
        return 'Unable to connect. Please check your internet connection.';

      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        if (statusCode != null) {
          if (statusCode >= 500) {
            return 'Server error. Please try again later.';
          } else if (statusCode >= 400) {
            return fallbackMessage ?? 'Request failed. Please try again.';
          }
        }
        return fallbackMessage ?? 'Something went wrong. Please try again.';

      case DioExceptionType.cancel:
        return 'Request was cancelled.';

      case DioExceptionType.badCertificate:
        return 'Security error. Please contact support.';

      case DioExceptionType.unknown:
        // Check if it's a network-related error
        final errorMsg = error.message?.toLowerCase();
        if (errorMsg != null &&
            (errorMsg.contains('network') ||
                errorMsg.contains('connection') ||
                errorMsg.contains('socket'))) {
          return 'Unable to connect. Please check your internet connection.';
        }
        return fallbackMessage ?? 'Something went wrong. Please try again.';
    }
  }

  // Handle generic exceptions
  // Don't expose technical details - use fallback or generic message
  return fallbackMessage ?? 'Something went wrong. Please try again.';
}
