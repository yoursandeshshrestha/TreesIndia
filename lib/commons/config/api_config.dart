import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/constants/app_constants.dart';
import '../environment/global_environment.dart';

class ApiConfig {
  static final String baseUrl = GlobalEnvironment.apiBaseUrl;
  static const int timeoutSeconds = AppConstants.networkTimeout;

  ApiConfig();

  static Map<String, String> defaultHeaders = {
    'Content-Type': ApiEndpoints.contentType,
    'Accept': ApiEndpoints.accept,
  };

  Future<String> getApiUrl(String endpoint) async {
    final matchedEndpoint = ApiEndpoints.endpoints.firstWhere(
      (ep) => ep.path == endpoint,
      orElse: () =>
          throw Exception('Endpoint $endpoint not found in ApiEndpoints'),
    );

    print("$baseUrl${matchedEndpoint.path}");
    return "$baseUrl${matchedEndpoint.path}";
  }

  static bool isAuthRequired(String path) {
    for (final endpoint in ApiEndpoints.endpoints) {
      if (endpoint.path == path) {
        return endpoint.requiresAuth;
      }
    }

    return false;
  }
}
