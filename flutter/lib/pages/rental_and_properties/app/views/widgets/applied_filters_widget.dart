import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/property_filters_entity.dart';

class AppliedFiltersWidget extends StatelessWidget {
  final PropertyFiltersEntity filters;
  final Function(String filterType, dynamic value) onRemoveFilter;
  final VoidCallback onClearAll;

  const AppliedFiltersWidget({
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

    if (filters.listingType != null) {
      appliedFilters.add(_FilterInfo(
        type: 'listingType',
        label: filters.listingType == 'sale' ? 'Properties' : 'Rental',
        value: filters.listingType,
      ));
    }

    if (filters.uploadedByAdmin == true) {
      appliedFilters.add(const _FilterInfo(
        type: 'uploadedByAdmin',
        label: 'Assured by Trees India',
        value: true,
      ));
    }

    if (filters.propertyType != null) {
      appliedFilters.add(_FilterInfo(
        type: 'propertyType',
        label: '${filters.propertyType![0].toUpperCase()}${filters.propertyType!.substring(1)}',
        value: filters.propertyType,
      ));
    }

    if (filters.bedrooms != null && filters.bedrooms!.isNotEmpty) {
      for (final bedroom in filters.bedrooms!) {
        appliedFilters.add(_FilterInfo(
          type: 'bedrooms',
          label: '${bedroom}BHK',
          value: bedroom,
        ));
      }
    }

    if (filters.minPrice != null || filters.maxPrice != null) {
      String label = 'Price: ';
      if (filters.minPrice != null && filters.maxPrice != null) {
        label += '₹${filters.minPrice!.toInt()} - ₹${filters.maxPrice!.toInt()}';
      } else if (filters.minPrice != null) {
        label += '₹${filters.minPrice!.toInt()}+';
      } else {
        label += 'Up to ₹${filters.maxPrice!.toInt()}';
      }
      appliedFilters.add(_FilterInfo(
        type: 'priceRange',
        label: label,
        value: null,
      ));
    }

    if (filters.minArea != null || filters.maxArea != null) {
      String label = 'Area: ';
      if (filters.minArea != null && filters.maxArea != null) {
        label += '${filters.minArea!.toInt()} - ${filters.maxArea!.toInt()} sq ft';
      } else if (filters.minArea != null) {
        label += '${filters.minArea!.toInt()}+ sq ft';
      } else {
        label += 'Up to ${filters.maxArea!.toInt()} sq ft';
      }
      appliedFilters.add(_FilterInfo(
        type: 'areaRange',
        label: label,
        value: null,
      ));
    }

    if (filters.furnishingStatus != null) {
      appliedFilters.add(_FilterInfo(
        type: 'furnishingStatus',
        label: '${filters.furnishingStatus![0].toUpperCase()}${filters.furnishingStatus!.substring(1).replaceAll('_', '-')}',
        value: filters.furnishingStatus,
      ));
    }

    return appliedFilters;
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