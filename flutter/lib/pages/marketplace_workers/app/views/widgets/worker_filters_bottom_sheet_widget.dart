import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/worker_filters_entity.dart';

class WorkerFiltersBottomSheetWidget extends StatefulWidget {
  final WorkerFiltersEntity currentFilters;
  final Function(WorkerFiltersEntity) onFiltersChanged;

  const WorkerFiltersBottomSheetWidget({
    super.key,
    required this.currentFilters,
    required this.onFiltersChanged,
  });

  static void show(
    BuildContext context, {
    required WorkerFiltersEntity currentFilters,
    required Function(WorkerFiltersEntity) onFiltersChanged,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => WorkerFiltersBottomSheetWidget(
        currentFilters: currentFilters,
        onFiltersChanged: onFiltersChanged,
      ),
    );
  }

  @override
  State<WorkerFiltersBottomSheetWidget> createState() => _WorkerFiltersBottomSheetWidgetState();
}

class _WorkerFiltersBottomSheetWidgetState extends State<WorkerFiltersBottomSheetWidget> {
  late WorkerFiltersEntity _tempFilters;
  double _minExperience = 0;
  double _maxExperience = 20;

  final List<String> _workerTypes = [
    'Independent Worker',
    'TreesIndia Worker',
  ];

  final List<String> _popularSkills = [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Masonry',
    'Roofing',
    'Flooring',
    'Cleaning',
    'Gardening',
    'Security',
    'Cooking',
    'Driving',
    'Construction',
    'Appliance Repair',
    'Maintenance',
    'Tile Installation',
  ];

  @override
  void initState() {
    super.initState();
    _tempFilters = widget.currentFilters;
    _minExperience = (_tempFilters.minExperience ?? 0).toDouble();
    _maxExperience = (_tempFilters.maxExperience ?? 20).toDouble();
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
                  // Worker Type Section
                  _buildSectionTitle('Worker Type'),
                  const SizedBox(height: AppSpacing.md),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: _workerTypes.map((type) => _buildFilterChip(
                      label: type,
                      isSelected: _getWorkerTypeKey(type) == _tempFilters.workerType,
                      onTap: () => _setWorkerType(type),
                    )).toList(),
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // Popular Skills Section
                  _buildSectionTitle('Popular Skills'),
                  const SizedBox(height: AppSpacing.md),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: _popularSkills.map((skill) => _buildFilterChip(
                      label: skill,
                      isSelected: _tempFilters.skills?.contains(skill) ?? false,
                      onTap: () => _toggleSkill(skill),
                    )).toList(),
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // Experience Range Section
                  _buildSectionTitle('Experience Range (Years)'),
                  const SizedBox(height: AppSpacing.md),

                  // Experience range display
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      B2Regular(
                        text: '${_minExperience.toInt()} years',
                        color: AppColors.brandNeutral700,
                      ),
                      B2Regular(
                        text: '${_maxExperience.toInt()}+ years',
                        color: AppColors.brandNeutral700,
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.sm),

                  // Experience range slider
                  RangeSlider(
                    values: RangeValues(_minExperience, _maxExperience),
                    min: 0,
                    max: 20,
                    divisions: 20,
                    activeColor: AppColors.stateGreen600,
                    inactiveColor: AppColors.brandNeutral200,
                    labels: RangeLabels(
                      '${_minExperience.toInt()}',
                      '${_maxExperience.toInt()}+',
                    ),
                    onChanged: (RangeValues values) {
                      setState(() {
                        _minExperience = values.start;
                        _maxExperience = values.end;
                        _tempFilters = _tempFilters.copyWith(
                          minExperience: _minExperience.toInt(),
                          maxExperience: _maxExperience.toInt(),
                        );
                      });
                    },
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

  void _setWorkerType(String type) {
    setState(() {
      final workerTypeKey = _getWorkerTypeKey(type);
      if (_tempFilters.workerType == workerTypeKey) {
        _tempFilters = _tempFilters.copyWith(clearWorkerType: true);
      } else {
        _tempFilters = _tempFilters.copyWith(workerType: workerTypeKey);
      }
    });
  }

  void _toggleSkill(String skill) {
    setState(() {
      final currentSkills = List<String>.from(_tempFilters.skills ?? []);
      if (currentSkills.contains(skill)) {
        currentSkills.remove(skill);
      } else {
        currentSkills.add(skill);
      }
      _tempFilters = _tempFilters.copyWith(
        skills: currentSkills.isEmpty ? null : currentSkills,
        clearSkills: currentSkills.isEmpty,
      );
    });
  }

  void _clearAllFilters() {
    setState(() {
      _tempFilters = const WorkerFiltersEntity();
      _minExperience = 0;
      _maxExperience = 20;
    });
  }

  String _getWorkerTypeKey(String displayType) {
    switch (displayType) {
      case 'Independent Worker':
        return 'normal';
      case 'TreesIndia Worker':
        return 'treesindia_worker';
      default:
        return displayType.toLowerCase();
    }
  }
}