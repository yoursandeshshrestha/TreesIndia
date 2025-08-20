// lib/pages/home_page/app/views/home_page.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/utils/services/auth_notifier.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import 'package:trees_india/commons/domain/entities/location_entity.dart';
import 'package:trees_india/commons/components/main_layout/app/views/main_layout_widget.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  LocationEntity? _currentLocation;

  @override
  void initState() {
    super.initState();
    _loadCurrentLocation();
  }

  Future<void> _loadCurrentLocation() async {
    try {
      final locationService = ref.read(locationOnboardingServiceProvider);
      final location = await locationService.getSavedLocation();
      if (mounted) {
        setState(() {
          _currentLocation = location;
        });
      }
    } catch (e) {
      debugPrint('Error loading location: $e');
    }
  }

  String _getDisplayLocation(LocationEntity location) {
    // Fallback to first two parts of address
    final parts = location.address.split(', ');
    if (parts.length >= 2) {
      return '${parts[0]}, ${parts[1]}';
    }
    return location.address;
  }

  String _getDisplayLocationWithCountry(LocationEntity location) {
    if (location.city != null && location.state != null) {
      return '${location.city}, ${location.state} - ${location.country}';
    } else if (location.city != null) {
      return location.city!;
    } else {
      return location.address;
    }
  }

  void _navigateToLocationPicker() async {
    final result = await context.push('/location-onboarding');
    if (result == true) {
      _loadCurrentLocation();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return MainLayoutWidget(
      currentIndex: 0,
      child: Scaffold(
        backgroundColor: AppColors.brandNeutral50,
        appBar: AppBar(
          title: GestureDetector(
            onTap: _navigateToLocationPicker,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_currentLocation != null) ...[
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on,
                        size: 20,
                        color: AppColors.brandPrimary600,
                      ),
                      const SizedBox(width: 4),
                      Flexible(
                        child: B1Bold(
                          text: _getDisplayLocation(_currentLocation!),
                          color: AppColors.brandNeutral800,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.keyboard_arrow_down,
                        size: 18,
                        color: AppColors.brandNeutral600,
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const SizedBox(width: 4),
                      Flexible(
                        child: B3Regular(
                          text:
                              _getDisplayLocationWithCountry(_currentLocation!),
                          color: AppColors.brandNeutral600,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          backgroundColor: Colors.transparent,
          elevation: 0,
          actions: [
            const SizedBox(width: AppSpacing.md),
          ],
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Welcome Section
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.brandPrimary200,
                      width: 1,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      H2Bold(
                        text: 'Welcome!',
                        color: AppColors.brandPrimary900,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      B2Regular(
                        text: 'You are successfully logged in to Trees India.',
                        color: AppColors.brandPrimary700,
                      ),
                      if (user != null) ...[
                        const SizedBox(height: AppSpacing.md),
                        B3Medium(
                          text: 'User ID: ${user.userId ?? 'N/A'}',
                          color: AppColors.brandPrimary600,
                        ),
                        if (user.name != null && user.name!.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.xs),
                          B3Medium(
                            text: 'Name: ${user.name}',
                            color: AppColors.brandPrimary600,
                          ),
                        ],
                        if (user.email != null && user.email!.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.xs),
                          B3Medium(
                            text: 'Email: ${user.email}',
                            color: AppColors.brandPrimary600,
                          ),
                        ],
                        if (user.phone != null && user.phone!.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.xs),
                          B3Medium(
                            text: 'Phone: ${user.phone}',
                            color: AppColors.brandPrimary600,
                          ),
                        ],
                        if (user.gender != null && user.gender!.isNotEmpty) ...[
                          const SizedBox(height: AppSpacing.xs),
                          B3Medium(
                            text: 'Gender: ${user.gender}',
                            color: AppColors.brandPrimary600,
                          ),
                        ],
                        if (user.isVerified != null) ...[
                          const SizedBox(height: AppSpacing.xs),
                          Row(
                            children: [
                              Icon(
                                true ? Icons.verified : Icons.warning,
                                size: 16,
                                color: true
                                    ? AppColors.stateGreen600
                                    : AppColors.stateYellow600,
                              ),
                              const SizedBox(width: AppSpacing.xs),
                              B3Medium(
                                text: true ? 'Verified' : 'Not Verified',
                                color: true
                                    ? AppColors.stateGreen600
                                    : AppColors.stateYellow600,
                              ),
                            ],
                          ),
                        ],
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),

                // Content Section
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.home,
                          size: 80,
                          color: AppColors.stateGreen600,
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        H3Bold(
                          text: 'Home Page',
                          color: AppColors.brandNeutral900,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        B2Regular(
                          text: 'Your dashboard content will go here.',
                          color: AppColors.brandNeutral600,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
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
