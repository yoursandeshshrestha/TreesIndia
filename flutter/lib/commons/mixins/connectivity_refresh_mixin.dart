import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/connectivity_refresh_service_provider.dart';
import 'package:trees_india/commons/utils/services/connectivity_refresh_service.dart';

/// Mixin for pages that want to auto-refresh when connectivity is restored.
///
/// Usage:
/// ```dart
/// class MyPage extends ConsumerStatefulWidget {
///   @override
///   ConsumerState<MyPage> createState() => _MyPageState();
/// }
///
/// class _MyPageState extends ConsumerState<MyPage> with ConnectivityRefreshMixin {
///   @override
///   void onConnectivityRestored() {
///     // Refresh your page data here
///     ref.read(myDataProvider.notifier).refresh();
///   }
/// }
/// ```
mixin ConnectivityRefreshMixin<T extends ConsumerStatefulWidget> on ConsumerState<T> {
  String get _callbackIdentifier => '${T.toString()}_$hashCode';

  // Cache the service instance to avoid using ref after disposal
  ConnectivityRefreshService? _connectivityService;

  @override
  void initState() {
    super.initState();
    // Register refresh callback after the frame is rendered
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _registerCallback();
    });
  }

  @override
  void dispose() {
    _unregisterCallback();
    super.dispose();
  }

  void _registerCallback() {
    _connectivityService = ref.read(connectivityRefreshServiceProvider);
    _connectivityService?.registerRefreshCallback(_callbackIdentifier, onConnectivityRestored);
  }

  void _unregisterCallback() {
    // Use cached service instance instead of ref.read to avoid disposal errors
    _connectivityService?.unregisterRefreshCallback(_callbackIdentifier);
  }

  /// Override this method to define what should happen when connectivity is restored.
  /// This will be called automatically when the device goes from offline to online.
  void onConnectivityRestored();
}
