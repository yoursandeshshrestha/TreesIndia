import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/vendor_filters_entity.dart';
import 'vendor_sort_bottom_sheet_widget.dart';
import 'vendor_filters_bottom_sheet_widget.dart';

class VendorBottomBarWidget extends StatelessWidget {
  final VendorFiltersEntity filters;
  final Function(VendorSortType) onSortChanged;
  final Function(VendorFiltersEntity) onFiltersChanged;

  const VendorBottomBarWidget({
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
                VendorSortBottomSheetWidget.show(
                  context,
                  currentSort: filters.sortBy,
                  onSortSelected: onSortChanged,
                );
              },
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          // Filter Button
          Expanded(
            child: _BottomBarButton(
              icon: Icons.tune,
              title: 'Filters',
              subtitle: _getFilterCount() > 0
                  ? '${_getFilterCount()} applied'
                  : 'All vendors',
              onTap: () {
                VendorFiltersBottomSheetWidget.show(
                  context,
                  currentFilters: filters,
                  onFiltersChanged: onFiltersChanged,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  int _getFilterCount() {
    int count = 0;
    if (filters.businessType != null) count++;
    if (filters.services != null && filters.services!.isNotEmpty)
      count += filters.services!.length;
    if (filters.location != null && filters.location!.isNotEmpty) count++;
    if (filters.city != null && filters.city!.isNotEmpty) count++;
    if (filters.state != null && filters.state!.isNotEmpty) count++;
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
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.md,
        ),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.brandNeutral200),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  B3Medium(
                    text: title,
                    color: AppColors.brandNeutral900,
                  ),
                  const SizedBox(height: 2),
                  B3Regular(
                    text: subtitle,
                    color: AppColors.brandNeutral600,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
