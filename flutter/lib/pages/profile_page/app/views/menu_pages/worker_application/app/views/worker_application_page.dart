import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/app/views/widgets/worker_form_step_indicator.dart';
import '../providers/worker_application_providers.dart';
import '../states/worker_application_state.dart';
import 'steps/personal_info_step.dart';
import 'steps/documents_step.dart';
import 'steps/address_step.dart';
import 'steps/skills_step.dart';
import 'steps/banking_step.dart';
import 'steps/review_step.dart';

class WorkerApplicationPage extends ConsumerStatefulWidget {
  const WorkerApplicationPage({super.key});

  @override
  ConsumerState<WorkerApplicationPage> createState() =>
      _WorkerApplicationPageState();
}

class _WorkerApplicationPageState extends ConsumerState<WorkerApplicationPage> {
  @override
  Widget build(BuildContext context) {
    final workerApplicationState = ref.watch(workerApplicationNotifierProvider);

    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Apply for worker',
        backgroundColor: AppColors.white,
        iconColor: AppColors.brandNeutral800,
        titleColor: AppColors.brandNeutral800,
      ),
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Progress indicator placeholder
            WorkerFormStepIndicator(
              currentStep: workerApplicationState.currentStepIndex,
              totalSteps: workerApplicationState.totalSteps,
              stepCompletion: workerApplicationState.stepCompletion,
            ),

            // Form content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: _buildCurrentStepContent(workerApplicationState),
              ),
            ),

            // Navigation buttons
            _buildNavigationButtons(workerApplicationState),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentStepContent(WorkerApplicationState state) {
    switch (state.currentStep) {
      case WorkerApplicationStep.personalInfo:
        return const PersonalInfoStep();
      case WorkerApplicationStep.documents:
        return const DocumentsStep();
      case WorkerApplicationStep.address:
        return const AddressStep();
      case WorkerApplicationStep.skills:
        return const SkillsStep();
      case WorkerApplicationStep.banking:
        return const BankingStep();
      case WorkerApplicationStep.review:
        return const ReviewStep();
    }
  }

  Widget _buildNavigationButtons(WorkerApplicationState state) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(
            color: AppColors.brandNeutral200,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          if (state.canGoToPreviousStep)
            Expanded(
              child: OutlinedButton(
                onPressed: () {
                  ref
                      .read(workerApplicationNotifierProvider.notifier)
                      .goToPreviousStep();
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.brandNeutral700,
                  side: const BorderSide(color: AppColors.brandNeutral700),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('Previous'),
              ),
            ),
          if (state.canGoToPreviousStep) const SizedBox(width: AppSpacing.md),
          Expanded(
            child: SolidButtonWidget(
              label: state.isLastStep ? 'Submit Application' : 'Continue',
              backgroundColor: AppColors.stateGreen600,
              isLoading: state.isSubmitting,
              onPressed: state.isLastStep
                  ? (state.canSubmitForm
                      ? () => ref
                          .read(workerApplicationNotifierProvider.notifier)
                          .submitApplication()
                      : null)
                  : (state.isCurrentStepValid
                      ? () => ref
                          .read(workerApplicationNotifierProvider.notifier)
                          .goToNextStep()
                      : null),
            ),
          ),
        ],
      ),
    );
  }
}
