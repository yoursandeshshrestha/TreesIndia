import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/property_filters_entity.dart';

class PropertyFiltersWidget extends StatefulWidget {
  final PropertyFiltersEntity filters;
  final Function(PropertyFiltersEntity) onFiltersChanged;

  const PropertyFiltersWidget({
    super.key,
    required this.filters,
    required this.onFiltersChanged,
  });

  @override
  State<PropertyFiltersWidget> createState() => _PropertyFiltersWidgetState();
}

class _PropertyFiltersWidgetState extends State<PropertyFiltersWidget> {
  late PropertyFiltersEntity _currentFilters;

  @override
  void initState() {
    super.initState();
    _currentFilters = widget.filters;
  }

  @override
  void didUpdateWidget(PropertyFiltersWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.filters != widget.filters) {
      _currentFilters = widget.filters;
    }
  }

  void _updateFilters(PropertyFiltersEntity newFilters) {
    setState(() {
      _currentFilters = newFilters;
    });
    widget.onFiltersChanged(newFilters);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF8F9FA),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Property Type
            _FilterSection(
              title: 'Property Type',
              child: Column(
                children: [
                  _FilterOption(
                    title: 'Residential',
                    isSelected: _currentFilters.propertyType == 'residential',
                    onTap: () {
                      _updateFilters(_currentFilters.copyWith(
                        propertyType: _currentFilters.propertyType == 'residential'
                            ? null : 'residential',
                      ));
                    },
                  ),
                  _FilterOption(
                    title: 'Commercial',
                    isSelected: _currentFilters.propertyType == 'commercial',
                    onTap: () {
                      _updateFilters(_currentFilters.copyWith(
                        propertyType: _currentFilters.propertyType == 'commercial'
                            ? null : 'commercial',
                      ));
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Number of Bedrooms
            _FilterSection(
              title: 'No. of Bedrooms',
              child: Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((bedroom) {
                  final isSelected = _currentFilters.bedrooms?.contains(bedroom) ?? false;
                  return _BedroomChip(
                    bedroom: bedroom,
                    isSelected: isSelected,
                    onTap: () {
                      final currentBedrooms = List<int>.from(_currentFilters.bedrooms ?? []);
                      if (isSelected) {
                        currentBedrooms.remove(bedroom);
                      } else {
                        currentBedrooms.add(bedroom);
                      }
                      _updateFilters(_currentFilters.copyWith(
                        bedrooms: currentBedrooms.isEmpty ? null : currentBedrooms,
                      ));
                    },
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Price Range
            _FilterSection(
              title: 'Price Range',
              child: _PriceRangeSlider(
                minPrice: _currentFilters.minPrice ?? 0,
                maxPrice: _currentFilters.maxPrice ?? 10000000,
                onChanged: (min, max) {
                  _updateFilters(_currentFilters.copyWith(
                    minPrice: min == 0 ? null : min,
                    maxPrice: max == 10000000 ? null : max,
                  ));
                },
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Area Range
            _FilterSection(
              title: 'Area Range (sq ft)',
              child: _AreaRangeSlider(
                minArea: _currentFilters.minArea ?? 0,
                maxArea: _currentFilters.maxArea ?? 5000,
                onChanged: (min, max) {
                  _updateFilters(_currentFilters.copyWith(
                    minArea: min == 0 ? null : min,
                    maxArea: max == 5000 ? null : max,
                  ));
                },
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Furnishing Status
            _FilterSection(
              title: 'Furnishing Status',
              child: Column(
                children: [
                  _FilterOption(
                    title: 'Furnished',
                    isSelected: _currentFilters.furnishingStatus == 'furnished',
                    onTap: () {
                      _updateFilters(_currentFilters.copyWith(
                        furnishingStatus: _currentFilters.furnishingStatus == 'furnished'
                            ? null : 'furnished',
                      ));
                    },
                  ),
                  _FilterOption(
                    title: 'Semi-Furnished',
                    isSelected: _currentFilters.furnishingStatus == 'semi_furnished',
                    onTap: () {
                      _updateFilters(_currentFilters.copyWith(
                        furnishingStatus: _currentFilters.furnishingStatus == 'semi_furnished'
                            ? null : 'semi_furnished',
                      ));
                    },
                  ),
                  _FilterOption(
                    title: 'Unfurnished',
                    isSelected: _currentFilters.furnishingStatus == 'unfurnished',
                    onTap: () {
                      _updateFilters(_currentFilters.copyWith(
                        furnishingStatus: _currentFilters.furnishingStatus == 'unfurnished'
                            ? null : 'unfurnished',
                      ));
                    },
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

class _FilterSection extends StatelessWidget {
  final String title;
  final Widget child;

  const _FilterSection({
    required this.title,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        B2Bold(
          text: title,
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.md),
        child,
      ],
    );
  }
}

class _FilterOption extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterOption({
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        child: Row(
          children: [
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.stateGreen600 : Colors.transparent,
                border: Border.all(
                  color: isSelected ? AppColors.stateGreen600 : AppColors.brandNeutral300,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(4),
              ),
              child: isSelected
                  ? const Icon(Icons.check, color: Colors.white, size: 14)
                  : null,
            ),
            const SizedBox(width: AppSpacing.md),
            B2Regular(
              text: title,
              color: AppColors.brandNeutral700,
            ),
          ],
        ),
      ),
    );
  }
}

class _BedroomChip extends StatelessWidget {
  final int bedroom;
  final bool isSelected;
  final VoidCallback onTap;

  const _BedroomChip({
    required this.bedroom,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.stateGreen600 : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.stateGreen600 : AppColors.brandNeutral300,
          ),
        ),
        child: B3Regular(
          text: '+ $bedroom BHK',
          color: isSelected ? Colors.white : AppColors.brandNeutral700,
        ),
      ),
    );
  }
}

class _PriceRangeSlider extends StatefulWidget {
  final double minPrice;
  final double maxPrice;
  final Function(double min, double max) onChanged;

  const _PriceRangeSlider({
    required this.minPrice,
    required this.maxPrice,
    required this.onChanged,
  });

  @override
  State<_PriceRangeSlider> createState() => _PriceRangeSliderState();
}

class _PriceRangeSliderState extends State<_PriceRangeSlider> {
  late RangeValues _values;

  @override
  void initState() {
    super.initState();
    _values = RangeValues(widget.minPrice, widget.maxPrice);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        RangeSlider(
          values: _values,
          min: 0,
          max: 10000000,
          divisions: 100,
          activeColor: AppColors.stateGreen600,
          onChanged: (values) {
            setState(() {
              _values = values;
            });
          },
          onChangeEnd: (values) {
            widget.onChanged(values.start, values.end);
          },
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            B3Regular(
              text: '₹${_values.start.toInt()}',
              color: AppColors.brandNeutral600,
            ),
            B3Regular(
              text: '₹${_values.end.toInt()}',
              color: AppColors.brandNeutral600,
            ),
          ],
        ),
      ],
    );
  }
}

class _AreaRangeSlider extends StatefulWidget {
  final double minArea;
  final double maxArea;
  final Function(double min, double max) onChanged;

  const _AreaRangeSlider({
    required this.minArea,
    required this.maxArea,
    required this.onChanged,
  });

  @override
  State<_AreaRangeSlider> createState() => _AreaRangeSliderState();
}

class _AreaRangeSliderState extends State<_AreaRangeSlider> {
  late RangeValues _values;

  @override
  void initState() {
    super.initState();
    _values = RangeValues(widget.minArea, widget.maxArea);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        RangeSlider(
          values: _values,
          min: 0,
          max: 5000,
          divisions: 50,
          activeColor: AppColors.stateGreen600,
          onChanged: (values) {
            setState(() {
              _values = values;
            });
          },
          onChangeEnd: (values) {
            widget.onChanged(values.start, values.end);
          },
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            B3Regular(
              text: '${_values.start.toInt()} sq ft',
              color: AppColors.brandNeutral600,
            ),
            B3Regular(
              text: '${_values.end.toInt()} sq ft',
              color: AppColors.brandNeutral600,
            ),
          ],
        ),
      ],
    );
  }
}