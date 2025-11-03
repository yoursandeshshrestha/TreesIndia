import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/utils/services/connectivity_refresh_service.dart';

/// Provider for ConnectivityRefreshService
/// This is a singleton that manages refresh callbacks for pages
final connectivityRefreshServiceProvider = Provider<ConnectivityRefreshService>((ref) {
  return ConnectivityRefreshService();
});
