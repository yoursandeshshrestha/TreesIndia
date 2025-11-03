import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import '../../states/broker_application_state.dart';

class BrokerFormStepIndicator extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final Map<BrokerApplicationStep, bool> stepCompletion;

  const BrokerFormStepIndicator({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    required this.stepCompletion,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: AppColors.brandNeutral200,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          // Progress bar
          Row(
            children: List.generate(totalSteps, (index) {
              final isActive = index <= currentStep;
              final isCompleted = index < currentStep;

              return Expanded(
                child: Container(
                  height: 4,
                  margin: EdgeInsets.only(
                    right: index < totalSteps - 1 ? 4 : 0,
                  ),
                  decoration: BoxDecoration(
                    color: isCompleted
                        ? AppColors.stateGreen600
                        : isActive
                            ? AppColors.stateGreen400
                            : AppColors.brandNeutral200,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              );
            }),
          ),

          const SizedBox(height: AppSpacing.md),

          // Step info
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  B4Regular(
                    text: 'Step ${currentStep + 1} of $totalSteps',
                    color: AppColors.brandNeutral600,
                  ),
                  const SizedBox(height: 4),
                  B3Bold(
                    text: BrokerApplicationStep.values[currentStep].title,
                    color: AppColors.brandNeutral900,
                  ),
                ],
              ),
              // Step indicators
              Row(
                children: List.generate(totalSteps, (index) {
                  final isActive = index == currentStep;
                  final isCompleted = index < currentStep;

                  return Container(
                    width: 8,
                    height: 8,
                    margin: EdgeInsets.only(
                      left: index > 0 ? 8 : 0,
                    ),
                    decoration: BoxDecoration(
                      color: isCompleted
                          ? AppColors.stateGreen600
                          : isActive
                              ? AppColors.stateGreen600
                              : AppColors.brandNeutral300,
                      shape: BoxShape.circle,
                    ),
                  );
                }),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
