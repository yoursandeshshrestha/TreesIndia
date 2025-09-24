import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/property_filters_entity.dart';
import 'sort_bottom_sheet_widget.dart';
import 'filters_bottom_sheet_widget.dart';

class PropertyBottomBarWidget extends StatelessWidget {
  final PropertyFiltersEntity filters;
  final Function(PropertySortType) onSortChanged;
  final Function(PropertyFiltersEntity) onFiltersChanged;

  const PropertyBottomBarWidget({
    super.key,
    required this.filters,
    required this.onSortChanged,
    required this.onFiltersChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        top: AppSpacing.md,
        bottom: AppSpacing.md + MediaQuery.of(context).padding.bottom,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color(0x0F000000),
            offset: Offset(0, -2),
            blurRadius: 8,
          ),
        ],
      ),
      child: Row(
        children: [
          // Sort Button
          Expanded(
            child: _BottomBarButton(
              icon: Icons.sort,
              title: 'Sort by',
              subtitle: filters.getSortDisplayName(filters.sortBy),
              onTap: () {
                SortBottomSheetWidget.show(
                  context,
                  currentSortType: filters.sortBy,
                  onSortChanged: onSortChanged,
                );
              },
            ),
          ),

          // Divider
          Container(
            width: 1,
            height: 40,
            color: AppColors.brandNeutral200,
            margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          ),

          // Filters Button
          Expanded(
            child: _BottomBarButton(
              icon: Icons.tune,
              title: 'Filters',
              subtitle: _getActiveFiltersCount(filters) > 0
                  ? '${_getActiveFiltersCount(filters)} applied'
                  : 'All properties',
              onTap: () {
                FiltersBottomSheetWidget.show(
                  context,
                  filters: filters,
                  onFiltersChanged: onFiltersChanged,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  int _getActiveFiltersCount(PropertyFiltersEntity filters) {
    int count = 0;
    if (filters.listingType != null) count++;
    if (filters.uploadedByAdmin == true) count++;
    if (filters.propertyType != null) count++;
    if (filters.bedrooms != null && filters.bedrooms!.isNotEmpty) count++;
    if (filters.minPrice != null || filters.maxPrice != null) count++;
    if (filters.minArea != null || filters.maxArea != null) count++;
    if (filters.furnishingStatus != null) count++;
    if (filters.sortBy != PropertySortType.relevance) count++;
    return count;
  }
}

class _BottomBarButton extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _BottomBarButton({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: AppColors.brandNeutral700,
              size: 20,
            ),
            const SizedBox(width: AppSpacing.sm),
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                B2Bold(
                  text: title,
                  color: AppColors.brandNeutral900,
                ),
                B3Regular(
                  text: subtitle,
                  color: AppColors.brandNeutral600,
                ),
              ],
            ),
            const SizedBox(width: AppSpacing.sm),
            const Icon(
              Icons.keyboard_arrow_up,
              color: AppColors.brandNeutral400,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}