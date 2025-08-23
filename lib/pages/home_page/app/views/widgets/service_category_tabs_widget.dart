import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/theming/text_styles.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/service_entity.dart';

class ServiceCategoryTabsWidget extends StatelessWidget {
  final ServiceCategory selectedCategory;
  final Function(ServiceCategory) onCategorySelected;

  const ServiceCategoryTabsWidget({
    super.key,
    required this.selectedCategory,
    required this.onCategorySelected,
  });

  String _getCategoryDisplayName(ServiceCategory category) {
    switch (category) {
      case ServiceCategory.homeServices:
        return 'Home Services';
      case ServiceCategory.constructionServices:
        return 'Construction Services';
      case ServiceCategory.marketplace:
        return 'Marketplace';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: ServiceCategory.values.asMap().entries.map((entry) {
            final index = entry.key;
            final category = entry.value;
            final isSelected = category == selectedCategory;

            return Padding(
              padding: EdgeInsets.only(
                left: index == 0 ? AppSpacing.lg : AppSpacing.sm,
                right: index == ServiceCategory.values.length - 1
                    ? AppSpacing.lg
                    : 0,
              ),
              child: GestureDetector(
                onTap: () => onCategorySelected(category),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16.0,
                    vertical: 8.0,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.brandPrimary600
                        : AppColors.brandNeutral100,
                    borderRadius: BorderRadius.circular(40.0),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.brandPrimary600
                          : AppColors.brandNeutral300,
                    ),
                  ),
                  child: B4Regular(
                    text: _getCategoryDisplayName(category),
                    color: isSelected
                        ? AppColors.white
                        : AppColors.brandNeutral700,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
