class ApiEndpoint {
  final String path;
  final bool requiresAuth;

  ApiEndpoint({required this.path, required this.requiresAuth});

  @override
  String toString() {
    return 'ApiEndpoint{path: $path, requiresAuth: $requiresAuth}';
  }
}
