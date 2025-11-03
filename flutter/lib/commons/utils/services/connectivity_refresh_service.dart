import 'package:flutter/material.dart';

/// Service that manages refresh callbacks for pages that want to auto-refresh
/// when connectivity is restored from offline to online.
class ConnectivityRefreshService {
  final Map<String, VoidCallback> _callbacks = {};

  /// Registers a refresh callback with a unique identifier
  /// Pages should register their callback when mounted and unregister when disposed
  void registerRefreshCallback(String identifier, VoidCallback callback) {
    _callbacks[identifier] = callback;
    debugPrint('ConnectivityRefreshService: Registered callback for $identifier');
  }

  /// Unregisters a refresh callback by its identifier
  void unregisterRefreshCallback(String identifier) {
    _callbacks.remove(identifier);
    debugPrint('ConnectivityRefreshService: Unregistered callback for $identifier');
  }

  /// Triggers all registered refresh callbacks
  /// Called when connectivity is restored from offline to online
  void triggerAllCallbacks() {
    debugPrint('ConnectivityRefreshService: Triggering ${_callbacks.length} callbacks');
    for (var entry in _callbacks.entries) {
      try {
        entry.value();
        debugPrint('ConnectivityRefreshService: Successfully triggered ${entry.key}');
      } catch (e) {
        debugPrint('ConnectivityRefreshService: Error triggering ${entry.key}: $e');
      }
    }
  }

  /// Returns the number of registered callbacks
  int get callbackCount => _callbacks.length;

  /// Clears all registered callbacks
  void clear() {
    _callbacks.clear();
    debugPrint('ConnectivityRefreshService: Cleared all callbacks');
  }
}
