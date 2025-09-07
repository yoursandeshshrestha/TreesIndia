import 'package:flutter/widgets.dart';

String? previousRouteName;
String? currentRoutePath;
List<String> routeStack = [];

// Global navigation callbacks
typedef NavigationCallback = void Function(String from, String to, bool isPop);
List<NavigationCallback> _navigationCallbacks = [];

class NavigatorObserverWrapper extends NavigatorObserver {
  final void Function(Route?, Route) onRouteChanged;
  NavigatorObserverWrapper({required this.onRouteChanged});

  @override
  void didPush(Route route, Route? previousRoute) {
    debugPrint(
        '🧭 NavigatorObserver: didPush - ${route.settings.name} (from ${previousRoute?.settings.name})');
    
    // Also trigger navigation callbacks for push operations
    final fromName = previousRoute?.settings.name ?? 'unknown';
    final toName = route.settings.name ?? 'unknown';
    triggerNavigationCallbacks(fromName, toName, false);
    
    onRouteChanged(previousRoute, route);
  }

  @override
  void didPop(Route route, Route? previousRoute) {
    debugPrint(
        '🧭 NavigatorObserver: didPop - popped ${route.settings.name}, back to ${previousRoute?.settings.name}');
    debugPrint(
        '🧭 Pop details: popped route args: ${route.settings.arguments}, previous route args: ${previousRoute?.settings.arguments}');

    // Update currentRoutePath when popping
    if (previousRoute != null) {
      // Try to extract path from route arguments or name
      final previousPath = _extractPathFromRoute(previousRoute);
      final poppedPath = _extractPathFromRoute(route);

      debugPrint('🧭 Pop paths: from $poppedPath back to $previousPath');

      if (previousPath != null && poppedPath != null) {
        currentRoutePath = previousPath;
        debugPrint('➡️ Popped from $poppedPath to $previousPath');
        // Trigger navigation callbacks
        triggerNavigationCallbacks(poppedPath, previousPath, true);
      }

      onRouteChanged(route, previousRoute);
    }
  }

  @override
  void didRemove(Route route, Route? previousRoute) {
    debugPrint(
        '🧭 NavigatorObserver: didRemove - removed ${route.settings.name}, back to ${previousRoute?.settings.name}');
    if (previousRoute != null) {
      onRouteChanged(route, previousRoute);
    }
  }

  @override
  void didReplace({Route? newRoute, Route? oldRoute}) {
    debugPrint(
        '🧭 NavigatorObserver: didReplace - ${oldRoute?.settings.name} -> ${newRoute?.settings.name}');
    if (newRoute != null && oldRoute != null) {
      onRouteChanged(oldRoute, newRoute);
    }
  }

  // Helper method to extract path from route
  String? _extractPathFromRoute(Route route) {
    // Try to get path from route arguments
    if (route.settings.arguments is Map) {
      final args = route.settings.arguments as Map;
      if (args.containsKey('path')) return args['path'] as String?;
    }

    // Fallback to route name if available
    return route.settings.name;
  }
}

// Global navigation callback functions
void addNavigationCallback(NavigationCallback callback) {
  _navigationCallbacks.add(callback);
}

void removeNavigationCallback(NavigationCallback callback) {
  _navigationCallbacks.remove(callback);
}

void triggerNavigationCallbacks(String from, String to, bool isPop) {
  for (final callback in _navigationCallbacks) {
    callback(from, to, isPop);
  }
}
