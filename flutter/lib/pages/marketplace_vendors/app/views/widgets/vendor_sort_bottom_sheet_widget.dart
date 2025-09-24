import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/vendor_filters_entity.dart';

class VendorSortBottomSheetWidget extends StatelessWidget {
  final VendorSortType currentSort;
  final Function(VendorSortType) onSortSelected;

  const VendorSortBottomSheetWidget({
    super.key,
    required this.currentSort,
    required this.onSortSelected,
  });

  static void show(
    BuildContext context, {
    required VendorSortType currentSort,
    required Function(VendorSortType) onSortSelected,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => VendorSortBottomSheetWidget(
        currentSort: currentSort,
        onSortSelected: onSortSelected,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final sortOptions = [
      VendorSortType.relevance,
      VendorSortType.newestFirst,
      VendorSortType.nameAtoZ,
      VendorSortType.nameZtoA,
      VendorSortType.ratingHighToLow,
      VendorSortType.ratingLowToHigh,
    ];

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Title
          Row(
            children: [
              H3Bold(
                text: 'Sort by',
                color: AppColors.brandNeutral900,
              ),
              const Spacer(),
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(
                  Icons.close,
                  color: AppColors.brandNeutral600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Sort options
          ...sortOptions.map((sortType) => _SortOption(
            sortType: sortType,
            isSelected: sortType == currentSort,
            onTap: () {
              onSortSelected(sortType);
              Navigator.of(context).pop();
            },
          )),

          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }
}

class _SortOption extends StatelessWidget {
  final VendorSortType sortType;
  final bool isSelected;
  final VoidCallback onTap;

  const _SortOption({
    required this.sortType,
    required this.isSelected,
    required this.onTap,
  });

  String _getSortDisplayName(VendorSortType sortType) {
    switch (sortType) {
      case VendorSortType.relevance:
        return 'Relevance';
      case VendorSortType.newestFirst:
        return 'Newest First';
      case VendorSortType.nameAtoZ:
        return 'Name A-Z';
      case VendorSortType.nameZtoA:
        return 'Name Z-A';
      case VendorSortType.ratingHighToLow:
        return 'Rating High to Low';
      case VendorSortType.ratingLowToHigh:
        return 'Rating Low to High';
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.md,
        ),
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.stateGreen50 : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: isSelected
            ? Border.all(color: AppColors.stateGreen600)
            : null,
        ),
        child: Row(
          children: [
            Expanded(
              child: B2Regular(
                text: _getSortDisplayName(sortType),
                color: isSelected
                  ? AppColors.stateGreen600
                  : AppColors.brandNeutral900,
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check,
                color: AppColors.stateGreen600,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }
}