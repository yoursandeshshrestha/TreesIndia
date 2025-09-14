import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:trees_india/commons/config/api_config.dart';
import 'package:trees_india/commons/presenters/providers/data_repository_provider.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/domain/entities/refresh_token_request_entity.dart';
import 'package:trees_india/commons/presenters/providers/login_usecase_providers.dart';

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
  static const int _maxRetries = 1;

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

          // Store original endpoint for potential retry scenarios
          options.extra['originalPath'] = options.path;
          
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

      final refreshSuccess = await _callRefreshToken();

      if (refreshSuccess) {
        print("Token refresh successful, retrying request...");

        // Get the retry count from request options
        final retryCount =
            error.requestOptions.extra['retryCount'] as int? ?? 0;

        if (retryCount < _maxRetries) {
          // Increment retry count
          error.requestOptions.extra['retryCount'] = retryCount + 1;

          // Update the authorization header with new token
          final newToken =
              await _ref.read(centralizedDataRepositoryProvider).getAuthToken();

          if (newToken != null) {
            // Create a fresh request options with original path to avoid double URL concatenation
            final originalPath = error.requestOptions.extra['originalPath'] as String?;
            if (originalPath != null) {
              final retryOptions = RequestOptions(
                path: originalPath,
                method: error.requestOptions.method,
                data: error.requestOptions.data,
                queryParameters: error.requestOptions.queryParameters,
                headers: Map<String, dynamic>.from(error.requestOptions.headers)
                  ..['Authorization'] = 'Bearer $newToken',
                extra: error.requestOptions.extra,
                connectTimeout: error.requestOptions.connectTimeout,
                receiveTimeout: error.requestOptions.receiveTimeout,
                sendTimeout: error.requestOptions.sendTimeout,
                responseType: error.requestOptions.responseType,
                contentType: error.requestOptions.contentType,
                validateStatus: error.requestOptions.validateStatus,
                receiveDataWhenStatusError: error.requestOptions.receiveDataWhenStatusError,
                followRedirects: error.requestOptions.followRedirects,
                maxRedirects: error.requestOptions.maxRedirects,
                persistentConnection: error.requestOptions.persistentConnection,
                requestEncoder: error.requestOptions.requestEncoder,
                responseDecoder: error.requestOptions.responseDecoder,
                listFormat: error.requestOptions.listFormat,
              );

              // Retry the request with fresh options
              try {
                final response = await _dio.fetch(retryOptions);
                handler.resolve(response);
                return;
              } catch (retryError) {
                print("Retry failed: $retryError");
                handler.next(error);
                return;
              }
            } else {
              // Fallback to old method if originalPath is not available
              error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              
              try {
                final response = await _dio.fetch(error.requestOptions);
                handler.resolve(response);
                return;
              } catch (retryError) {
                print("Retry failed: $retryError");
                handler.next(error);
                return;
              }
            }
          }
        }
      }

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

  Future<bool> _callRefreshToken() async {
    try {
      // Get the current auth token data which includes refresh token
      final localTokenJson =
          await _localStorageService.getData('user_auth_tokens');
      if (localTokenJson != null) {
        final Map<String, dynamic> typedJson =
            _convertToStringDynamicMap(localTokenJson);

        final refreshToken = typedJson['refreshToken'] as String?;
        if (refreshToken != null && refreshToken.isNotEmpty) {
          // Use the refresh token usecase to refresh the token
          final refreshTokenUsecase = _ref.read(refreshTokenUsecaseProvider);
          final response = await refreshTokenUsecase(
            RefreshTokenRequestEntity(refreshToken: refreshToken),
          );

          if (response.success && response.data != null) {
            // Save new tokens to local storage
            final tokenData = {
              'authToken': response.data!.accessToken,
              'refreshToken': response.data!.refreshToken,
              'userId': typedJson['userId'] as String? ?? '',
            };

            await _localStorageService.saveData('user_auth_tokens', tokenData);
            print('Token refreshed and saved successfully');
            return true;
          }
        }
      }
    } catch (e) {
      print('Error refreshing token: $e');
    }
    return false;
  }

  // Helper method to safely convert storage data to Map<String, dynamic>
  Map<String, dynamic> _convertToStringDynamicMap(dynamic data) {
    if (data is Map<String, dynamic>) {
      return data;
    } else if (data is Map) {
      return data.map((key, value) {
        if (value is Map) {
          return MapEntry(key.toString(), _convertToStringDynamicMap(value));
        } else if (value is List) {
          return MapEntry(
              key.toString(),
              value.map((item) {
                if (item is Map) {
                  return _convertToStringDynamicMap(item);
                }
                return item;
              }).toList());
        } else {
          return MapEntry(key.toString(), value);
        }
      });
    } else {
      throw Exception(
          'Cannot convert data to Map<String, dynamic>: ${data.runtimeType}');
    }
  }
}
