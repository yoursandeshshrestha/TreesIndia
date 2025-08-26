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

  ServiceCategory _mapSlugToServiceCategory(String slug) {
    switch (slug) {
      case 'home-services':
        return ServiceCategory.homeServices;
      case 'construction-services':
        return ServiceCategory.constructionServices;
      case 'rental-and-properties':
      default:
        return ServiceCategory.rentalAndProperties;
    }
  }

  Widget _getCategoryIcon(String slug) {
    switch (slug) {
      case 'home-services':
        return const Icon(
          Icons.home_repair_service_rounded,
          size: 20,
          color: AppColors.brandPrimary600,
        );
      case 'construction-services':
        return const Icon(
          Icons.construction_outlined,
          size: 20,
          color: AppColors.brandPrimary600,
        );
      case 'rental-and-properties':
      default:
        return const Icon(
          Icons.home_outlined,
          size: 20,
          color: AppColors.brandPrimary600,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoryState = ref.watch(categoryNotifierProvider);

    if (categoryState.status == CategoryStatus.loading) {
      return const CategoryLoadingSkeleton();
    }

    if (categoryState.status == CategoryStatus.failure) {
      return Container(
        height: 136,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        child: Center(
          child: B2Regular(
            text: 'Failed to load categories',
            color: AppColors.stateRed600,
          ),
        ),
      );
    }

    final categories = categoryState.categories;

    if (categories.isEmpty) {
      return Container(
        height: 136,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        child: Center(
          child: B2Regular(
            text: 'No categories available',
            color: AppColors.brandNeutral600,
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.only(left: 0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: categories.asMap().entries.map((entry) {
            int index = entry.key;
            CategoryEntity category = entry.value;
            ServiceCategory mappedCategory =
                _mapSlugToServiceCategory(category.slug);

            return Container(
              margin: EdgeInsets.only(
                left: index == 0 ? AppSpacing.lg : 0,
                right: index < categories.length - 1
                    ? AppSpacing.md
                    : AppSpacing.lg,
              ),
              child: _CategoryCard(
                title: category.name,
                icon: _getCategoryIcon(category.slug),
                onTap: () => widget.onCategorySelected(mappedCategory, category),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  final String title;
  final Widget icon;
  final VoidCallback onTap;

  const _CategoryCard({
    required this.title,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 136,
        width: 120,
        padding: const EdgeInsets.only(
            top: 20.0,
            bottom: AppSpacing.md,
            left: AppSpacing.sm,
            right: AppSpacing.sm),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: AppColors.brandNeutral200,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.brandNeutral900.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.brandPrimary50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(child: icon),
            ),
            const SizedBox(height: 12.0),
            Flexible(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.brandNeutral900,
                  height: 1.2,
                ),
                textAlign: TextAlign.center,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                softWrap: true,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
