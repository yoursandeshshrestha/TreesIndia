import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../states/property_form_state.dart';

class FormStepIndicator extends StatelessWidget {
  final PropertyFormStep currentStep;
  final Map<PropertyFormStep, bool> stepCompletion;
  final Function(PropertyFormStep) onStepTapped;

  const FormStepIndicator({
    super.key,
    required this.currentStep,
    required this.stepCompletion,
    required this.onStepTapped,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: const BoxDecoration(
        color: AppColors.white,
        border: Border(
          bottom: BorderSide(
            color: AppColors.brandNeutral200,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: PropertyFormStep.values.asMap().entries.map((entry) {
              final index = entry.key;
              final step = entry.value;
              final isLast = index == PropertyFormStep.values.length - 1;

              return Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => onStepTapped(step),
                        child: _StepItem(
                          step: step,
                          isActive: currentStep == step,
                          isCompleted: stepCompletion[step] ?? false,
                          stepNumber: index + 1,
                        ),
                      ),
                    ),
                    if (!isLast)
                      Container(
                        height: 2,
                        width: 20,
                        margin: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.xs,
                        ),
                        decoration: BoxDecoration(
                          color: _getConnectorColor(step),
                          borderRadius: BorderRadius.circular(1),
                        ),
                      ),
                  ],
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: AppSpacing.md),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                currentStep.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.brandNeutral800,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                currentStep.subtitle,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.brandNeutral600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getConnectorColor(PropertyFormStep step) {
    final stepIndex = PropertyFormStep.values.indexOf(step);
    final currentIndex = PropertyFormStep.values.indexOf(currentStep);

    if (stepIndex < currentIndex || (stepCompletion[step] ?? false)) {
      return AppColors.stateGreen500;
    }
    return AppColors.brandNeutral300;
  }
}

class _StepItem extends StatelessWidget {
  final PropertyFormStep step;
  final bool isActive;
  final bool isCompleted;
  final int stepNumber;

  const _StepItem({
    required this.step,
    required this.isActive,
    required this.isCompleted,
    required this.stepNumber,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: _getBackgroundColor(),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _getBorderColor(),
              width: 2,
            ),
          ),
          child: Center(
            child: _buildContent(),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          step.title,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w500,
            color: _getTextColor(),
          ),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        if (step.isRequired)
          Container(
            margin: const EdgeInsets.only(top: 2),
            child: const Text(
              '*',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.error,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildContent() {
    if (isCompleted) {
      return const Icon(
        Icons.check,
        size: 18,
        color: AppColors.white,
      );
    }

    return Text(
      stepNumber.toString(),
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: _getIconColor(),
      ),
    );
  }

  Color _getBackgroundColor() {
    if (isCompleted) {
      return AppColors.stateGreen500;
    }
    if (isActive) {
      return AppColors.white;
    }
    return AppColors.brandNeutral100;
  }

  Color _getBorderColor() {
    if (isCompleted) {
      return AppColors.stateGreen500;
    }
    if (isActive) {
      return AppColors.stateGreen500;
    }
    return AppColors.brandNeutral300;
  }

  Color _getIconColor() {
    if (isCompleted) {
      return AppColors.white;
    }
    if (isActive) {
      return AppColors.stateGreen500;
    }
    return AppColors.brandNeutral500;
  }

  Color _getTextColor() {
    if (isCompleted || isActive) {
      return AppColors.brandNeutral800;
    }
    return AppColors.brandNeutral500;
  }
}