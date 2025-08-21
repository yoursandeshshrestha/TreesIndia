class ApiEndpoint {
  final String path;
  final bool requiresAuth;
  final bool useRegionBaseUrl;

  ApiEndpoint(
      {required this.path,
      required this.requiresAuth,
      required this.useRegionBaseUrl});

  @override
  String toString() {
    return 'ApiEndpoint{path: $path, requiresAuth: $requiresAuth}';
  }
}
