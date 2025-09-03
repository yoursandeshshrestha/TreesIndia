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
      child: Stack(
        children: [
          // Connecting lines
          Positioned(
            top: 16, // Center of the circles (32/2 = 16)
            left: 12,
            right: 0,
            child: Row(
              children: [
                const SizedBox(width: 20), // Half circle width
                Expanded(
                  child: Container(
                    height: 2,
                    color: currentStep >= 1
                        ? const Color(0xFF055c3a)
                        : AppColors.brandNeutral200,
                  ),
                ),
                const SizedBox(width: 16), // Half circle width
                Expanded(
                  child: Container(
                    height: 2,
                    color: currentStep >= 2
                        ? const Color(0xFF055c3a)
                        : AppColors.brandNeutral200,
                  ),
                ),
                const SizedBox(width: 16), // Half circle width
              ],
            ),
          ),
          // Step indicators
          Row(
            children: [
              _buildStepIndicator(0, 'Date & Time', currentStep >= 0),
              Expanded(child: Container()),
              _buildStepIndicator(1, 'Details', currentStep >= 1),
              Expanded(child: Container()),
              _buildStepIndicator(2, 'Review', currentStep >= 2),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStepIndicator(int step, String label, bool isActive) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color:
                isActive ? const Color(0xFF055c3a) : AppColors.brandNeutral200,
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
          color: isActive ? const Color(0xFF055c3a) : AppColors.brandNeutral600,
        ),
      ],
    );
  }
}
