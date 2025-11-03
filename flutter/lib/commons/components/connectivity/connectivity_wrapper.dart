import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';
import 'package:trees_india/commons/components/connectivity/offline_overlay_widget.dart';
import 'package:trees_india/commons/presenters/providers/connectivity_refresh_service_provider.dart';

/// Global wrapper that handles connectivity changes across the entire app.
///
/// - Shows a full-screen blocking overlay when the device goes offline
/// - Automatically triggers refresh callbacks when connectivity is restored
/// - Should wrap the entire MaterialApp to work globally
class ConnectivityWrapper extends ConsumerStatefulWidget {
  final Widget child;

  const ConnectivityWrapper({
    super.key,
    required this.child,
  });

  @override
  ConsumerState<ConnectivityWrapper> createState() => _ConnectivityWrapperState();
}

class _ConnectivityWrapperState extends ConsumerState<ConnectivityWrapper> {
  @override
  Widget build(BuildContext context) {
    final isConnected = ref.watch(connectivityNotifierProvider);

    // Listen to connectivity changes and trigger refresh callbacks
    ref.listen<bool>(
      connectivityNotifierProvider,
      (previous, current) {
        // Detect transition from offline to online
        if (previous == false && current == true) {
          debugPrint('ConnectivityWrapper: Device came back online, triggering refresh callbacks');
          final refreshService = ref.read(connectivityRefreshServiceProvider);
          refreshService.triggerAllCallbacks();
        }

        // Log transition from online to offline
        if (previous == true && current == false) {
          debugPrint('ConnectivityWrapper: Device went offline');
        }
      },
    );

    return Stack(
      alignment: Alignment.center,
      children: [
        // The main app content
        widget.child,

        // Show offline overlay when not connected
        if (!isConnected)
          const Positioned.fill(
            child: OfflineOverlayWidget(),
          ),
      ],
    );
  }
}
