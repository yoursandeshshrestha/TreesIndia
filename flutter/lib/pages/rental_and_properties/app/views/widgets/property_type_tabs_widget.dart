import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';

class PropertyTypeTabsWidget extends StatelessWidget {
  final String? selectedType;
  final Function(String?) onTypeSelected;

  const PropertyTypeTabsWidget({
    super.key,
    required this.selectedType,
    required this.onTypeSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _TabItem(
          title: 'All',
          isSelected: selectedType == null,
          onTap: () => onTypeSelected(null),
        ),
        const SizedBox(width: AppSpacing.md),
        _TabItem(
          title: 'Properties',
          isSelected: selectedType == 'sale',
          onTap: () => onTypeSelected('sale'),
        ),
        const SizedBox(width: AppSpacing.md),
        _TabItem(
          title: 'Rental',
          isSelected: selectedType == 'rent',
          onTap: () => onTypeSelected('rent'),
        ),
      ],
    );
  }
}

class _TabItem extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const _TabItem({
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.stateGreen600 : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.stateGreen600 : AppColors.brandNeutral300,
            width: 1,
          ),
        ),
        child: B2Medium(
          text: title,
          color: isSelected ? Colors.white : AppColors.brandNeutral700,
        ),
      ),
    );
  }
}