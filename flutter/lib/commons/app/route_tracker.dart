import 'package:flutter/widgets.dart';

String? previousRouteName;

class NavigatorObserverWrapper extends NavigatorObserver {
  final void Function(Route?, Route) onRouteChanged;
  NavigatorObserverWrapper({required this.onRouteChanged});

  @override
  void didPush(Route route, Route? previousRoute) {
    onRouteChanged(previousRoute, route);
  }

  @override
  void didReplace({Route? newRoute, Route? oldRoute}) {
    if (newRoute != null && oldRoute != null) {
      onRouteChanged(oldRoute, newRoute);
    }
  }
}
