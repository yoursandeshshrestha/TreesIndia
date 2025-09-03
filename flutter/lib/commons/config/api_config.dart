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
    return "$baseUrl$endpoint";
  }

  static bool isAuthRequired(String path) {
    for (final endpoint in ApiEndpoints.endpoints) {
      if (_staticPathMatches(endpoint.path, path)) {
        return endpoint.requiresAuth;
      }
    }

    return false;
  }

  static bool _staticPathMatches(String templatePath, String actualPath) {
    // Direct match
    if (templatePath == actualPath) return true;

    // Check if template has placeholders
    if (!templatePath.contains('{') || !templatePath.contains('}')) {
      return templatePath == actualPath;
    }

    // Split paths into segments
    final templateSegments = templatePath.split('/');
    final actualSegments = actualPath.split('/');

    // Must have same number of segments
    if (templateSegments.length != actualSegments.length) return false;

    // Check each segment
    for (int i = 0; i < templateSegments.length; i++) {
      final templateSegment = templateSegments[i];
      final actualSegment = actualSegments[i];

      // If template segment is a placeholder (contains {}), accept any actual segment
      if (templateSegment.contains('{') && templateSegment.contains('}')) {
        continue;
      }

      // Otherwise, must be exact match
      if (templateSegment != actualSegment) return false;
    }

    return true;
  }
}
