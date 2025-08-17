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

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  bool _isLoggingOut = false;
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

  Future<void> _logout() async {
    setState(() {
      _isLoggingOut = true;
    });

    try {
      await ref.read(authProvider.notifier).logout();
      if (mounted) {
        // Navigate to login page after successful logout
        context.go('/login');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Logout failed: ${e.toString()}'),
            backgroundColor: AppColors.stateRed600,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoggingOut = false;
        });
      }
    }
  }

  String _getDisplayLocation(LocationEntity location) {
    if (location.city != null && location.state != null) {
      return '${location.city}, ${location.state}';
    } else if (location.city != null) {
      return location.city!;
    } else {
      // Fallback to first two parts of address
      final parts = location.address.split(', ');
      if (parts.length >= 2) {
        return '${parts[0]}, ${parts[1]}';
      }
      return location.address;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      backgroundColor: AppColors.brandNeutral50,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            H3Bold(
              text: 'Trees India',
              color: AppColors.brandNeutral900,
            ),
            if (_currentLocation != null) ...[
              const SizedBox(height: 2),
              Row(
                children: [
                  const Icon(
                    Icons.location_on,
                    size: 14,
                    color: AppColors.brandPrimary600,
                  ),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      _getDisplayLocation(_currentLocation!),
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.brandNeutral600,
                        fontWeight: FontWeight.normal,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _isLoggingOut ? null : _logout,
            icon: _isLoggingOut
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.brandNeutral600,
                      ),
                    ),
                  )
                : const Icon(
                    Icons.logout,
                    color: AppColors.brandNeutral600,
                  ),
            tooltip: 'Logout',
          ),
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
                      if (user.isVerified != null) ...[
                        const SizedBox(height: AppSpacing.xs),
                        Row(
                          children: [
                            Icon(
                              user.isVerified! ? Icons.verified : Icons.warning,
                              size: 16,
                              color: user.isVerified!
                                  ? AppColors.stateGreen600
                                  : AppColors.stateYellow600,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            B3Medium(
                              text: user.isVerified!
                                  ? 'Verified'
                                  : 'Not Verified',
                              color: user.isVerified!
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

              // Logout Section
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: SolidButtonWidget(
                  label: 'Logout',
                  backgroundColor: AppColors.stateRed600,
                  isLoading: _isLoggingOut,
                  onPressed: _isLoggingOut ? null : _logout,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
