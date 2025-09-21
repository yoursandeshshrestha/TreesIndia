import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/property_filters_entity.dart';
import 'property_filters_widget.dart';

class FiltersBottomSheetWidget extends StatefulWidget {
  final PropertyFiltersEntity filters;
  final Function(PropertyFiltersEntity) onFiltersChanged;

  const FiltersBottomSheetWidget({
    super.key,
    required this.filters,
    required this.onFiltersChanged,
  });

  static Future<void> show(
    BuildContext context, {
    required PropertyFiltersEntity filters,
    required Function(PropertyFiltersEntity) onFiltersChanged,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => FiltersBottomSheetWidget(
        filters: filters,
        onFiltersChanged: onFiltersChanged,
      ),
    );
  }

  @override
  State<FiltersBottomSheetWidget> createState() => _FiltersBottomSheetWidgetState();
}

class _FiltersBottomSheetWidgetState extends State<FiltersBottomSheetWidget> {
  late PropertyFiltersEntity _tempFilters;

  @override
  void initState() {
    super.initState();
    _tempFilters = widget.filters;
  }

  void _updateTempFilters(PropertyFiltersEntity newFilters) {
    setState(() {
      _tempFilters = newFilters;
    });
  }

  void _applyFilters() {
    widget.onFiltersChanged(_tempFilters);
    Navigator.of(context).pop();
  }

  void _clearAllFilters() {
    const defaultFilters = PropertyFiltersEntity();
    setState(() {
      _tempFilters = defaultFilters;
    });
    widget.onFiltersChanged(defaultFilters);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.9,
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              boxShadow: [
                BoxShadow(
                  color: Color(0x0F000000),
                  offset: Offset(0, 1),
                  blurRadius: 3,
                ),
              ],
            ),
            child: Column(
              children: [
                // Handle
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.brandNeutral300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),

                // Title and Clear All
                Row(
                  children: [
                    const Icon(
                      Icons.tune,
                      color: AppColors.brandNeutral700,
                      size: 20,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    H3Bold(
                      text: 'Filters',
                      color: AppColors.brandNeutral900,
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: _clearAllFilters,
                      child: B2Medium(
                        text: 'Clear All',
                        color: AppColors.stateRed600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Filters Content
          Expanded(
            child: PropertyFiltersWidget(
              filters: _tempFilters,
              onFiltersChanged: _updateTempFilters,
            ),
          ),

          // Apply Button
          Container(
            padding: EdgeInsets.only(
              left: AppSpacing.lg,
              right: AppSpacing.lg,
              top: AppSpacing.lg,
              bottom: AppSpacing.lg + MediaQuery.of(context).padding.bottom,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Color(0x0F000000),
                  offset: Offset(0, -1),
                  blurRadius: 3,
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _applyFilters,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.stateGreen600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: B2Bold(
                      text: 'Apply Filters',
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}