import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

final GlobalKey<NavigatorState> appNavigatorKey = GlobalKey<NavigatorState>();

class NavigationService {
  NavigationService._();
  static final NavigationService _instance = NavigationService._();
  static NavigationService get instance => _instance;

  GlobalKey<NavigatorState> get navigatorKey => appNavigatorKey;

  Future<void> replaceWith(String routePath, {Object? extra}) async {
    final context = appNavigatorKey.currentContext;
    if (context != null) {
      try {
        // Find the GoRouter instance in the widget tree
        final router = GoRouter.of(context);
        router.pushReplacement(routePath, extra: extra);
        print('Navigation replacement to $routePath successful');
      } catch (e) {
        print('Navigation error: $e');
        // Fallback: try using context extension
        try {
          context.pushReplacement(routePath, extra: extra);
        } catch (e2) {
          print('Fallback navigation also failed: $e2');
        }
      }
    } else {
      print('NavigationService: No context available from appNavigatorKey');
    }
  }

  Future<void> navigateTo(String routePath, {Object? extra}) async {
    final context = appNavigatorKey.currentContext;
    if (context != null) {
      try {
        context.push(routePath, extra: extra);
      } catch (e) {
        print('Navigation error: $e');
      }
    }
  }

  void go(String routePath, {Object? extra}) {
    final context = appNavigatorKey.currentContext;
    if (context != null) {
      try {
        context.go(routePath, extra: extra);
      } catch (e) {
        print('Navigation error: $e');
      }
    }
  }

  void goBack() {
    final context = appNavigatorKey.currentContext;
    if (context != null) {
      try {
        context.pop();
      } catch (e) {
        print('Navigation error: $e');
      }
    }
  }
}
