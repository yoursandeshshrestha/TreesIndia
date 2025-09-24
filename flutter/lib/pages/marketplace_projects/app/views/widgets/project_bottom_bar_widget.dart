import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/project_filters_entity.dart';
import 'project_filters_bottom_sheet_widget.dart';
import 'project_sort_bottom_sheet_widget.dart';

class ProjectBottomBarWidget extends StatelessWidget {
  final ProjectFiltersEntity filters;
  final Function(ProjectSortType) onSortChanged;
  final Function(ProjectFiltersEntity) onFiltersChanged;

  const ProjectBottomBarWidget({
    super.key,
    required this.filters,
    required this.onSortChanged,
    required this.onFiltersChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: AppColors.brandNeutral200),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              // Filter button
              Expanded(
                child: _buildFilterButton(context),
              ),
              const SizedBox(width: AppSpacing.md),
              // Sort button
              Expanded(
                child: _buildSortButton(context),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterButton(BuildContext context) {
    final hasActiveFilters = filters.hasActiveFilters;
    final activeFiltersCount = filters.activeFiltersCount;

    return OutlinedButton.icon(
      onPressed: () => _showFiltersBottomSheet(context),
      style: OutlinedButton.styleFrom(
        foregroundColor: hasActiveFilters
            ? AppColors.brandPrimary600
            : AppColors.brandNeutral700,
        backgroundColor: hasActiveFilters
            ? AppColors.brandPrimary50
            : Colors.transparent,
        padding: const EdgeInsets.symmetric(vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        side: BorderSide(
          color: hasActiveFilters
              ? AppColors.brandPrimary600
              : AppColors.brandNeutral300,
        ),
      ),
      icon: Stack(
        children: [
          const Icon(Icons.filter_list, size: 20),
          if (hasActiveFilters && activeFiltersCount > 0)
            Positioned(
              right: -2,
              top: -2,
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(
                  color: AppColors.stateRed600,
                  shape: BoxShape.circle,
                ),
                constraints: const BoxConstraints(
                  minWidth: 16,
                  minHeight: 16,
                ),
                child: Text(
                  activeFiltersCount.toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
      label: B3Medium(
        text: 'Filter',
        color: hasActiveFilters
            ? AppColors.brandPrimary600
            : AppColors.brandNeutral700,
      ),
    );
  }

  Widget _buildSortButton(BuildContext context) {
    final isCustomSort = filters.sortBy != ProjectSortType.relevance;

    return OutlinedButton.icon(
      onPressed: () => _showSortBottomSheet(context),
      style: OutlinedButton.styleFrom(
        foregroundColor: isCustomSort
            ? AppColors.brandPrimary600
            : AppColors.brandNeutral700,
        backgroundColor: isCustomSort
            ? AppColors.brandPrimary50
            : Colors.transparent,
        padding: const EdgeInsets.symmetric(vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        side: BorderSide(
          color: isCustomSort
              ? AppColors.brandPrimary600
              : AppColors.brandNeutral300,
        ),
      ),
      icon: const Icon(Icons.sort, size: 20),
      label: B3Medium(
        text: 'Sort',
        color: isCustomSort
            ? AppColors.brandPrimary600
            : AppColors.brandNeutral700,
      ),
    );
  }

  void _showFiltersBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) => ProjectFiltersBottomSheetWidget(
          currentFilters: filters,
          onApplyFilters: onFiltersChanged,
        ),
      ),
    );
  }

  void _showSortBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => ProjectSortBottomSheetWidget(
        currentSortType: filters.sortBy,
        onSortChanged: (sortType) {
          onSortChanged(sortType);
          Navigator.of(context).pop();
        },
      ),
    );
  }
}