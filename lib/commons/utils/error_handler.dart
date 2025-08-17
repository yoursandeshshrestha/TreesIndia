import 'dart:io';

import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/enums.dart';
import 'package:trees_india/commons/utils/services/notification_service.dart';
import 'package:logger/logger.dart';

class CustomException implements Exception {
  final String message;
  final CustomErrorType type;

  CustomException({
    required this.message,
    this.type = CustomErrorType.generic,
  });

  @override
  String toString() => message;
}

class ErrorHandler {
  final Logger _logger = Logger();
  final NotificationService notificationService;

  ErrorHandler({required this.notificationService});

  String handleError(Exception error) {
    if (error is DioException) {
      return handleNetworkError(error);
    } else if (error is CustomException) {
      return handleCustomError(error);
    } else {
      return handleGenericError(error);
    }
  }

  String handleCustomError(CustomException error) {
    String errorMessage;

    switch (error.type) {
      case CustomErrorType.network:
        errorMessage = "Network error: ${error.message}";
        _logger.e(errorMessage);
        break;
      case CustomErrorType.timeout:
        errorMessage = "Timeout error: ${error.message}";
        _logger.e(errorMessage);
        break;
      case CustomErrorType.auth:
        errorMessage = "Authentication error: ${error.message}";
        _logger.w(errorMessage);
        break;
      case CustomErrorType.noData:
        errorMessage = error.message;
        _logger.w(errorMessage);
        break;
      case CustomErrorType.generic:
        errorMessage = error.message;
        _logger.e(errorMessage);
    }

    return errorMessage;
  }

  String handleNetworkError(DioException error) {
    String errorMessage;

    // Check for SocketException first
    if (error.error is SocketException) {
      errorMessage =
          "No internet connection. Please check your network and try again.";
      _logger.e("Socket Exception: ${error.message}");
      return errorMessage;
    }

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        errorMessage = "Connection timeout. Please try again later.";
        break;

      case DioExceptionType.badResponse:
        errorMessage = _handleHttpError(error.response?.statusCode);
        break;

      case DioExceptionType.connectionError:
        errorMessage =
            "No internet connection. Please check your network and try again.";
        break;

      case DioExceptionType.cancel:
        errorMessage = "Request cancelled.";
        break;

      default:
        errorMessage = "Network error. Please try again.";
    }

    _logger.e("Network error: ${error.message}");
    return errorMessage;
  }

  String _handleHttpError(int? statusCode) {
    switch (statusCode) {
      case 401:
        return "Invalid credentials. Please try again.";
      case 403:
        return "Access denied. Please check your credentials.";
      case 404:
        return "Service not found. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      case null:
        return "An unknown error occurred. Please try again.";
      default:
        return "An unknown error occurred. Please try again.";
    }
  }

  String handleGenericError(Object error) {
    final errorMessage = 'Error: ${error.toString()}';
    _logger.e(errorMessage);
    return errorMessage;
  }
}
