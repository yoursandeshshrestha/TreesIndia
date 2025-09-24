import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/project_filters_entity.dart';

class ProjectAppliedFiltersWidget extends StatelessWidget {
  final ProjectFiltersEntity filters;
  final Function(String filterType, dynamic value) onRemoveFilter;
  final VoidCallback onClearAll;

  const ProjectAppliedFiltersWidget({
    super.key,
    required this.filters,
    required this.onRemoveFilter,
    required this.onClearAll,
  });

  @override
  Widget build(BuildContext context) {
    final appliedFilters = _getAppliedFilters();

    if (appliedFilters.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: const BoxDecoration(
        color: AppColors.brandNeutral50,
        border: Border(
          bottom: BorderSide(color: AppColors.brandNeutral200),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              B3Medium(
                text: 'Applied Filters (${appliedFilters.length})',
                color: AppColors.brandNeutral700,
              ),
              if (appliedFilters.length > 1)
                GestureDetector(
                  onTap: onClearAll,
                  child: B3Medium(
                    text: 'Clear All',
                    color: AppColors.brandPrimary600,
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.xs,
            children: appliedFilters
                .map((filter) => _buildFilterChip(filter))
                .toList(),
          ),
        ],
      ),
    );
  }

  List<_FilterItem> _getAppliedFilters() {
    final List<_FilterItem> appliedFilters = [];

    if (filters.projectType != null) {
      appliedFilters.add(_FilterItem(
        label: 'Type: ${_formatProjectType(filters.projectType!)}',
        type: 'projectType',
        value: filters.projectType!,
      ));
    }

    if (filters.status != null) {
      appliedFilters.add(_FilterItem(
        label: 'Status: ${_formatStatus(filters.status!)}',
        type: 'status',
        value: filters.status!,
      ));
    }

    if (filters.city != null && filters.city!.isNotEmpty) {
      appliedFilters.add(_FilterItem(
        label: 'City: ${filters.city!}',
        type: 'city',
        value: filters.city!,
      ));
    }

    if (filters.state != null && filters.state!.isNotEmpty) {
      appliedFilters.add(_FilterItem(
        label: 'State: ${filters.state!}',
        type: 'state',
        value: filters.state!,
      ));
    }

    if (filters.sortBy != ProjectSortType.relevance) {
      appliedFilters.add(_FilterItem(
        label: 'Sort: ${filters.getSortDisplayName(filters.sortBy)}',
        type: 'sort',
        value: filters.sortBy,
      ));
    }

    return appliedFilters;
  }

  String _formatProjectType(String projectType) {
    switch (projectType.toLowerCase()) {
      case 'residential':
        return 'Residential';
      case 'commercial':
        return 'Commercial';
      case 'infrastructure':
        return 'Infrastructure';
      default:
        return projectType;
    }
  }

  String _formatStatus(String status) {
    switch (status.toLowerCase()) {
      case 'starting_soon':
        return 'Starting Soon';
      case 'on_going':
        return 'On Going';
      case 'completed':
        return 'Completed';
      case 'on_hold':
        return 'On Hold';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  Widget _buildFilterChip(_FilterItem filter) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.brandPrimary50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.brandPrimary200),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          B3Regular(
            text: filter.label,
            color: AppColors.brandPrimary700,
          ),
          const SizedBox(width: AppSpacing.xs),
          GestureDetector(
            onTap: () => onRemoveFilter(filter.type, filter.value),
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: const BoxDecoration(
                color: AppColors.brandPrimary200,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.close,
                size: 12,
                color: AppColors.brandPrimary700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterItem {
  final String label;
  final String type;
  final dynamic value;

  _FilterItem({
    required this.label,
    required this.type,
    required this.value,
  });
}