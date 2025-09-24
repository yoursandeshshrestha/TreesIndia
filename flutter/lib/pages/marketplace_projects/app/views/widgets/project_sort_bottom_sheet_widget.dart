import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/project_filters_entity.dart';

class ProjectSortBottomSheetWidget extends StatelessWidget {
  final ProjectSortType currentSortType;
  final Function(ProjectSortType) onSortChanged;

  const ProjectSortBottomSheetWidget({
    super.key,
    required this.currentSortType,
    required this.onSortChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: AppSpacing.sm),
            height: 4,
            width: 40,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: H4Bold(
              text: 'Sort by',
              color: AppColors.brandNeutral900,
            ),
          ),

          // Sort options
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Column(
              children: ProjectSortType.values.map((sortType) {
                return _buildSortOption(sortType);
              }).toList(),
            ),
          ),

          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }

  Widget _buildSortOption(ProjectSortType sortType) {
    final isSelected = currentSortType == sortType;
    final displayName = _getSortDisplayName(sortType);

    return InkWell(
      onTap: () => onSortChanged(sortType),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
          vertical: AppSpacing.md,
          horizontal: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.brandPrimary50 : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Expanded(
              child: B2Regular(
                text: displayName,
                color: isSelected
                    ? AppColors.brandPrimary700
                    : AppColors.brandNeutral700,
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check,
                color: AppColors.brandPrimary600,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }

  String _getSortDisplayName(ProjectSortType sortType) {
    switch (sortType) {
      case ProjectSortType.relevance:
        return 'Relevance';
      case ProjectSortType.newestFirst:
        return 'Newest First';
      case ProjectSortType.titleAtoZ:
        return 'Title A-Z';
      case ProjectSortType.titleZtoA:
        return 'Title Z-A';
      case ProjectSortType.durationShortToLong:
        return 'Duration Short to Long';
      case ProjectSortType.durationLongToShort:
        return 'Duration Long to Short';
    }
  }
}