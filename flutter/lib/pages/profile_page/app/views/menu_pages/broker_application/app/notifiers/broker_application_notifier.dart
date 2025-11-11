import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/utils/services/location_onboarding_service.dart';
import '../states/broker_application_state.dart';
import '../../domain/usecases/submit_broker_application_usecase.dart';
import '../../domain/usecases/get_broker_application_status_usecase.dart';

class BrokerApplicationNotifier extends StateNotifier<BrokerApplicationState> {
  final SubmitBrokerApplicationUsecase submitBrokerApplicationUsecase;
  final GetBrokerApplicationStatusUsecase getBrokerApplicationStatusUsecase;
  final LocationOnboardingService locationOnboardingService;

  BrokerApplicationNotifier({
    required this.submitBrokerApplicationUsecase,
    required this.getBrokerApplicationStatusUsecase,
    required this.locationOnboardingService,
  }) : super(BrokerApplicationState(
          formData: createInitialBrokerApplication(),
        ));

  Future<void> loadExistingApplication() async {
    try {
      state = state.copyWith(status: BrokerApplicationStatus.loading);
      final existingApp = await getBrokerApplicationStatusUsecase();
      state = state.copyWith(
        status: BrokerApplicationStatus.initial,
        existingApplication: existingApp,
        formData: existingApp ?? state.formData,
      );
    } catch (e) {
      state = state.copyWith(
        status: BrokerApplicationStatus.initial,
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
    bool removeAadhaarCard = false,
    bool removePanCard = false,
    bool removeProfilePhoto = false,
  }) {
    final updatedDocuments = state.formData.documents.copyWith(
      aadhaarCard: aadhaarCard,
      panCard: panCard,
      profilePhoto: profilePhoto,
      removeAadhaarCard: removeAadhaarCard,
      removePanCard: removePanCard,
      removeProfilePhoto: removeProfilePhoto,
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

  void updateBrokerDetails({
    String? licenseNumber,
    String? agencyName,
  }) {
    final updatedBrokerDetails = state.formData.brokerDetails.copyWith(
      licenseNumber: licenseNumber,
      agencyName: agencyName,
    );

    final updatedFormData =
        state.formData.copyWith(brokerDetails: updatedBrokerDetails);
    state = state.copyWith(formData: updatedFormData);
    _updateStepCompletion();
  }

  void goToNextStep() {
    if (state.canGoToNextStep) {
      final nextStepIndex = state.currentStepIndex + 1;
      final nextStep = BrokerApplicationStep.values[nextStepIndex];
      state = state.copyWith(currentStep: nextStep);
    }
  }

  void goToPreviousStep() {
    if (state.canGoToPreviousStep) {
      final previousStepIndex = state.currentStepIndex - 1;
      final previousStep = BrokerApplicationStep.values[previousStepIndex];
      state = state.copyWith(currentStep: previousStep);
    }
  }

  void goToStep(BrokerApplicationStep step) {
    state = state.copyWith(currentStep: step);
  }

  void _updateStepCompletion() {
    final stepCompletion = <BrokerApplicationStep, bool>{
      BrokerApplicationStep.personalInfo:
          BrokerApplicationValidation.isPersonalInfoComplete(state.formData),
      BrokerApplicationStep.documents:
          BrokerApplicationValidation.areDocumentsComplete(state.formData),
      BrokerApplicationStep.address:
          BrokerApplicationValidation.isAddressComplete(state.formData),
      BrokerApplicationStep.brokerDetails:
          BrokerApplicationValidation.areBrokerDetailsComplete(state.formData),
      BrokerApplicationStep.review:
          BrokerApplicationValidation.isFormComplete(state.formData),
    };

    state = state.copyWith(stepCompletion: stepCompletion);
  }

  Future<void> submitApplication() async {
    if (!state.canSubmitForm) return;

    try {
      state = state.copyWith(
        status: BrokerApplicationStatus.loading,
        isSubmitting: true,
        errorMessage: null,
      );

      final result = await submitBrokerApplicationUsecase.call(state.formData);

      state = state.copyWith(
        status: BrokerApplicationStatus.success,
        isSubmitting: false,
        existingApplication: result,
      );

      // After successful submission, load the complete application status
      // This will get the full application data including user and broker details
      await loadExistingApplication();
    } on DioException catch (e) {
      if (e.response?.statusCode == 400 &&
          e.response?.data['error'] == 'email already exists') {
        state = state.copyWith(
          status: BrokerApplicationStatus.failure,
          isSubmitting: false,
          emailError:
              'This email is already in use. Please use a different email.',
        );
      } else {
        state = state.copyWith(
          status: BrokerApplicationStatus.failure,
          isSubmitting: false,
          errorMessage: e.toString(),
        );
      }
    } catch (e) {
      state = state.copyWith(
        status: BrokerApplicationStatus.failure,
        isSubmitting: false,
        errorMessage: e.toString(),
      );
    }
  }

  void clearError() {
    state = state.copyWith(
        errorMessage: null, status: BrokerApplicationStatus.initial);
  }

  void resetForm() {
    state = BrokerApplicationState(
      formData: createInitialBrokerApplication(),
      currentStep: BrokerApplicationStep.personalInfo,
    );
  }

  Future<void> getCurrentLocation() async {
    try {
      final location = await locationOnboardingService.getCurrentLocation();

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
        status: BrokerApplicationStatus.initial,
        formData: updatedFormData,
        errorMessage: null,
      );
        } catch (e) {
      state = state.copyWith(
        status: BrokerApplicationStatus.failure,
        errorMessage: 'Failed to get current location: ${e.toString()}',
      );
    }
  }
}
