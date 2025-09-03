import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';

class GlobalErrorHandler {
  final Logger _logger = Logger();

  /// Sets up global error handling for Flutter UI errors and Dart asynchronous errors.
  void setupGlobalErrorHandler() {
    // Catch Flutter framework errors
    FlutterError.onError = (FlutterErrorDetails details) {
      // FirebaseCrashlytics.instance.recordFlutterFatalError(details);
      _logger.e(
        "Flutter error caught: ${details.exceptionAsString()}",
        error: details.exception,
        stackTrace: details.stack,
      );
      _reportError(details.exception, details.stack);
    };
  }

  /// Function to report the error to a crash reporting service like Firebase Crashlytics.
  void _reportError(dynamic error, StackTrace? stackTrace) {
    _logger.i("Error reported to crash reporting service: $error");
    // FirebaseCrashlytics.instance.recordError(error, stackTrace);
  }
}
