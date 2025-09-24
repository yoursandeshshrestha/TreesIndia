import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/utils/services/location_onboarding_service.dart';
import '../states/worker_application_state.dart';
import '../../domain/usecases/submit_worker_application_usecase.dart';
import '../../domain/usecases/get_user_application_status_usecase.dart';

class WorkerApplicationNotifier extends StateNotifier<WorkerApplicationState> {
  final SubmitWorkerApplicationUsecase submitWorkerApplicationUsecase;
  final GetUserApplicationStatusUsecase getUserApplicationStatusUsecase;
  final LocationOnboardingService locationOnboardingService;

  WorkerApplicationNotifier({
    required this.submitWorkerApplicationUsecase,
    required this.getUserApplicationStatusUsecase,
    required this.locationOnboardingService,
  }) : super(WorkerApplicationState(
          formData: createInitialWorkerApplication(),
        ));

  Future<void> loadExistingApplication() async {
    try {
      state = state.copyWith(status: WorkerApplicationStatus.loading);
      final existingApp = await getUserApplicationStatusUsecase();
      state = state.copyWith(
        status: WorkerApplicationStatus.initial,
        existingApplication: existingApp,
        formData: existingApp ?? state.formData,
      );
    } catch (e) {
      state = state.copyWith(
        status: WorkerApplicationStatus.initial,
        errorMessage: 'Failed to load existing application: ${e.toString()}',
      );
    }
  }

  void updatePersonalInfo({
    String? fullName,
    String? email,
    String? phone,
    String? alternativePhone,
  }) {
    final updatedContactInfo = state.formData.contactInfo.copyWith(
      fullName: fullName,
      email: email,
      phone: phone,
      alternativePhone: alternativePhone,
    );

    final updatedFormData =
        state.formData.copyWith(contactInfo: updatedContactInfo);
    state = state.copyWith(formData: updatedFormData, emailError: null);
    _updateStepCompletion();
  }

  void updateDocuments({
    String? aadhaarCard,
    String? panCard,
    String? profilePhoto,
    String? policeVerification,
    bool removeAadhaarCard = false,
    bool removePanCard = false,
    bool removeProfilePhoto = false,
    bool removePoliceVerification = false,
  }) {
    final updatedDocuments = state.formData.documents.copyWith(
      aadhaarCard: aadhaarCard,
      panCard: panCard,
      profilePhoto: profilePhoto,
      policeVerification: policeVerification,
      removeAadhaarCard: removeAadhaarCard,
      removePanCard: removePanCard,
      removeProfilePhoto: removeProfilePhoto,
      removePoliceVerification: removePoliceVerification,
    );

    final updatedFormData =
        state.formData.copyWith(documents: updatedDocuments);
    state = state.copyWith(formData: updatedFormData);
    _updateStepCompletion();
  }

  void updateAddress({
    String? street,
    String? city,
    String? state,
    String? pincode,
    String? landmark,
  }) {
    final updatedAddress = this.state.formData.address.copyWith(
          street: street,
          city: city,
          state: state,
          pincode: pincode,
          landmark: landmark,
        );

    final updatedFormData =
        this.state.formData.copyWith(address: updatedAddress);
    this.state = this.state.copyWith(formData: updatedFormData);
    _updateStepCompletion();
  }

  void updateSkills({
    String? experienceYears,
    List<String>? skills,
  }) {
    final updatedSkills = state.formData.skills.copyWith(
      experienceYears: experienceYears,
      skills: skills,
    );

    final updatedFormData = state.formData.copyWith(skills: updatedSkills);
    state = state.copyWith(formData: updatedFormData);
    _updateStepCompletion();
  }

  void updateBankingInfo({
    String? accountHolderName,
    String? accountNumber,
    String? ifscCode,
    String? bankName,
  }) {
    final updatedBankingInfo = state.formData.bankingInfo.copyWith(
      accountHolderName: accountHolderName,
      accountNumber: accountNumber,
      ifscCode: ifscCode,
      bankName: bankName,
    );

    final updatedFormData =
        state.formData.copyWith(bankingInfo: updatedBankingInfo);
    state = state.copyWith(formData: updatedFormData);
    _updateStepCompletion();
  }

  void goToNextStep() {
    if (state.canGoToNextStep) {
      final nextStepIndex = state.currentStepIndex + 1;
      final nextStep = WorkerApplicationStep.values[nextStepIndex];
      state = state.copyWith(currentStep: nextStep);
    }
  }

  void goToPreviousStep() {
    if (state.canGoToPreviousStep) {
      final previousStepIndex = state.currentStepIndex - 1;
      final previousStep = WorkerApplicationStep.values[previousStepIndex];
      state = state.copyWith(currentStep: previousStep);
    }
  }

  void goToStep(WorkerApplicationStep step) {
    state = state.copyWith(currentStep: step);
  }

  void _updateStepCompletion() {
    final stepCompletion = <WorkerApplicationStep, bool>{
      WorkerApplicationStep.personalInfo:
          WorkerApplicationValidation.isPersonalInfoComplete(state.formData),
      WorkerApplicationStep.documents:
          WorkerApplicationValidation.areDocumentsComplete(state.formData),
      WorkerApplicationStep.address:
          WorkerApplicationValidation.isAddressComplete(state.formData),
      WorkerApplicationStep.skills:
          WorkerApplicationValidation.areSkillsComplete(state.formData),
      WorkerApplicationStep.banking:
          WorkerApplicationValidation.isBankingInfoComplete(state.formData),
      WorkerApplicationStep.review:
          WorkerApplicationValidation.isFormComplete(state.formData),
    };

    state = state.copyWith(stepCompletion: stepCompletion);
  }

  Future<void> submitApplication() async {
    if (!state.canSubmitForm) return;

    try {
      state = state.copyWith(
        status: WorkerApplicationStatus.loading,
        isSubmitting: true,
        errorMessage: null,
      );

      final result = await submitWorkerApplicationUsecase.call(state.formData);

      state = state.copyWith(
        status: WorkerApplicationStatus.success,
        isSubmitting: false,
        existingApplication: result,
      );

      // After successful submission, load the complete application status
      // This will get the full application data including user and worker details
      await loadExistingApplication();
    } on DioException catch (e) {
      if (e.response?.statusCode == 400 &&
          e.response?.data['error'] == 'email already exists') {
        state = state.copyWith(
          status: WorkerApplicationStatus.failure,
          isSubmitting: false,
          emailError: 'This email is already in use. Please use a different email.',
        );
      } else {
        state = state.copyWith(
          status: WorkerApplicationStatus.failure,
          isSubmitting: false,
          errorMessage: e.toString(),
        );
      }
    } catch (e) {
      state = state.copyWith(
        status: WorkerApplicationStatus.failure,
        isSubmitting: false,
        errorMessage: e.toString(),
      );
    }
  }

  void clearError() {
    state = state.copyWith(
        errorMessage: null, status: WorkerApplicationStatus.initial);
  }

  void resetForm() {
    state = WorkerApplicationState(
      formData: createInitialWorkerApplication(),
      currentStep: WorkerApplicationStep.personalInfo,
    );
  }

  Future<void> getCurrentLocation() async {
    try {
      state = state.copyWith(status: WorkerApplicationStatus.loading);

      final location = await locationOnboardingService.getSavedLocation();

      if (location != null) {
        final updatedFormData = state.formData.copyWith(
          address: state.formData.address.copyWith(
            street: location.address.isNotEmpty ? location.address : '',
            city: location.city ?? '',
            state: location.state ?? '',
            pincode: location.postalCode ?? '',
            landmark: '',
          ),
        );

        state = state.copyWith(
          status: WorkerApplicationStatus.initial,
          formData: updatedFormData,
          errorMessage: null,
        );
      } else {
        state = state.copyWith(
          status: WorkerApplicationStatus.failure,
          errorMessage: 'Could not determine address from current location.',
        );
      }
    } catch (e) {
      state = state.copyWith(
        status: WorkerApplicationStatus.failure,
        errorMessage: 'Failed to get current location: ${e.toString()}',
      );
    }
  }
}
