import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/pages/profile_page/app/providers/profile_providers.dart';
import 'widgets/broker_form_step_indicator.dart';
import '../providers/broker_application_providers.dart';
import '../states/broker_application_state.dart';
import 'steps/personal_info_step.dart';
import 'steps/documents_step.dart';
import 'steps/address_step.dart';
import 'steps/broker_details_step.dart';
import 'steps/review_step.dart';
import 'widgets/broker_application_status_widget.dart';

class BrokerApplicationPage extends ConsumerStatefulWidget {
  const BrokerApplicationPage({super.key});

  @override
  ConsumerState<BrokerApplicationPage> createState() =>
      _BrokerApplicationPageState();
}

class _BrokerApplicationPageState extends ConsumerState<BrokerApplicationPage> {
  @override
  void initState() {
    super.initState();
    // Load existing application when page initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(brokerApplicationNotifierProvider.notifier)
          .loadExistingApplication();
    });
  }

  @override
  Widget build(BuildContext context) {
    final brokerApplicationState = ref.watch(brokerApplicationNotifierProvider);


    ref.listen<BrokerApplicationState>(
      brokerApplicationNotifierProvider,
      (previous, next) {
        if (next.emailError != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            ErrorSnackbarWidget(message: next.emailError!).createSnackBar(),
          );
        }
      },
    );

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        ref.invalidate(brokerApplicationNotifierProvider);
      },
      child: Scaffold(
        appBar: const CustomAppBar(
          title: 'Apply for broker',
          backgroundColor: AppColors.white,
          iconColor: AppColors.brandNeutral800,
          titleColor: AppColors.brandNeutral800,
        ),
        backgroundColor: Colors.white,
        body: SafeArea(
          child: _buildBody(brokerApplicationState),
        ),
      ),
    );
  }

  Widget _buildBody(BrokerApplicationState state) {
    if (state.status == BrokerApplicationStatus.loading &&
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

    if (state.status == BrokerApplicationStatus.loading && state.isSubmitting) {
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
        child: BrokerApplicationStatusWidget(
          application: state.existingApplication!,
        ),
      );
    }

    return Column(
      children: [
        // Progress indicator
        BrokerFormStepIndicator(
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

  Widget _buildCurrentStepContent(BrokerApplicationState state) {
    switch (state.currentStep) {
      case BrokerApplicationStep.personalInfo:
        return const PersonalInfoStep();
      case BrokerApplicationStep.documents:
        return const DocumentsStep();
      case BrokerApplicationStep.address:
        return const AddressStep();
      case BrokerApplicationStep.brokerDetails:
        return const BrokerDetailsStep();
      case BrokerApplicationStep.review:
        return const ReviewStep();
    }
  }

  Widget _buildNavigationButtons(BrokerApplicationState state) {
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
                      .read(brokerApplicationNotifierProvider.notifier)
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
                              .read(brokerApplicationNotifierProvider.notifier)
                              .submitApplication();
                          ref.read(profileProvider.notifier).loadProfile();
                        }
                      : null)
                  : (state.isCurrentStepValid
                      ? () => ref
                          .read(brokerApplicationNotifierProvider.notifier)
                          .goToNextStep()
                      : null),
            ),
          ),
        ],
      ),
    );
  }
}
