import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/worker_filters_entity.dart';

class WorkerSortBottomSheetWidget extends StatelessWidget {
  final WorkerSortType currentSort;
  final Function(WorkerSortType) onSortSelected;

  const WorkerSortBottomSheetWidget({
    super.key,
    required this.currentSort,
    required this.onSortSelected,
  });

  static void show(
    BuildContext context, {
    required WorkerSortType currentSortType,
    required Function(WorkerSortType) onSortChanged,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => WorkerSortBottomSheetWidget(
        currentSort: currentSortType,
        onSortSelected: onSortChanged,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final sortOptions = [
      WorkerSortType.newestFirst,
      WorkerSortType.relevance, // Using this for "Oldest"
      WorkerSortType.experienceHighToLow,
      WorkerSortType.experienceLowToHigh,
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
  final WorkerSortType sortType;
  final bool isSelected;
  final VoidCallback onTap;

  const _SortOption({
    required this.sortType,
    required this.isSelected,
    required this.onTap,
  });

  String _getSortDisplayName(WorkerSortType sortType) {
    switch (sortType) {
      case WorkerSortType.relevance:
        return 'Oldest';
      case WorkerSortType.newestFirst:
        return 'Newest';
      case WorkerSortType.experienceHighToLow:
        return 'Highest Experience';
      case WorkerSortType.experienceLowToHigh:
        return 'Lowest Experience';
      case WorkerSortType.nameAtoZ:
        return 'Name A-Z';
      case WorkerSortType.nameZtoA:
        return 'Name Z-A';
      case WorkerSortType.ratingHighToLow:
        return 'Highest rating first';
      case WorkerSortType.ratingLowToHigh:
        return 'lowest rating first';
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
          border:
              isSelected ? Border.all(color: AppColors.stateGreen600) : null,
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
