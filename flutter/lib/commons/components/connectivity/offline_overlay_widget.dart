import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';

/// Full-screen blocking overlay that appears when the device goes offline.
/// Cannot be dismissed by user interaction - only disappears when connectivity is restored.
class OfflineOverlayWidget extends ConsumerStatefulWidget {
  const OfflineOverlayWidget({super.key});

  @override
  ConsumerState<OfflineOverlayWidget> createState() => _OfflineOverlayWidgetState();
}

class _OfflineOverlayWidgetState extends ConsumerState<OfflineOverlayWidget> {
  bool _isRetrying = false;

  Future<void> _handleRetry() async {
    setState(() {
      _isRetrying = true;
    });

    try {
      final connectivityService = ref.read(connectivityServiceProvider);
      final isConnected = await connectivityService.isConnected();

      if (isConnected) {
        // Connectivity is restored, the overlay will automatically disappear
        // because ConnectivityNotifier will update its state
        debugPrint('OfflineOverlay: Connectivity restored on retry');
      } else {
        // Still offline, show feedback to user
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Still offline. Please check your connection.'),
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('OfflineOverlay: Error checking connectivity: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isRetrying = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Container(
        color: Colors.black.withValues(alpha: 0.85),
        child: Center(
        child: Container(
          margin: const EdgeInsets.all(32),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Offline Icon
              Container(
                width: 80,
                height: 80,
                decoration: const BoxDecoration(
                  color: AppColors.stateRed100,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.wifi_off_rounded,
                  size: 48,
                  color: AppColors.stateRed600,
                ),
              ),
              const SizedBox(height: 24),

              // Title
              H2Medium(
                text: 'You\'re Offline',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: 8),

              // Description
              B3Medium(
                text: 'Please check your internet connection and try again.',
                color: AppColors.brandNeutral600,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Retry Button
              SizedBox(
                width: double.infinity,
                child: SolidButtonWidget(
                  label: _isRetrying ? 'Checking...' : 'Retry',
                  onPressed: _isRetrying ? null : _handleRetry,
                  isLoading: _isRetrying,
                ),
              ),
            ],
          ),
        ),
      ),
      ),
    );
  }
}
