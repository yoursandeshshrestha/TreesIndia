import 'package:trees_india/commons/utils/services/navigation_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Provider for NavigationService singleton
final navigationServiceProvider = Provider<NavigationService>((ref) {
  return NavigationService.instance;
});

// Provider for the navigator key through NavigationService
final navigatorKeyProvider = Provider<GlobalKey<NavigatorState>>((ref) {
  final navigationService = ref.watch(navigationServiceProvider);
  return navigationService.navigatorKey;
});
