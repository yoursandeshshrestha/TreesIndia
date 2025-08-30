import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../domain/entities/category_entity.dart';
import '../../../domain/entities/service_entity.dart';
import '../../providers/category_providers.dart';
import '../../viewmodels/category_state.dart';
import 'category_loading_skeleton.dart';

class ServiceCategoryTabsWidget extends ConsumerStatefulWidget {
  final Function(ServiceCategory, CategoryEntity) onCategorySelected;

  const ServiceCategoryTabsWidget({
    super.key,
    required this.onCategorySelected,
  });

  @override
  ConsumerState<ServiceCategoryTabsWidget> createState() =>
      _ServiceCategoryTabsWidgetState();
}

class _ServiceCategoryTabsWidgetState
    extends ConsumerState<ServiceCategoryTabsWidget> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(categoryNotifierProvider.notifier).loadCategories();
    });
  }

  @override
  Widget build(BuildContext context) {
    final categoryState = ref.watch(categoryNotifierProvider);

    if (categoryState.status == CategoryStatus.loading) {
      return const CategoryLoadingSkeleton();
    }

    if (categoryState.status == CategoryStatus.failure) {
      return Center(
        child: B2Regular(
          text: 'Failed to load categories',
          color: AppColors.stateRed600,
        ),
      );
    }

    // Create fixed categories in the desired order
    final fixedCategories = [
      {
        'slug': 'home-services',
        'title': 'Home Service',
        'icon': 'assets/images/cleaner.png',
        'category': ServiceCategory.homeServices,
      },
      {
        'slug': 'construction-services',
        'title': 'Construction Service',
        'icon': 'assets/images/construction.png',
        'category': ServiceCategory.constructionServices,
      },
      {
        'slug': 'marketplace',
        'title': 'Marketplace',
        'icon': 'assets/images/marketplace.png',
        'category': ServiceCategory.rentalAndProperties,
      },
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: fixedCategories.map((categoryData) {
        // Find the corresponding category entity from the API if available
        CategoryEntity categoryEntity;
        if (categoryState.status == CategoryStatus.success) {
          try {
            categoryEntity = categoryState.categories.firstWhere(
              (cat) => cat.slug == categoryData['slug'] as String,
            );
          } catch (e) {
            // Create a fallback category entity if not found in API
            categoryEntity = CategoryEntity(
              id: 1, // Use a default ID
              name: categoryData['title'] as String,
              slug: categoryData['slug'] as String,
              description: '',
              isActive: true,
              createdAt: DateTime.now(),
              updatedAt: DateTime.now(),
            );
          }
        } else {
          // Create a fallback category entity
          categoryEntity = CategoryEntity(
            id: 1, // Use a default ID
            name: categoryData['title'] as String,
            slug: categoryData['slug'] as String,
            description: '',
            isActive: true,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          );
        }

        return Expanded(
          child: MainCategoryCard(
            icon: categoryData['icon'] as String,
            title: categoryData['title'] as String,
            onTap: () => widget.onCategorySelected(
              categoryData['category'] as ServiceCategory,
              categoryEntity,
            ),
          ),
        );
      }).toList(),
    );
  }
}

class MainCategoryCard extends StatefulWidget {
  final String icon;
  final String title;
  final VoidCallback onTap;

  const MainCategoryCard({
    super.key,
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  State<MainCategoryCard> createState() => _MainCategoryCardState();
}

class _MainCategoryCardState extends State<MainCategoryCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _underlineAnimation;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _underlineAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _onHover(bool isHovered) {
    setState(() {
      _isHovered = isHovered;
    });
    if (isHovered) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: MouseRegion(
        onEnter: (_) => _onHover(true),
        onExit: (_) => _onHover(false),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
          child: Column(
            children: [
              // Circular icon container
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: _isHovered
                      ? AppColors.brandNeutral300
                      : AppColors.brandNeutral200,
                  borderRadius: BorderRadius.circular(40),
                ),
                child: Center(
                  child: Image.asset(
                    widget.icon,
                    width: 40,
                    height: 40,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      // Fallback icon if image fails to load
                      return const Icon(
                        Icons.home_outlined,
                        size: 40,
                        color: AppColors.brandNeutral600,
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Title text
              Text(
                widget.title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: AppColors.brandNeutral700,
                  height: 1.2,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              // Animated underline
              AnimatedBuilder(
                animation: _underlineAnimation,
                builder: (context, child) {
                  return Container(
                    width: 32 * _underlineAnimation.value,
                    height: 2,
                    decoration: BoxDecoration(
                      color: const Color(0xFF00A871),
                      borderRadius: BorderRadius.circular(1),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
