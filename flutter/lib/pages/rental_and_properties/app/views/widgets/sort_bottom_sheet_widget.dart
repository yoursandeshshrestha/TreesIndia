import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/property_filters_entity.dart';

class SortBottomSheetWidget extends StatelessWidget {
  final PropertySortType currentSortType;
  final Function(PropertySortType) onSortChanged;

  const SortBottomSheetWidget({
    super.key,
    required this.currentSortType,
    required this.onSortChanged,
  });

  static Future<void> show(
    BuildContext context, {
    required PropertySortType currentSortType,
    required Function(PropertySortType) onSortChanged,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => SortBottomSheetWidget(
        currentSortType: currentSortType,
        onSortChanged: onSortChanged,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.brandNeutral300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Title
          Row(
            children: [
              const Icon(
                Icons.sort,
                color: AppColors.brandNeutral700,
                size: 20,
              ),
              const SizedBox(width: AppSpacing.sm),
              H3Bold(
                text: 'Sort by: ${const PropertyFiltersEntity().getSortDisplayName(currentSortType)}',
                color: AppColors.brandNeutral900,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Sort Options
          ...PropertySortType.values.map((sortType) {
            final isSelected = currentSortType == sortType;
            return _SortOption(
              title: const PropertyFiltersEntity().getSortDisplayName(sortType),
              isSelected: isSelected,
              onTap: () {
                onSortChanged(sortType);
                Navigator.of(context).pop();
              },
            );
          }),

          // Safe area bottom padding
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }
}

class _SortOption extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const _SortOption({
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
        child: Row(
          children: [
            Expanded(
              child: B2Regular(
                text: title,
                color: isSelected ? AppColors.stateGreen600 : AppColors.brandNeutral700,
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.radio_button_checked,
                color: AppColors.stateGreen600,
                size: 20,
              )
            else
              const Icon(
                Icons.radio_button_unchecked,
                color: AppColors.brandNeutral400,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }
}