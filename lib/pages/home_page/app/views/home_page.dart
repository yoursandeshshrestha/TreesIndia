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
import 'widgets/simple_banner_widget.dart';
import 'widgets/app_header_widget.dart';
import 'widgets/subcategory_loading_skeleton.dart';
import 'widgets/popular_categories_widget.dart';
import '../../../../../commons/components/textfield/app/views/alphabetic_textfield_widget.dart';
import '../../../../../commons/components/popular_services/app/views/popular_services_widget.dart';

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
        body: Container(
          color: Colors.white,
          child: SafeArea(
            child: Column(
              children: [
                // Fixed Header Section
                AppHeaderWidget(
                  currentLocation: _currentLocation,
                  onLocationTap: _navigateToLocationPicker,
                  onBellTap: () {
                    // TODO: Handle bell icon tap
                    print('Bell icon tapped');
                  },
                ),

                const SizedBox(height: AppSpacing.md),

                // Fixed Search Bar
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.brandNeutral200,
                        width: 1,
                      ),
                    ),
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Search for services...',
                        hintStyle: const TextStyle(
                          fontSize: 14,
                          color: AppColors.brandNeutral400,
                        ),
                        prefixIcon: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Image.asset(
                            'assets/icons/search.png',
                            width: 20,
                            height: 20,
                            color: AppColors.brandNeutral600,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(
                                Icons.search,
                                size: 20,
                                color: AppColors.brandNeutral600,
                              );
                            },
                          ),
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      onChanged: (value) {
                        // TODO: Handle search
                        print('Search: $value');
                      },
                    ),
                  ),
                ),

                const SizedBox(height: AppSpacing.lg),

                // Scrollable Content
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Banner Section
                        SimpleBannerWidget(
                          items: const [
                            BannerItem(
                              id: "1",
                              image: "assets/images/banner_one.png",
                            ),
                            BannerItem(
                              id: "2",
                              image: "assets/images/banner_two.png",
                            ),
                            BannerItem(
                              id: "3",
                              image: "assets/images/banner_three.png",
                            ),
                          ],
                        ),

                        const SizedBox(height: AppSpacing.xl),

                        // What are you looking for Section
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.lg),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Headline
                              H2Bold(
                                text: 'What are you looking for?',
                                color: AppColors.brandNeutral900,
                              ),
                              const SizedBox(height: AppSpacing.lg),
                              // Service Category Cards
                              ServiceCategoryTabsWidget(
                                onCategorySelected:
                                    (serviceCategory, categoryEntity) {
                                  _showServicesBottomSheet(
                                      context, serviceCategory, categoryEntity);
                                },
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: AppSpacing.xl),

                        // Popular Services Section
                        PopularServicesWidget(
                          onSeeAllTap: () {
                            // Handle "See all" tap - navigate to services page
                            context.push('/services');
                          },
                        ),

                        const SizedBox(height: AppSpacing.xl),

                        // Popular Categories Section
                        PopularCategoriesWidget(
                          onSeeAllTap: () {
                            // Handle "See all" tap - navigate to categories page
                            context.push('/services');
                          },
                          onCategoryTap: () {
                            // Handle category tap - navigate to specific category
                            print('Category tapped');
                          },
                        ),

                        const SizedBox(height: AppSpacing.xl),
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
