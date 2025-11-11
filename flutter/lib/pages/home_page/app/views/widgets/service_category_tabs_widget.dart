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

    // Create fixed categories with urban assets and original labels
    final fixedCategories = [
      {
        'slug': 'home-services',
        'title': 'Home Service',
        'icon': 'assets/urban/home.png',
        'category': ServiceCategory.homeServices,
      },
      {
        'slug': 'construction-services',
        'title': 'Construction Service',
        'icon': 'assets/urban/construction.png',
        'category': ServiceCategory.constructionServices,
      },
      {
        'slug': 'marketplace',
        'title': 'Marketplace',
        'icon': 'assets/urban/marketplace.png',
        'category': ServiceCategory.rentalAndProperties,
      },
    ];

    return Row(
      children: fixedCategories.asMap().entries.map((entry) {
        final index = entry.key;
        final categoryData = entry.value;
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
          child: Padding(
            padding: EdgeInsets.only(
              left: index == 0 ? 0 : 8,
              right: index == fixedCategories.length - 1 ? 0 : 8,
            ),
            child: ServiceCategoryCard(
              icon: categoryData['icon'] as String,
              title: categoryData['title'] as String,
              onTap: () => widget.onCategorySelected(
                categoryData['category'] as ServiceCategory,
                categoryEntity,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class ServiceCategoryCard extends StatefulWidget {
  final String icon;
  final String title;
  final VoidCallback onTap;

  const ServiceCategoryCard({
    super.key,
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  State<ServiceCategoryCard> createState() => _ServiceCategoryCardState();
}

class _ServiceCategoryCardState extends State<ServiceCategoryCard> {
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
        child: Container(
          height: 120,
          color: Colors.transparent,
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
                        size: 32,
                        color: AppColors.brandNeutral600,
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              // Title text
              Expanded(
                child: Text(
                  widget.title,
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
