import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';

import '../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../../../../commons/presenters/providers/location_onboarding_provider.dart';
import '../providers/location_onboarding_providers.dart';
import '../viewmodels/location_onboarding_state.dart';

class LocationOnboardingPage extends ConsumerStatefulWidget {
  const LocationOnboardingPage({super.key});

  @override
  ConsumerState<LocationOnboardingPage> createState() =>
      _LocationOnboardingPageState();
}

class _LocationOnboardingPageState
    extends ConsumerState<LocationOnboardingPage> {
  bool? _isFirstLogin;

  @override
  void initState() {
    super.initState();
    _checkFirstLoginStatus();
  }

  Future<void> _checkFirstLoginStatus() async {
    try {
      final locationService = ref.read(locationOnboardingServiceProvider);
      final isFirstLogin = await locationService.isFirstLogin();
      if (mounted) {
        setState(() {
          _isFirstLogin = isFirstLogin;
        });
      }
    } catch (e) {
      debugPrint('Error checking first login status: $e');
      if (mounted) {
        setState(() {
          _isFirstLogin = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<LocationOnboardingState>(locationOnboardingNotifierProvider,
        (previous, next) {
      if (next is LocationOnboardingLocationSaved) {
        if (_isFirstLogin == true) {
          context.go('/location-loading');
        } else {
          Navigator.of(context).pop(true);
        }
      } else if (next is LocationOnboardingError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: B3Medium(text: next.message),
            backgroundColor: Colors.red,
          ),
        );
      } else if (next is LocationOnboardingPermissionDenied) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: B3Medium(
                text: 'Location permission is required to use this feature'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    });

    final state = ref.watch(locationOnboardingNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.brandNeutral50,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.brandNeutral900),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // Map-like area with location pin
          Expanded(
            flex: 7,
            child: Container(
              width: double.infinity,
              color: AppColors.brandNeutral100,
              child: Stack(
                children: [
                  // Mock map background
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.brandNeutral200,
                      border: Border.all(color: AppColors.brandNeutral300),
                    ),
                  ),
                  // Location pin in center
                  const Center(
                    child: Icon(
                      Icons.location_on,
                      size: 48,
                      color: AppColors.brandPrimary600,
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Bottom content area
          Expanded(
            flex: 4,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  const SizedBox(height: AppSpacing.sm),
                  H3Bold(
                    text: 'Where do you want your service?',
                    color: AppColors.brandNeutral900,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  // Current location button
                  SizedBox(
                    width: double.infinity,
                    child: SolidButtonWidget(
                      label: state is LocationOnboardingLoading
                          ? 'Getting Location...'
                          : 'At my current location',
                      icon: state is LocationOnboardingLoading
                          ? null
                          : Icons.my_location,
                      isLoading: state is LocationOnboardingLoading,
                      onPressed: state is LocationOnboardingLoading
                          ? null
                          : () {
                              ref
                                  .read(locationOnboardingNotifierProvider
                                      .notifier)
                                  .getCurrentLocation(
                                      isFirstLogin: _isFirstLogin ?? true);
                            },
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  // Manual location button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButtonWidget(
                      label: "I'll enter my location manually",
                      onPressed: () {
                        context.push('/manual-location');
                      },
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
