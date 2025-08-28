import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class StepIndicatorWidget extends StatelessWidget {
  final int currentStep;

  const StepIndicatorWidget({
    super.key,
    required this.currentStep,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        children: [
          _buildStepIndicator(0, 'Date & Time', currentStep >= 0),
          const Expanded(child: Divider()),
          _buildStepIndicator(1, 'Details', currentStep >= 1),
          const Expanded(child: Divider()),
          _buildStepIndicator(2, 'Review', currentStep >= 2),
        ],
      ),
    );
  }

  Widget _buildStepIndicator(int step, String label, bool isActive) {
    return Column(
      children: [
        Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive
                ? AppColors.brandPrimary600
                : AppColors.brandNeutral200,
          ),
          child: Center(
            child: B3Bold(
              text: '${step + 1}',
              color: isActive ? Colors.white : AppColors.brandNeutral600,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        B4Regular(
          text: label,
          color:
              isActive ? AppColors.brandPrimary600 : AppColors.brandNeutral600,
        ),
      ],
    );
  }
}