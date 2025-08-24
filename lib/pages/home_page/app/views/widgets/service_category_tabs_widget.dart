import 'package:flutter/material.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/service_entity.dart';

class ServiceCategoryTabsWidget extends StatelessWidget {
  final ServiceCategory? selectedCategory;
  final Function(ServiceCategory) onCategorySelected;

  const ServiceCategoryTabsWidget({
    super.key,
    this.selectedCategory,
    required this.onCategorySelected,
  });

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

  Widget _getCategoryIcon(ServiceCategory category) {
    switch (category) {
      case ServiceCategory.homeServices:
        return const Icon(
          Icons.home_repair_service_rounded,
          size: 20,
          color: AppColors.brandPrimary600,
        );
      case ServiceCategory.constructionServices:
        return const Icon(
          Icons.construction_outlined,
          size: 20,
          color: AppColors.brandPrimary600,
        );
      case ServiceCategory.rentalAndProperties:
        return const Icon(
          Icons.home_outlined,
          size: 20,
          color: AppColors.brandPrimary600,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: ServiceCategory.values.asMap().entries.map((entry) {
            int index = entry.key;
            ServiceCategory category = entry.value;

            return Container(
              margin: EdgeInsets.only(
                left: index == 0 ? AppSpacing.lg : 0,
                right: index < ServiceCategory.values.length - 1
                    ? AppSpacing.md
                    : AppSpacing.lg,
              ),
              child: _CategoryCard(
                category: category,
                title: _getCategoryDisplayName(category),
                icon: _getCategoryIcon(category),
                onTap: () => onCategorySelected(category),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  final ServiceCategory category;
  final String title;
  final Widget icon;
  final VoidCallback onTap;

  const _CategoryCard({
    required this.category,
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
