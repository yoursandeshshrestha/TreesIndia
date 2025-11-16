// lib/pages/home_page/app/views/home_page.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/components/main_layout/app/views/main_layout_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/domain/entities/location_entity.dart';
import 'package:trees_india/commons/mixins/connectivity_refresh_mixin.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import 'package:trees_india/pages/notifications_page/app/providers/notification_providers.dart';
import 'package:trees_india/pages/profile_page/app/providers/profile_providers.dart';

import '../../../../../commons/components/popular_services/app/views/popular_services_widget.dart';
import '../../../rental_and_properties/app/providers/property_providers.dart';
import '../../../rental_and_properties/app/views/widgets/property_grid_widget.dart';
import '../../../rental_and_properties/app/views/widgets/property_card_skeleton.dart';
import '../../domain/entities/category_entity.dart';
import '../../domain/entities/service_entity.dart';
import '../../domain/entities/subcategory_entity.dart';
import '../providers/category_providers.dart';
import '../providers/home_page_providers.dart';
import '../providers/subcategory_providers.dart';
import '../viewmodels/subcategory_state.dart';
import 'widgets/app_header_widget.dart';
import 'widgets/banner_skeleton_widget.dart';
import 'widgets/service_category_tabs_widget.dart';
import 'widgets/simple_banner_widget.dart';
import 'widgets/subcategory_loading_skeleton.dart';
import 'widgets/subscription_lock_modal.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage>
    with ConnectivityRefreshMixin {
  LocationEntity? _currentLocation;

  @override
  void initState() {
    super.initState();
    _loadCurrentLocation();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(profileProvider.notifier).loadProfile();
    });
    // Load popular services, properties, and banners when the page initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadPopularServices();
      ref.read(homePageNotifierProvider.notifier).loadPromotionBanners();
      _initializeNotifications();
      _loadProperties();
    });
  }

  void _initializeNotifications() {
    final notifier = ref.read(notificationNotifierProvider.notifier);

    // Load initial unread count
    notifier.loadUnreadCount();

    // Connect WebSocket if authenticated
    final authState = ref.read(authProvider);
    if (authState.isLoggedIn && authState.token != null) {
      notifier.connectWebSocket(authState.token!.token);
    }
  }

  Future<void> _loadCurrentLocation() async {
    try {
      final locationService = ref.read(locationOnboardingServiceProvider);
      final location = await locationService.getSavedLocation();
      if (mounted) {
        setState(() {
          _currentLocation = location;
        });
        // Reload popular services and properties when location changes
        _loadPopularServices();
        _loadProperties();
      }
    } catch (e) {
      debugPrint('Error loading location: $e');
    }
  }

  void _loadPopularServices() {
    final notifier = ref.read(homePageNotifierProvider.notifier);
    // final city = _currentLocation?.city;
    // final state = _currentLocation?.state;

    notifier.loadPopularServices();
  }

  void _loadProperties() {
    final notifier = ref.read(homePageNotifierProvider.notifier);
    final city = _currentLocation?.city;
    final state = _currentLocation?.state;

    notifier.loadSaleProperties(city: city, state: state);
    notifier.loadRentProperties(city: city, state: state);
  }

  @override
  void onConnectivityRestored() {
    // This is called automatically when connectivity is restored
    _refreshPageData();
  }

  void _refreshPageData() {
    // Reload all page data when connectivity is restored
    try {
      ref.read(profileProvider.notifier).loadProfile();
      _loadPopularServices();
      ref.read(categoryNotifierProvider.notifier).loadCategories();
      ref.read(homePageNotifierProvider.notifier).loadPromotionBanners();
      _initializeNotifications();
      _loadProperties();

      // Show success message to user
      // if (mounted) {
      //   ScaffoldMessenger.of(context).showSnackBar(
      //      const InfoSnackbarWidget(message: 'Connection restored',
      //       duration: Duration(seconds: 2),
      //     ).createSnackBar(),
      //   );
      // }
    } catch (e) {
      debugPrint('Error refreshing page data: $e');
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
    // Check if this is a marketplace category
    final isMarketplace =
        categoryEntity.name.toLowerCase().contains('marketplace');

    if (!isMarketplace) {
      // Load subcategories instead of services for non-marketplace categories
      ref
          .read(subcategoryNotifierProvider.notifier)
          .loadSubcategoriesByCategory(categoryEntity.id);
    }

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
                child: isMarketplace
                    ? _buildMarketplaceOptions(context, categoryEntity)
                    : Consumer(
                        builder: (context, ref, child) {
                          final subcategoryState =
                              ref.watch(subcategoryNotifierProvider);

                          if (subcategoryState.status ==
                              SubcategoryStatus.loading) {
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
                                    // Navigate to services page
                                    context.push(
                                        '/services?category=${categoryEntity.id}&subcategory=${subcategory.id}');
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

  Widget _buildMarketplaceOptions(
      BuildContext context, CategoryEntity categoryEntity) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(profileProvider.notifier).loadProfile();
    });
    // Create hardcoded marketplace subcategories
    final marketplaceSubcategories = [
      SubcategoryEntity(
        id: 1001,
        name: 'Rental & Properties',
        slug: 'rental-properties',
        description: 'Find rental properties and real estate',
        icon: 'assets/icons/building.png',
        parentId: categoryEntity.id,
        parent: categoryEntity,
        isActive: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      SubcategoryEntity(
        id: 1002,
        name: 'Projects',
        slug: 'projects',
        description: 'Browse construction and development projects',
        icon: 'assets/icons/project.png',
        parentId: categoryEntity.id,
        parent: categoryEntity,
        isActive: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      SubcategoryEntity(
        id: 1003,
        name: 'Vendors',
        slug: 'vendors',
        description: 'Find trusted vendors and service providers',
        icon: 'assets/icons/vendor.png',
        parentId: categoryEntity.id,
        parent: categoryEntity,
        isActive: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      SubcategoryEntity(
        id: 1004,
        name: 'Workers',
        slug: 'workers',
        description: 'Connect with skilled workers',
        icon: 'assets/icons/worker.png',
        parentId: categoryEntity.id,
        parent: categoryEntity,
        isActive: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    ];

    return Consumer(
      builder: (context, ref, child) {
        final profileState = ref.watch(profileProvider);
        final hasActiveSubscription = profileState.subscription != null &&
            profileState.subscription!.status == 'active';

        return GridView.builder(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: AppSpacing.md,
            mainAxisSpacing: AppSpacing.md,
            childAspectRatio: 0.9,
          ),
          itemCount: marketplaceSubcategories.length,
          itemBuilder: (context, index) {
            final subcategory = marketplaceSubcategories[index];
            final requiresSubscription =
                subcategory.slug != 'rental-properties';
            final isLocked = requiresSubscription && !hasActiveSubscription;

            return _MarketplaceSubcategoryCard(
              subcategory: subcategory,
              isLocked: isLocked,
              onTap: () {
                Navigator.of(context).pop();

                if (isLocked) {
                  // Show subscription lock modal
                  _showSubscriptionLockModal(context, subcategory.slug);
                } else {
                  // Navigate to marketplace pages based on subcategory
                  _navigateToMarketplace(context, subcategory.slug);
                }
              },
            );
          },
        );
      },
    );
  }

  void _showSubscriptionLockModal(BuildContext context, String slug) {
    MarketplaceType type;
    switch (slug) {
      case 'projects':
        type = MarketplaceType.projects;
        break;
      case 'vendors':
        type = MarketplaceType.vendors;
        break;
      case 'workers':
        type = MarketplaceType.workers;
        break;
      default:
        return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SubscriptionLockModal(type: type),
    );
  }

  void _navigateToMarketplace(BuildContext context, String slug) {
    switch (slug) {
      case 'rental-properties':
        context.push('/marketplace/rental-properties');
        break;
      case 'projects':
        context.push('/marketplace/projects');
        break;
      case 'vendors':
        context.push('/marketplace/vendors');
        break;
      case 'workers':
        context.push('/marketplace/workers');
        break;
      default:
        debugPrint('Unknown marketplace subcategory: $slug');
    }
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
                    context.push('/notifications');
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
                      readOnly: true,
                      onTap: () {
                        context.push('/search');
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
                        Consumer(
                          builder: (context, ref, child) {
                            final homePageState =
                                ref.watch(homePageNotifierProvider);

                            // Filter banners: only show active banners with non-empty images
                            final activeBanners = homePageState.promotionBanners
                                .where((banner) =>
                                    banner.isActive && banner.image.isNotEmpty)
                                .map((banner) => BannerItem(
                                      id: banner.id.toString(),
                                      image: banner.image,
                                      link: banner.link,
                                      isNetworkImage: true,
                                    ))
                                .toList();

                            // Only show banner section if there are active banners
                            if (activeBanners.isEmpty &&
                                !homePageState.isLoadingPromotionBanners) {
                              return const SizedBox.shrink();
                            }

                            return Column(
                              children: [
                                // Top divider
                                Container(
                                  height: 8,
                                  color: const Color(0xFFF5F5F5),
                                ),
                                // Banner with white background
                                Container(
                                  color: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                      vertical: AppSpacing.lg),
                                  child: homePageState.isLoadingPromotionBanners
                                      ? const BannerSkeletonWidget()
                                      : SimpleBannerWidget(
                                          items: activeBanners,
                                        ),
                                ),
                                // Bottom divider
                                Container(
                                  height: 8,
                                  color: const Color(0xFFF5F5F5),
                                ),
                              ],
                            );
                          },
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
                              H3Bold(
                                text: 'What are you looking for?',
                                color: AppColors.brandNeutral900,
                              ),
                              const SizedBox(height: AppSpacing.md),
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

                        // Listed Properties Section
                        Consumer(
                          builder: (context, ref, child) {
                            final homePageState =
                                ref.watch(homePageNotifierProvider);
                            final locationCity =
                                _currentLocation?.city ?? 'your area';

                            // Show skeleton during loading (no header)
                            if (homePageState.isLoadingSaleProperties) {
                              return SizedBox(
                                height: 350,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: AppSpacing.lg),
                                  itemCount: 2,
                                  itemBuilder: (context, index) {
                                    return Container(
                                      margin: EdgeInsets.only(
                                        right: index < 1 ? AppSpacing.md : 0,
                                      ),
                                      child: const PropertyCardSkeleton(
                                        version: 'home',
                                      ),
                                    );
                                  },
                                ),
                              );
                            } else if (homePageState
                                .saleProperties.isNotEmpty) {
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Section Header with View All button
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: AppSpacing.lg),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        H4Bold(
                                          text:
                                              'Listed Properties in $locationCity',
                                          color: AppColors.brandNeutral900,
                                        ),
                                        GestureDetector(
                                          onTap: () {
                                            ref
                                                .read(propertyNotifierProvider
                                                    .notifier)
                                                .setListingType('sale');
                                            context.push(
                                                '/marketplace/rental-properties');
                                          },
                                          child: const Text(
                                            'See all',
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w500,
                                              color: Color(0xFF055c3a),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: AppSpacing.md),

                                  // Properties List
                                  SizedBox(
                                    height: 350,
                                    child: ListView.builder(
                                      scrollDirection: Axis.horizontal,
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: AppSpacing.lg),
                                      itemCount:
                                          homePageState.saleProperties.length,
                                      itemBuilder: (context, index) {
                                        final property =
                                            homePageState.saleProperties[index];
                                        return Container(
                                          width: 320,
                                          margin: EdgeInsets.only(
                                            right: index <
                                                    homePageState.saleProperties
                                                            .length -
                                                        1
                                                ? AppSpacing.md
                                                : 0,
                                          ),
                                          child: PropertyCard(
                                            property: property,
                                            version: 'home',
                                            onTap: () {
                                              context.push(
                                                  '/rental-properties/${property.id}');
                                            },
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                  const SizedBox(height: AppSpacing.xl),
                                ],
                              );
                            }
                            // Hide entire section when empty
                            else {
                              return const SizedBox.shrink();
                            }
                          },
                        ),

                        // Listed Rentals Section
                        Consumer(
                          builder: (context, ref, child) {
                            final homePageState =
                                ref.watch(homePageNotifierProvider);
                            final locationCity =
                                _currentLocation?.city ?? 'your area';

                            // Show skeleton during loading (no header)
                            if (homePageState.isLoadingRentProperties) {
                              return SizedBox(
                                height: 350,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: AppSpacing.lg),
                                  itemCount: 2,
                                  itemBuilder: (context, index) {
                                    return Container(
                                      margin: EdgeInsets.only(
                                        right: index < 1 ? AppSpacing.md : 0,
                                      ),
                                      child: const PropertyCardSkeleton(
                                        version: 'home',
                                      ),
                                    );
                                  },
                                ),
                              );
                            } else if (homePageState
                                .rentProperties.isNotEmpty) {
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Section Header with View All button
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: AppSpacing.lg),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        H4Bold(
                                          text:
                                              'Listed Rentals in $locationCity',
                                          color: AppColors.brandNeutral900,
                                        ),
                                        GestureDetector(
                                          onTap: () {
                                            ref
                                                .read(propertyNotifierProvider
                                                    .notifier)
                                                .setListingType('rent');
                                            context.push(
                                                '/marketplace/rental-properties');
                                          },
                                          child: const Text(
                                            'See all',
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w500,
                                              color: Color(0xFF055c3a),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: AppSpacing.md),

                                  // Properties List
                                  SizedBox(
                                    height: 350,
                                    child: ListView.builder(
                                      scrollDirection: Axis.horizontal,
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: AppSpacing.lg),
                                      itemCount:
                                          homePageState.rentProperties.length,
                                      itemBuilder: (context, index) {
                                        final property =
                                            homePageState.rentProperties[index];
                                        return Container(
                                          width: 320,
                                          margin: EdgeInsets.only(
                                            right: index <
                                                    homePageState.rentProperties
                                                            .length -
                                                        1
                                                ? AppSpacing.md
                                                : 0,
                                          ),
                                          child: PropertyCard(
                                            property: property,
                                            version: 'home',
                                            onTap: () {
                                              context.push(
                                                  '/rental-properties/${property.id}');
                                            },
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                  const SizedBox(height: AppSpacing.xl),
                                ],
                              );
                            }
                            // Hide entire section when empty
                            else {
                              return const SizedBox.shrink();
                            }
                          },
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

class _SubcategoryCard extends StatefulWidget {
  final SubcategoryEntity subcategory;
  final VoidCallback onTap;

  const _SubcategoryCard({
    required this.subcategory,
    required this.onTap,
  });

  @override
  State<_SubcategoryCard> createState() => _SubcategoryCardState();
}

class _SubcategoryCardState extends State<_SubcategoryCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        transform:
            _isPressed ? (Matrix4.identity()..scale(0.95)) : Matrix4.identity(),
        child: SizedBox(
          height: 120,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Icon container
              Container(
                width: double.infinity,
                height: 80,
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Icon(
                    Icons.build_outlined,
                    size: 40,
                    color: AppColors.brandNeutral600,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              // Title text
              Expanded(
                child: Text(
                  widget.subcategory.name,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Colors.black,
                    height: 1.3,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MarketplaceSubcategoryCard extends StatefulWidget {
  final SubcategoryEntity subcategory;
  final bool isLocked;
  final VoidCallback onTap;

  const _MarketplaceSubcategoryCard({
    required this.subcategory,
    required this.isLocked,
    required this.onTap,
  });

  @override
  State<_MarketplaceSubcategoryCard> createState() =>
      _MarketplaceSubcategoryCardState();
}

class _MarketplaceSubcategoryCardState
    extends State<_MarketplaceSubcategoryCard> {
  bool _isPressed = false;

  IconData _getIconForSlug(String slug) {
    switch (slug) {
      case 'rental-properties':
        return Icons.home_outlined;
      case 'projects':
        return Icons.construction_outlined;
      case 'vendors':
        return Icons.business_outlined;
      case 'workers':
        return Icons.person_outline;
      default:
        return Icons.build_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        transform:
            _isPressed ? (Matrix4.identity()..scale(0.95)) : Matrix4.identity(),
        child: SizedBox(
          height: 120,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Icon container with lock overlay
              Container(
                width: double.infinity,
                height: 80,
                decoration: BoxDecoration(
                  color: widget.isLocked
                      ? const Color(0xFFF0F0F0)
                      : const Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Stack(
                  children: [
                    Center(
                      child: Icon(
                        _getIconForSlug(widget.subcategory.slug),
                        size: 40,
                        color: widget.isLocked
                            ? AppColors.brandNeutral400
                            : AppColors.brandNeutral600,
                      ),
                    ),
                    if (widget.isLocked)
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.lock,
                            size: 16,
                            color: AppColors.brandNeutral600,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              // Title text
              Expanded(
                child: Text(
                  widget.subcategory.name,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: widget.isLocked
                        ? AppColors.brandNeutral500
                        : Colors.black,
                    height: 1.3,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
