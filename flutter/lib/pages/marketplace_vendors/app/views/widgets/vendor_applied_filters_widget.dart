import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/vendor_filters_entity.dart';

class VendorAppliedFiltersWidget extends StatelessWidget {
  final VendorFiltersEntity filters;
  final Function(String filterType, dynamic value) onRemoveFilter;
  final VoidCallback onClearAll;

  const VendorAppliedFiltersWidget({
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

    if (filters.businessType != null) {
      appliedFilters.add(_FilterInfo(
        type: 'businessType',
        label: _getBusinessTypeDisplay(filters.businessType!),
        value: filters.businessType,
      ));
    }

    if (filters.services != null && filters.services!.isNotEmpty) {
      for (final service in filters.services!) {
        appliedFilters.add(_FilterInfo(
          type: 'services',
          label: service,
          value: service,
        ));
      }
    }

    if (filters.location != null && filters.location!.isNotEmpty) {
      appliedFilters.add(_FilterInfo(
        type: 'location',
        label: 'Location: ${filters.location!}',
        value: filters.location,
      ));
    }

    if (filters.city != null && filters.city!.isNotEmpty) {
      appliedFilters.add(_FilterInfo(
        type: 'city',
        label: 'City: ${filters.city!}',
        value: filters.city,
      ));
    }

    if (filters.state != null && filters.state!.isNotEmpty) {
      appliedFilters.add(_FilterInfo(
        type: 'state',
        label: 'State: ${filters.state!}',
        value: filters.state,
      ));
    }

    return appliedFilters;
  }

  String _getBusinessTypeDisplay(String businessType) {
    switch (businessType.toLowerCase()) {
      case 'individual':
        return 'Individual';
      case 'partnership':
        return 'Partnership';
      case 'company':
        return 'Company';
      case 'llp':
        return 'LLP';
      case 'private limited':
        return 'Private Limited';
      case 'public limited':
        return 'Public Limited';
      case 'other':
        return 'Other';
      default:
        return businessType;
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