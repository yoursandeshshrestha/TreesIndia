import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import '../../providers/worker_application_providers.dart';
import '../widgets/worker_form_field.dart';

class SkillsStep extends ConsumerStatefulWidget {
  const SkillsStep({super.key});

  @override
  ConsumerState<SkillsStep> createState() => _SkillsStepState();
}

class _SkillsStepState extends ConsumerState<SkillsStep> {
  late final TextEditingController _experienceController;
  late final TextEditingController _customSkillController;

  final List<String> _availableSkills = [
    'Construction',
    'Plumbing',
    'Electrical Work',
    'Carpentry',
    'Painting',
    'Masonry',
    'Roofing',
    'Tile Installation',
    'Welding',
    'HVAC',
    'Landscaping',
    'General Labor',
  ];

  List<String> _selectedSkills = [];
  final Map<String, String?> _errors = {};

  @override
  void initState() {
    super.initState();
    _experienceController = TextEditingController();
    _customSkillController = TextEditingController();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeFormData();
    });
  }

  void _initializeFormData() {
    final workerState = ref.read(workerApplicationNotifierProvider);
    final skills = workerState.formData.skills;

    if (skills.experienceYears > 0) {
      _experienceController.text = skills.experienceYears.toString();
    }
    if (skills.skills.isNotEmpty) {
      _selectedSkills = List.from(skills.skills);
    }
  }

  @override
  void dispose() {
    _experienceController.dispose();
    _customSkillController.dispose();
    super.dispose();
  }

  void _updateFormData() {
    setState(() {
      _errors.clear();
    });

    _validateFields();

    // Always update the notifier state with current values (regardless of validation)
    final experience = int.tryParse(_experienceController.text.trim()) ?? 0;
    ref.read(workerApplicationNotifierProvider.notifier).updateSkills(
      experienceYears: experience,
      skills: _selectedSkills,
    );
  }

  void _validateFields() {
    final experienceText = _experienceController.text.trim();
    final experience = int.tryParse(experienceText);

    if (experienceText.isEmpty) {
      _errors['experience'] = 'Years of experience is required';
    } else if (experience == null || experience < 0) {
      _errors['experience'] = 'Please enter a valid number of years';
    }

    if (_selectedSkills.isEmpty) {
      _errors['skills'] = 'Please select at least one skill';
    }
  }

  void _toggleSkill(String skill) {
    setState(() {
      if (_selectedSkills.contains(skill)) {
        _selectedSkills.remove(skill);
      } else {
        _selectedSkills.add(skill);
      }
    });
    _updateFormData();
  }

  void _addCustomSkill() {
    final skill = _customSkillController.text.trim();
    if (skill.isNotEmpty && !_selectedSkills.contains(skill)) {
      setState(() {
        _selectedSkills.add(skill);
        _customSkillController.clear();
      });
      _updateFormData();
    }
  }

  void _removeSkill(String skill) {
    setState(() {
      _selectedSkills.remove(skill);
    });
    _updateFormData();
  }

  @override
  Widget build(BuildContext context) {
    // Sync with current state whenever widget rebuilds
    final workerState = ref.watch(workerApplicationNotifierProvider);
    final currentSkills = workerState.formData.skills.skills;

    // Update local selected skills if they're different from state
    if (_selectedSkills.length != currentSkills.length ||
        !_selectedSkills.every((skill) => currentSkills.contains(skill))) {
      _selectedSkills = List.from(currentSkills);
    }

    // Sync experience field with state
    final currentExperience = workerState.formData.skills.experienceYears;
    if (_experienceController.text != currentExperience.toString() && currentExperience > 0) {
      _experienceController.text = currentExperience.toString();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Skills & Experience',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Tell us about your skills and experience',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Years of Experience
        WorkerFormField(
          controller: _experienceController,
          label: 'Years of Experience',
          hint: 'Enter years of experience',
          isRequired: true,
          keyboardType: TextInputType.number,
          errorText: _errors['experience'],
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Skills Selection
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                B3Bold(
                  text: 'Skills',
                  color: AppColors.brandNeutral800,
                ),
                const Text(
                  ' *',
                  style: TextStyle(color: AppColors.stateRed600),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            B4Regular(
              text: 'Select your skills from the list below:',
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: _availableSkills.map((skill) {
                final isSelected = _selectedSkills.contains(skill);
                return GestureDetector(
                  onTap: () => _toggleSkill(skill),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.stateGreen600 : Colors.white,
                      border: Border.all(
                        color: isSelected
                            ? AppColors.stateGreen600
                            : AppColors.brandNeutral300,
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: B4Regular(
                      text: skill,
                      color: isSelected ? Colors.white : AppColors.brandNeutral700,
                    ),
                  ),
                );
              }).toList(),
            ),
            if (_errors['skills'] != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Text(
                _errors['skills']!,
                style: const TextStyle(
                  color: AppColors.stateRed600,
                  fontSize: 12,
                ),
              ),
            ],
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Custom Skill Input
        Row(
          children: [
            Expanded(
              child: WorkerFormField(
                controller: _customSkillController,
                label: 'Add Custom Skill',
                hint: 'e.g., Solar Panel Installation',
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            IconButton(
              onPressed: _addCustomSkill,
              icon: const Icon(
                Icons.add_circle,
                color: AppColors.stateGreen600,
                size: 32,
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.md),

        // Selected Skills
        if (_selectedSkills.isNotEmpty) ...[
          B4Bold(
            text: 'Selected Skills:',
            color: AppColors.brandNeutral800,
          ),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: _selectedSkills.map((skill) {
              return Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.brandPrimary50,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    B4Regular(
                      text: skill,
                      color: AppColors.brandPrimary700,
                    ),
                    const SizedBox(width: 4),
                    GestureDetector(
                      onTap: () => _removeSkill(skill),
                      child: const Icon(
                        Icons.close,
                        size: 16,
                        color: AppColors.brandPrimary700,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ],
    );
  }
}