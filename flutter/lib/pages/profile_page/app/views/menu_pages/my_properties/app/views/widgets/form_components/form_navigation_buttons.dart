import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../states/property_form_state.dart';

class FormNavigationButtons extends StatelessWidget {
  final PropertyFormState state;
  final VoidCallback? onPrevious;
  final VoidCallback? onNext;
  final VoidCallback? onSubmit;

  const FormNavigationButtons({
    super.key,
    required this.state,
    this.onPrevious,
    this.onNext,
    this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: const BoxDecoration(
        color: AppColors.white,
        border: Border(
          top: BorderSide(
            color: AppColors.brandNeutral200,
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Previous button
            if (state.canGoToPreviousStep)
              Expanded(
                child: OutlinedButton(
                  onPressed: state.isSubmitting ? null : onPrevious,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.stateGreen500,
                    side: const BorderSide(color: AppColors.stateGreen500),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    minimumSize: const Size(double.infinity, 48),
                  ),
                  child: const Text(
                    'Previous',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),

            if (state.canGoToPreviousStep && (state.canGoToNextStep || state.isLastStep))
              const SizedBox(width: AppSpacing.md),

            // Next/Submit button
            if (state.canGoToNextStep || state.isLastStep)
              Expanded(
                flex: state.canGoToPreviousStep ? 1 : 2,
                child: SolidButtonWidget(
                  label: state.isLastStep
                      ? (state.isSubmitting ? 'Submitting...' : 'Submit Property')
                      : 'Continue',
                  onPressed: state.isLastStep
                      ? (state.canSubmitForm ? onSubmit : null)
                      : (state.canGoToNextStep ? onNext : null),
                  isEnabled: state.isLastStep
                      ? state.canSubmitForm && !state.isSubmitting
                      : state.canGoToNextStep && !state.isSubmitting,
                  isLoading: state.isSubmitting,
                  icon: state.isLastStep ? Icons.upload : Icons.arrow_forward,
                  iconColor: AppColors.white,
                ),
              ),
          ],
        ),
      ),
    );
  }
}