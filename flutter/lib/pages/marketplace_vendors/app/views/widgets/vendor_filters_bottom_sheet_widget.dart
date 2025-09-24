import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/vendor_filters_entity.dart';

class VendorFiltersBottomSheetWidget extends StatefulWidget {
  final VendorFiltersEntity currentFilters;
  final Function(VendorFiltersEntity) onFiltersChanged;

  const VendorFiltersBottomSheetWidget({
    super.key,
    required this.currentFilters,
    required this.onFiltersChanged,
  });

  static void show(
    BuildContext context, {
    required VendorFiltersEntity currentFilters,
    required Function(VendorFiltersEntity) onFiltersChanged,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => VendorFiltersBottomSheetWidget(
        currentFilters: currentFilters,
        onFiltersChanged: onFiltersChanged,
      ),
    );
  }

  @override
  State<VendorFiltersBottomSheetWidget> createState() => _VendorFiltersBottomSheetWidgetState();
}

class _VendorFiltersBottomSheetWidgetState extends State<VendorFiltersBottomSheetWidget> {
  late VendorFiltersEntity _tempFilters;
  final _locationController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();

  final List<String> _businessTypes = [
    'Individual',
    'Partnership',
    'Company',
    'LLP',
    'Private Limited',
    'Public Limited',
    'Other',
  ];

  final List<String> _availableServices = [
    'Cement Supply',
    'Steel & Iron Rods',
    'Bricks & Blocks',
    'Paint & Chemicals',
    'Tiles & Marble',
    'Electrical Materials',
    'Hardware & Fittings',
    'Sand & Aggregates',
    'Plumbing Supplies',
    'Construction Tools',
  ];

  @override
  void initState() {
    super.initState();
    _tempFilters = widget.currentFilters;
    _locationController.text = _tempFilters.location ?? '';
    _cityController.text = _tempFilters.city ?? '';
    _stateController.text = _tempFilters.state ?? '';
  }

  @override
  void dispose() {
    _locationController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Header
          Row(
            children: [
              H3Bold(
                text: 'Filters',
                color: AppColors.brandNeutral900,
              ),
              const Spacer(),
              TextButton(
                onPressed: _clearAllFilters,
                child: B2Medium(
                  text: 'Clear All',
                  color: AppColors.stateGreen600,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.lg),

          // Filters content
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Business Type Section
                  _buildSectionTitle('Business Type'),
                  const SizedBox(height: AppSpacing.md),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: _businessTypes.map((type) => _buildFilterChip(
                      label: type,
                      isSelected: _tempFilters.businessType?.toLowerCase() == type.toLowerCase(),
                      onTap: () => _setBusinessType(type),
                    )).toList(),
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // Services Section
                  _buildSectionTitle('Services'),
                  const SizedBox(height: AppSpacing.md),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: _availableServices.map((service) => _buildFilterChip(
                      label: service,
                      isSelected: _tempFilters.services?.contains(service) ?? false,
                      onTap: () => _toggleService(service),
                    )).toList(),
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // Location Section
                  _buildSectionTitle('Location'),
                  const SizedBox(height: AppSpacing.md),

                  // Location field
                  TextField(
                    controller: _locationController,
                    decoration: InputDecoration(
                      hintText: 'Search by location...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.brandNeutral200),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.brandNeutral200),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.stateGreen600),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.md,
                      ),
                    ),
                    onChanged: (value) {
                      _tempFilters = _tempFilters.copyWith(
                        location: value.isNotEmpty ? value : null,
                        clearLocation: value.isEmpty,
                      );
                    },
                  ),

                  const SizedBox(height: AppSpacing.md),

                  // City and State fields
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _cityController,
                          decoration: InputDecoration(
                            hintText: 'City',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppColors.brandNeutral200),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppColors.brandNeutral200),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppColors.stateGreen600),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: AppSpacing.md,
                            ),
                          ),
                          onChanged: (value) {
                            _tempFilters = _tempFilters.copyWith(
                              city: value.isNotEmpty ? value : null,
                              clearCity: value.isEmpty,
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: TextField(
                          controller: _stateController,
                          decoration: InputDecoration(
                            hintText: 'State',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppColors.brandNeutral200),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppColors.brandNeutral200),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppColors.stateGreen600),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: AppSpacing.md,
                            ),
                          ),
                          onChanged: (value) {
                            _tempFilters = _tempFilters.copyWith(
                              state: value.isNotEmpty ? value : null,
                              clearState: value.isEmpty,
                            );
                          },
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: MediaQuery.of(context).padding.bottom + AppSpacing.lg),
                ],
              ),
            ),
          ),

          // Apply button
          SizedBox(
            width: double.infinity,
            child: SolidButtonWidget(
              label: 'Apply Filters',
              onPressed: () {
                widget.onFiltersChanged(_tempFilters);
                Navigator.of(context).pop();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return H4Bold(
      text: title,
      color: AppColors.brandNeutral900,
    );
  }

  Widget _buildFilterChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.stateGreen50 : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.stateGreen600 : AppColors.brandNeutral200,
          ),
        ),
        child: B3Regular(
          text: label,
          color: isSelected ? AppColors.stateGreen600 : AppColors.brandNeutral700,
        ),
      ),
    );
  }

  void _setBusinessType(String type) {
    setState(() {
      if (_tempFilters.businessType?.toLowerCase() == type.toLowerCase()) {
        _tempFilters = _tempFilters.copyWith(clearBusinessType: true);
      } else {
        _tempFilters = _tempFilters.copyWith(businessType: type);
      }
    });
  }

  void _toggleService(String service) {
    setState(() {
      final currentServices = List<String>.from(_tempFilters.services ?? []);
      if (currentServices.contains(service)) {
        currentServices.remove(service);
      } else {
        currentServices.add(service);
      }
      _tempFilters = _tempFilters.copyWith(
        services: currentServices.isEmpty ? null : currentServices,
        clearServices: currentServices.isEmpty,
      );
    });
  }

  void _clearAllFilters() {
    setState(() {
      _tempFilters = const VendorFiltersEntity();
      _locationController.clear();
      _cityController.clear();
      _stateController.clear();
    });
  }
}