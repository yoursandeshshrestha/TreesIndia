import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/project_filters_entity.dart';

class ProjectFiltersBottomSheetWidget extends StatefulWidget {
  final ProjectFiltersEntity currentFilters;
  final Function(ProjectFiltersEntity) onApplyFilters;

  const ProjectFiltersBottomSheetWidget({
    super.key,
    required this.currentFilters,
    required this.onApplyFilters,
  });

  @override
  State<ProjectFiltersBottomSheetWidget> createState() =>
      _ProjectFiltersBottomSheetWidgetState();
}

class _ProjectFiltersBottomSheetWidgetState
    extends State<ProjectFiltersBottomSheetWidget> {
  late String? selectedProjectType;
  late String? selectedStatus;
  late String? selectedCity;
  late String? selectedState;

  final List<String> projectTypes = [
    'Residential',
    'Commercial',
    'Infrastructure',
  ];

  final List<String> statuses = [
    'Starting Soon',
    'On Going',
    'Completed',
    'On Hold',
    'Cancelled',
  ];

  @override
  void initState() {
    super.initState();
    selectedProjectType = widget.currentFilters.projectType;
    selectedStatus = widget.currentFilters.status;
    selectedCity = widget.currentFilters.city;
    selectedState = widget.currentFilters.state;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: AppSpacing.sm),
            height: 4,
            width: 40,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                H4Bold(
                  text: 'Filters',
                  color: AppColors.brandNeutral900,
                ),
                TextButton(
                  onPressed: _clearAllFilters,
                  child: B3Medium(
                    text: 'Clear All',
                    color: AppColors.brandPrimary600,
                  ),
                ),
              ],
            ),
          ),

          // Filters content
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Project Type Section
                  _buildSectionTitle('Project Type'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildProjectTypeChips(),
                  const SizedBox(height: AppSpacing.lg),

                  // Project Status Section
                  _buildSectionTitle('Project Status'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildStatusChips(),
                  const SizedBox(height: AppSpacing.lg),

                  // Location Section
                  _buildSectionTitle('Location'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildLocationInputs(),
                  const SizedBox(height: AppSpacing.xl),
                ],
              ),
            ),
          ),

          // Apply button
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _applyFilters,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brandPrimary600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: H4Bold(
                  text: 'Apply Filters',
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return B2Bold(
      text: title,
      color: AppColors.brandNeutral900,
    );
  }

  Widget _buildProjectTypeChips() {
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: projectTypes.map((type) {
        final isSelected = selectedProjectType == type;
        return GestureDetector(
          onTap: () {
            setState(() {
              selectedProjectType = isSelected ? null : type;
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.brandPrimary600
                  : AppColors.brandNeutral100,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected
                    ? AppColors.brandPrimary600
                    : AppColors.brandNeutral300,
              ),
            ),
            child: B3Medium(
              text: type,
              color: isSelected ? Colors.white : AppColors.brandNeutral700,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildStatusChips() {
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: statuses.map((status) {
        final isSelected = selectedStatus == status;
        return GestureDetector(
          onTap: () {
            setState(() {
              selectedStatus = isSelected ? null : status;
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.brandPrimary600
                  : AppColors.brandNeutral100,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected
                    ? AppColors.brandPrimary600
                    : AppColors.brandNeutral300,
              ),
            ),
            child: B3Medium(
              text: status,
              color: isSelected ? Colors.white : AppColors.brandNeutral700,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildLocationInputs() {
    return Column(
      children: [
        // City input
        TextField(
          decoration: InputDecoration(
            labelText: 'City',
            hintText: 'Enter city name',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
          ),
          controller: TextEditingController(text: selectedCity),
          onChanged: (value) {
            selectedCity = value.isEmpty ? null : value;
          },
        ),
        const SizedBox(height: AppSpacing.md),
        // State input
        TextField(
          decoration: InputDecoration(
            labelText: 'State',
            hintText: 'Enter state name',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
          ),
          controller: TextEditingController(text: selectedState),
          onChanged: (value) {
            selectedState = value.isEmpty ? null : value;
          },
        ),
      ],
    );
  }

  void _clearAllFilters() {
    setState(() {
      selectedProjectType = null;
      selectedStatus = null;
      selectedCity = null;
      selectedState = null;
    });
  }

  void _applyFilters() {
    final newFilters = widget.currentFilters.copyWith(
      projectType: selectedProjectType,
      status: selectedStatus,
      city: selectedCity,
      state: selectedState,
      page: 1,
    );

    widget.onApplyFilters(newFilters);
    Navigator.of(context).pop();
  }
}