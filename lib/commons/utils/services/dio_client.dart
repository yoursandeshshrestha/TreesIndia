import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:trees_india/commons/config/api_config.dart';
import 'package:trees_india/commons/presenters/providers/data_repository_provider.dart';
import 'package:trees_india/commons/utils/services/auth_notifier.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../utils/services/notification_service.dart';
import 'centralized_local_storage_service.dart';

late CentralizedLocalStorageService _localStorageService;

class DioClient {
  final Dio _dio;
  final Ref _ref;
  final NotificationService _notificationService;
  final ApiConfig _apiConfig;

  // Add these fields to control refresh state
  bool _isRefreshing = false;
  final Set<String> _processedErrorIds = <String>{};

  DioClient(
    this._ref,
    this._notificationService,
    this._apiConfig,
  ) : _dio = Dio(
          BaseOptions(
            baseUrl: ApiConfig.baseUrl,
            connectTimeout: const Duration(seconds: ApiConfig.timeoutSeconds),
            receiveTimeout: const Duration(seconds: ApiConfig.timeoutSeconds),
          ),
        ) {
    (_dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
      final client = HttpClient();
      client.badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
      return client;
    };

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        print("inside request interceptor:");
        print("=== Request Details ===");
        print("Path: ${options.path}");
        print("Method: ${options.method}");
        print("Headers before: ${options.headers}");
        // String deviceInformation = await getDeviceDetails();

        try {
          final requiresAuth = ApiConfig.isAuthRequired(options.path);

          options.path = await _apiConfig.getApiUrl(options.path);
          _localStorageService = CentralizedLocalStorageService();
          final fcmtoken = await _localStorageService.getData('FCMTOKEN');
          // options.headers['DeviceInfo'] = deviceInformation;
          options.headers['Content-Type'] = 'application/json';
          options.headers['Accept'] = 'application/json';

          // Special handling for signup/login endpoints
          if (options.path.contains('signUp') ||
              options.path.contains('login')) {
            print("=== Processing Auth Request ===");

            options.headers['DeviceId'] = fcmtoken;
            if (options.data is Map &&
                options.data['GoogleAccessKey'] != null) {
              print("=== Google Sign-In Request ===");
              print("Token Length: ${options.data['GoogleAccessKey'].length}");

              options.headers['Content-Type'] = 'application/json';
              options.headers['Accept'] = 'application/json';

              print("Final URL: ${options.path}");
              print("Final Headers: ${options.headers}");
              print("Request Body: ${options.data}");
            }
          }

          if (requiresAuth) {
            // Check if Authorization header is already present (from direct token passing)
            if (!options.headers.containsKey('Authorization')) {
              final token = await _ref
                  .read(centralizedDataRepositoryProvider)
                  .getAuthToken();
              print("token: $token");
              if (token != null && token.isNotEmpty) {
                options.headers['Authorization'] = 'Bearer $token';
              } else {
                print("⚠️ Authorization token is missing or empty");
                return handler.reject(
                  DioException(
                    requestOptions: options,
                    error: 'Authorization token is missing',
                  ),
                );
              }
            } else {
              print(
                  "Authorization header already present, skipping token lookup");
            }
          }

          print("=== Final Request Configuration ===");
          print("URL: ${options.path}");
          print("Headers: ${options.headers}");
          print("Body: ${options.data}");

          handler.next(options);
        } catch (e) {
          print("=== Request Error ===");
          print("Error: $e");
          handler.reject(
            DioException(
              requestOptions: options,
              error: e.toString(),
            ),
          );
        }
      },
      onResponse: (response, handler) {
        print("=== Response Details ===");
        print("Status Code: ${response.statusCode}");
        print("Headers: ${response.headers}");
        print("Body: ${response.data}");
        handler.resolve(response);
      },
      onError: (DioException error, handler) async {
        print("=== Error Details ===");
        print("Error Type: ${error.type}");
        print("Error Message: ${error.message}");
        print("Status Code: ${error.response?.statusCode}");
        print("Error Response: ${error.response?.data}");

        // Create unique error ID to prevent duplicate processing
        final errorId = _generateErrorId(error);

        // Check if this error has already been processed
        if (_processedErrorIds.contains(errorId)) {
          print("Error already processed, skipping: $errorId");
          handler.next(error);
          return;
        }

        // Add to processed errors
        _processedErrorIds.add(errorId);

        // Clean up old error IDs to prevent memory leaks (keep only recent 100)
        if (_processedErrorIds.length > 100) {
          final List<String> errorList = _processedErrorIds.toList();
          _processedErrorIds.clear();
          _processedErrorIds.addAll(errorList.skip(50)); // Keep last 50
        }

        final statusCode = error.response?.statusCode;

        if (statusCode == 401 || statusCode == 403 || statusCode == 440) {
          print("Authentication error detected: $statusCode");

          // Prevent multiple refresh attempts
          if (_isRefreshing) {
            print("Token refresh already in progress, waiting...");
            handler.next(error);
            return;
          }

          await _handleAuthError(error, handler);
        } else {
          handler.next(error);
        }
      },
    ));

    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      requestHeader: true,
      responseHeader: true,
      error: true,
      logPrint: (object) {
        print('DIO LOG: $object');
      },
    ));
  }

  // Generate unique error ID based on request details
  String _generateErrorId(DioException error) {
    final uri = error.requestOptions.uri.toString();
    final method = error.requestOptions.method;
    final statusCode = error.response?.statusCode ?? 0;
    final timestamp = DateTime.now().millisecondsSinceEpoch;

    // Create ID that's unique for same request within a short time window
    final baseId = '$method-$uri-$statusCode';
    final timeWindow = (timestamp / 5000).floor(); // 5-second window

    return '$baseId-$timeWindow';
  }

  Future<void> _handleAuthError(
      DioException error, ErrorInterceptorHandler handler) async {
    try {
      _isRefreshing = true;

      final statusCode = error.response?.statusCode;
      String message;

      if (statusCode == 440 || statusCode == 403 || statusCode == 401) {
        message = 'Your session has expired. Please log in again to continue.';
      } else {
        message = 'Your session has expired. Please log in again.';
      }

      print(message);

      // final refreshSuccess = await _callRefreshToken(_ref);

      // if (refreshSuccess) {
      //   print("Token refresh successful, retrying request...");

      //   // Get the retry count from request options
      //   final retryCount =
      //       error.requestOptions.extra['retryCount'] as int? ?? 0;

      //   if (retryCount < _maxRetries) {
      //     // Increment retry count
      //     error.requestOptions.extra['retryCount'] = retryCount + 1;

      //     // Update the authorization header with new token
      //     final newToken =
      //         await _ref.read(centralizedDataRepositoryProvider).getAuthToken();

      //     if (newToken != null) {
      //       error.requestOptions.headers['Authorization'] = 'Basic $newToken';

      //       // Retry the request
      //       try {
      //         final response = await _dio.fetch(error.requestOptions);
      //         handler.resolve(response);
      //         return;
      //       } catch (retryError) {
      //         print("Retry failed: $retryError");
      //         handler.next(error);
      //         return;
      //       }
      //     }
      //   }
      // }

      // If refresh failed or max retries reached, redirect to login
      await _redirectToLogin(message);
      handler.next(error);
    } finally {
      _isRefreshing = false;
    }
  }

  Future<void> _redirectToLogin(String message) async {
    try {
      await _ref.read(centralizedDataRepositoryProvider).logout();
      await _ref.read(authProvider.notifier).logout();
      _notificationService.showErrorSnackBar(message);
    } catch (e) {
      print("Error during logout: $e");
    }
  }

  Dio get dio => _dio;

  Future<String> getDeviceDetails() async {
    DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    late String deviceInformation;

    try {
      if (Platform.isAndroid) {
        AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
        print('Running on ${androidInfo.model}');
        print('Brand: ${androidInfo.brand}');
        print('Android version: ${androidInfo.version.release}');
        print('SDK: ${androidInfo.version.sdkInt}');
        deviceInformation =
            'Android, ${androidInfo.brand}, ${androidInfo.model}, ${androidInfo.version.release}';
        print('Device information $deviceInformation');
      } else if (Platform.isIOS) {
        IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
        print('Running on ${iosInfo.model}');
        print('System name: ${iosInfo.systemName}');
        print('System version: ${iosInfo.systemVersion}');
        deviceInformation =
            'iOS, Apple, ${iosInfo.model}, ${iosInfo.systemVersion} ';
      }
    } catch (e) {
      print('Error getting device info: $e');
      deviceInformation = '';
    }
    return deviceInformation;
  }

  // Future<bool> _callRefreshToken(Ref ref) async {
  //   try {
  //     final localUserJson = await _localStorageService.getData(userStorageKey);
  //     if (localUserJson != null) {
  //       final Map<String, dynamic> typedJson =
  //           convertToStringDynamicMap(localUserJson);

  //       final userModel = UserModel.fromJson(typedJson);
  //       final isSuccess = await ref
  //           .read(loginPageProvider.notifier)
  //           .refreshToken(userModel.token!.refreshToken, _ref);

  //       return isSuccess;
  //     }
  //   } catch (e) {
  //     print('Error refreshing token: $e');
  //   }
  //   return false;
  // }
}
