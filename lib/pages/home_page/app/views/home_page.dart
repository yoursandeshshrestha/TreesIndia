// lib/pages/home_page/app/views/home_page.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/main_layout/app/views/main_layout_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/domain/entities/location_entity.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import 'package:trees_india/pages/home_page/app/views/widgets/service_banner_widget.dart';

import '../../domain/entities/category_entity.dart';
import '../../domain/entities/service_entity.dart';
import '../../domain/entities/subcategory_entity.dart';
import '../providers/subcategory_providers.dart';
import '../../../services_page/app/providers/service_providers.dart';
import '../viewmodels/subcategory_state.dart';
import 'widgets/service_banner_list_widget.dart';
import 'widgets/service_category_tabs_widget.dart';
import 'widgets/subcategory_loading_skeleton.dart';

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
    final result = await context.push('/manual-location');
    if (result == true) {
      _loadCurrentLocation();
    }
  }

  String _getCategoryDisplayName(ServiceCategory category) {
    switch (category) {
      case ServiceCategory.homeServices:
        return 'Home Services';
      case ServiceCategory.constructionServices:
        return 'Construction Services';
      case ServiceCategory.rentalAndProperties:
        return 'Rental & Properties';
    }
  }

  void _showServicesBottomSheet(BuildContext context, ServiceCategory category,
      CategoryEntity categoryEntity) {
    // Load subcategories instead of services
    ref
        .read(subcategoryNotifierProvider.notifier)
        .loadSubcategoriesByCategory(categoryEntity.id);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        builder: (context, scrollController) => Container(
          width: double.maxFinite,
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.brandNeutral300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              H3Bold(
                text: _getCategoryDisplayName(category),
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: Consumer(
                  builder: (context, ref, child) {
                    final subcategoryState =
                        ref.watch(subcategoryNotifierProvider);

                    if (subcategoryState.status == SubcategoryStatus.loading) {
                      return const SubcategoryLoadingSkeleton();
                    } else if (subcategoryState.status ==
                        SubcategoryStatus.failure) {
                      return Center(
                        child: B2Regular(
                          text: 'Failed to load subcategories',
                          color: AppColors.stateRed600,
                        ),
                      );
                    } else if (subcategoryState.subcategories.isEmpty) {
                      return Center(
                        child: B2Regular(
                          text: 'No subcategories available',
                          color: AppColors.brandNeutral600,
                        ),
                      );
                    } else {
                      return GridView.builder(
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          crossAxisSpacing: AppSpacing.md,
                          mainAxisSpacing: AppSpacing.md,
                          childAspectRatio: 0.9,
                        ),
                        itemCount: subcategoryState.subcategories.length,
                        itemBuilder: (context, index) {
                          final subcategory =
                              subcategoryState.subcategories[index];
                          return _SubcategoryCard(
                            subcategory: subcategory,
                            onTap: () {
                              Navigator.of(context).pop();
                              // Set category and subcategory in services page state
                              ref
                                  .read(serviceNotifierProvider.notifier)
                                  .setCategoryAndSubcategory(
                                      categoryEntity, subcategory);
                              // Navigate to services page
                              context.push(
                                  '/services/${categoryEntity.id}/${subcategory.id}');
                            },
                          );
                        },
                      );
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MainLayoutWidget(
      currentIndex: 0,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Section
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.sm,
                  AppSpacing.lg,
                  AppSpacing.md,
                ),
                child: GestureDetector(
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
                          ],
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const SizedBox(width: 4),
                            Flexible(
                              child: B3Regular(
                                text: _getDisplayLocationWithCountry(
                                    _currentLocation!),
                                color: AppColors.brandNeutral600,
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
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Service Categories Grid
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    H2Bold(
                      text: 'What are you looking for?',
                      color: AppColors.brandNeutral900,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),
              // Service Category Cards
              ServiceCategoryTabsWidget(
                onCategorySelected: (serviceCategory, categoryEntity) {
                  _showServicesBottomSheet(
                      context, serviceCategory, categoryEntity);
                },
              ),

              const SizedBox(height: AppSpacing.lg),

              Container(
                width: double.maxFinite,
                height: 8,
                color: AppColors.brandNeutral100,
              ),

              const SizedBox(height: AppSpacing.lg),

              // Promotional Banners
              ServiceBannerListWidget(
                banners: [
                  ServiceBannerWidget(
                    title: 'Work with our best service provider',
                    description: 'Get professional services for your home',
                    buttonText: 'Book',
                    backgroundColor: const Color(0xFFFBB040),
                    imagePath: 'assets/images/electrician.jpg',
                    onButtonPressed: () {
                      // TODO: Navigate to booking
                    },
                  ),
                  ServiceBannerWidget(
                    title: 'Construction made easy',
                    description: 'Expert builders for your dream home',
                    buttonText: 'Explore',
                    backgroundColor: const Color(0xFFFF6B35),
                    imagePath: 'assets/images/electrician.jpg',
                    onButtonPressed: () {
                      // TODO: Navigate to construction services
                    },
                  ),
                  ServiceBannerWidget(
                    title: 'Marketplace deals',
                    description: 'Best prices on materials',
                    buttonText: 'Shop',
                    backgroundColor: const Color(0xFF4ECDC4),
                    onButtonPressed: () {
                      // TODO: Navigate to marketplace
                    },
                  ),
                  ServiceBannerWidget(
                    title: 'Marketplace deals',
                    description: 'Best prices on materials',
                    buttonText: 'Shop',
                    backgroundColor: const Color(0xFF4ECDC4),
                    onButtonPressed: () {
                      // TODO: Navigate to marketplace
                    },
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.lg),

              Container(
                width: double.maxFinite,
                height: 8,
                color: AppColors.brandNeutral100,
              ),

              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}

class _SubcategoryCard extends StatelessWidget {
  final SubcategoryEntity subcategory;
  final VoidCallback onTap;

  const _SubcategoryCard({
    required this.subcategory,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.brandNeutral200),
          boxShadow: [
            BoxShadow(
              color: AppColors.brandNeutral900.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 3,
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: AppColors.brandPrimary50,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12),
                  ),
                ),
                child: const Icon(
                  Icons.build_outlined,
                  size: 32,
                  color: AppColors.brandPrimary600,
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                    vertical: 0, horizontal: AppSpacing.sm),
                child: B4Medium(
                  text: subcategory.name,
                  color: AppColors.brandNeutral900,
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
