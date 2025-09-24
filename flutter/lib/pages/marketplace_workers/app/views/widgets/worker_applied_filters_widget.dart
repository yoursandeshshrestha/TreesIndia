import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/worker_filters_entity.dart';

class WorkerAppliedFiltersWidget extends StatelessWidget {
  final WorkerFiltersEntity filters;
  final Function(String filterType, dynamic value) onRemoveFilter;
  final VoidCallback onClearAll;

  const WorkerAppliedFiltersWidget({
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
      color: const Color(0xFFF8F9FA),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              B2Bold(
                text: 'Applied Filters',
                color: AppColors.brandNeutral900,
              ),
              const Spacer(),
              GestureDetector(
                onTap: onClearAll,
                child: Row(
                  children: [
                    const Icon(
                      Icons.close,
                      size: 16,
                      color: AppColors.stateGreen600,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    B2Medium(
                      text: 'Clear',
                      color: AppColors.stateGreen600,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: appliedFilters.map((filter) => _FilterChip(
              filter: filter,
              onRemove: () => onRemoveFilter(filter.type, filter.value),
            )).toList(),
          ),
        ],
      ),
    );
  }

  List<_FilterInfo> _getAppliedFilters() {
    final List<_FilterInfo> appliedFilters = [];

    // Worker Type filter
    if (filters.workerType != null) {
      appliedFilters.add(_FilterInfo(
        type: 'workerType',
        label: _getWorkerTypeDisplay(filters.workerType!),
        value: filters.workerType,
      ));
    }

    // Skills filters
    if (filters.skills != null && filters.skills!.isNotEmpty) {
      for (final skill in filters.skills!) {
        appliedFilters.add(_FilterInfo(
          type: 'skills',
          label: skill,
          value: skill,
        ));
      }
    }

    // Experience range filter
    if (filters.minExperience != null || filters.maxExperience != null) {
      final minExp = filters.minExperience ?? 0;
      final maxExp = filters.maxExperience ?? 20;
      appliedFilters.add(_FilterInfo(
        type: 'experience',
        label: 'Experience: $minExp-$maxExp years',
        value: 'experience',
      ));
    }

    // Search filter
    if (filters.search != null && filters.search!.isNotEmpty) {
      appliedFilters.add(_FilterInfo(
        type: 'search',
        label: 'Search: "${filters.search!}"',
        value: filters.search,
      ));
    }

    return appliedFilters;
  }

  String _getWorkerTypeDisplay(String workerType) {
    switch (workerType.toLowerCase()) {
      case 'normal':
        return 'Independent Worker';
      case 'treesindia_worker':
        return 'TreesIndia Worker';
      default:
        return workerType;
    }
  }
}

class _FilterInfo {
  final String type;
  final String label;
  final dynamic value;

  const _FilterInfo({
    required this.type,
    required this.label,
    this.value,
  });
}

class _FilterChip extends StatelessWidget {
  final _FilterInfo filter;
  final VoidCallback onRemove;

  const _FilterChip({
    required this.filter,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.stateGreen50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.stateGreen600),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          B3Regular(
            text: filter.label,
            color: AppColors.stateGreen600,
          ),
          const SizedBox(width: AppSpacing.xs),
          GestureDetector(
            onTap: onRemove,
            child: const Icon(
              Icons.close,
              size: 14,
              color: AppColors.stateGreen600,
            ),
          ),
        ],
      ),
    );
  }
}