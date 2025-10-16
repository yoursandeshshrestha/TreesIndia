import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import 'package:trees_india/pages/profile_page/app/providers/profile_providers.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/app/views/widgets/worker_form_step_indicator.dart';
import '../providers/worker_application_providers.dart';
import '../states/worker_application_state.dart';
import 'steps/personal_info_step.dart';
import 'steps/documents_step.dart';
import 'steps/address_step.dart';
import 'steps/skills_step.dart';
import 'steps/banking_step.dart';
import 'steps/review_step.dart';
import 'widgets/worker_application_status_widget.dart';

class WorkerApplicationPage extends ConsumerStatefulWidget {
  const WorkerApplicationPage({super.key});

  @override
  ConsumerState<WorkerApplicationPage> createState() =>
      _WorkerApplicationPageState();
}

class _WorkerApplicationPageState extends ConsumerState<WorkerApplicationPage> {
  @override
  void initState() {
    super.initState();
    // Load existing application when page initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(workerApplicationNotifierProvider.notifier)
          .loadExistingApplication();
    });
  }

  @override
  Widget build(BuildContext context) {
    final workerApplicationState = ref.watch(workerApplicationNotifierProvider);
    final isConnected = ref.watch(connectivityNotifierProvider);
    if (!isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(notificationServiceProvider).showOfflineMessage(
              context,
              onRetry: () => debugPrint('Retrying…'),
            );
      });
    }

    ref.listen<WorkerApplicationState>(
      workerApplicationNotifierProvider,
      (previous, next) {
        if (next.emailError != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            ErrorSnackbarWidget(message: next.emailError!).createSnackBar(),
          );
          // } else if (next.errorMessage != null) {
          //   ScaffoldMessenger.of(context).showSnackBar(
          //     ErrorSnackbarWidget(message: next.errorMessage!).createSnackBar(),

          //   );
        }
      },
    );

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        ref.invalidate(workerApplicationNotifierProvider);
      },
      child: Scaffold(
        appBar: const CustomAppBar(
          title: 'Apply for worker',
          backgroundColor: AppColors.white,
          iconColor: AppColors.brandNeutral800,
          titleColor: AppColors.brandNeutral800,
        ),
        backgroundColor: Colors.white,
        body: SafeArea(
          child: _buildBody(workerApplicationState),
        ),
      ),
    );
  }

  Widget _buildBody(WorkerApplicationState state) {
    if (state.status == WorkerApplicationStatus.loading &&
        !state.isSubmitting) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              valueColor:
                  AlwaysStoppedAnimation<Color>(AppColors.stateGreen600),
            ),
            SizedBox(height: AppSpacing.lg),
            Text(
              'Loading your application...',
              style: TextStyle(
                color: AppColors.brandNeutral600,
                fontSize: 16,
              ),
            ),
          ],
        ),
      );
    }

    if (state.status == WorkerApplicationStatus.loading && state.isSubmitting) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              valueColor:
                  AlwaysStoppedAnimation<Color>(AppColors.stateGreen600),
            ),
            SizedBox(height: AppSpacing.lg),
            Text(
              'Submitting your application...',
              style: TextStyle(
                color: AppColors.brandNeutral600,
                fontSize: 16,
              ),
            ),
          ],
        ),
      );
    }

    if (state.shouldShowStatusWidget) {
      return SingleChildScrollView(
        child: WorkerApplicationStatusWidget(
          application: state.existingApplication!,
        ),
      );
    }

    return Column(
      children: [
        // Progress indicator placeholder
        WorkerFormStepIndicator(
          currentStep: state.currentStepIndex,
          totalSteps: state.totalSteps,
          stepCompletion: state.stepCompletion,
        ),

        // Form content
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: _buildCurrentStepContent(state),
          ),
        ),

        // Navigation buttons
        _buildNavigationButtons(state),
      ],
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
                      ? () {
                          ref
                              .read(workerApplicationNotifierProvider.notifier)
                              .submitApplication();
                          ref.read(profileProvider.notifier).loadProfile();
                        }
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
