import 'package:equatable/equatable.dart';
import '../../domain/entities/vendor_form_entity.dart';

enum VendorFormStatus {
  initial,
  loading,
  success,
  failure,
}

enum VendorFormStep {
  businessDetails,
  contactDetails,
  businessProfile,
  locationDetails,
  photos,
}

class VendorFormState extends Equatable {
  final VendorFormStatus status;
  final VendorFormEntity formData;
  final VendorFormStep currentStep;
  final Map<VendorFormStep, bool> stepCompletion;
  final String? errorMessage;
  final bool isSubmitting;

  const VendorFormState({
    this.status = VendorFormStatus.initial,
    required this.formData,
    this.currentStep = VendorFormStep.businessDetails,
    this.stepCompletion = const {},
    this.errorMessage,
    this.isSubmitting = false,
  });

  VendorFormState copyWith({
    VendorFormStatus? status,
    VendorFormEntity? formData,
    VendorFormStep? currentStep,
    Map<VendorFormStep, bool>? stepCompletion,
    String? errorMessage,
    bool? isSubmitting,
  }) {
    return VendorFormState(
      status: status ?? this.status,
      formData: formData ?? this.formData,
      currentStep: currentStep ?? this.currentStep,
      stepCompletion: stepCompletion ?? this.stepCompletion,
      errorMessage: errorMessage,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }

  // Helper methods
  bool get canGoToNextStep {
    return isCurrentStepValid && !isLastStep;
  }

  bool get canGoToPreviousStep {
    return !isFirstStep;
  }

  bool get isFirstStep {
    return currentStep == VendorFormStep.businessDetails;
  }

  bool get isLastStep {
    return currentStep == VendorFormStep.photos;
  }

  bool get isCurrentStepValid {
    switch (currentStep) {
      case VendorFormStep.businessDetails:
        return VendorFormValidation.isStep1Complete(formData);
      case VendorFormStep.contactDetails:
        return VendorFormValidation.isStep2Complete(formData);
      case VendorFormStep.businessProfile:
        return VendorFormValidation.isStep3Complete(formData);
      case VendorFormStep.locationDetails:
        return VendorFormValidation.isStep4Complete(formData);
      case VendorFormStep.photos:
        return VendorFormValidation.isStep5Complete(formData);
    }
  }

  bool get canSubmitForm {
    return VendorFormValidation.isFormComplete(formData) && !isSubmitting;
  }

  int get currentStepIndex {
    return VendorFormStep.values.indexOf(currentStep);
  }

  int get totalSteps {
    return VendorFormStep.values.length;
  }

  double get progressPercentage {
    return (currentStepIndex + 1) / totalSteps;
  }

  List<VendorFormStep> get completedSteps {
    return stepCompletion.entries
        .where((entry) => entry.value)
        .map((entry) => entry.key)
        .toList();
  }

  bool isStepCompleted(VendorFormStep step) {
    return stepCompletion[step] ?? false;
  }

  @override
  List<Object?> get props => [
        status,
        formData,
        currentStep,
        stepCompletion,
        errorMessage,
        isSubmitting,
      ];
}

extension VendorFormStepExtension on VendorFormStep {
  String get title {
    switch (this) {
      case VendorFormStep.businessDetails:
        return 'Business Details';
      case VendorFormStep.contactDetails:
        return 'Contact Information';
      case VendorFormStep.businessProfile:
        return 'Business Profile';
      case VendorFormStep.locationDetails:
        return 'Location Details';
      case VendorFormStep.photos:
        return 'Photos & Gallery';
    }
  }

  String get subtitle {
    switch (this) {
      case VendorFormStep.businessDetails:
        return 'Business name and description';
      case VendorFormStep.contactDetails:
        return 'Contact person and details';
      case VendorFormStep.businessProfile:
        return 'Business type and services offered';
      case VendorFormStep.locationDetails:
        return 'Where is your business located?';
      case VendorFormStep.photos:
        return 'Upload profile picture and business gallery';
    }
  }

  bool get isRequired {
    switch (this) {
      case VendorFormStep.businessDetails:
      case VendorFormStep.contactDetails:
      case VendorFormStep.businessProfile:
      case VendorFormStep.locationDetails:
        return true;
      case VendorFormStep.photos:
        return false; // Photos are optional but gallery requires minimum 2
    }
  }
}

class VendorFormValidation {
  static bool isStep1Complete(VendorFormEntity formData) {
    return formData.vendorName.trim().isNotEmpty;
  }

  static bool isStep2Complete(VendorFormEntity formData) {
    return formData.contactPersonName.trim().isNotEmpty &&
        formData.contactPersonPhone.trim().isNotEmpty;
  }

  static bool isStep3Complete(VendorFormEntity formData) {
    return formData.businessType.trim().isNotEmpty &&
        formData.servicesOffered.isNotEmpty;
  }

  static bool isStep4Complete(VendorFormEntity formData) {
    return formData.businessAddress.isNotEmpty &&
        formData.businessAddress['street'] != null &&
        formData.businessAddress['city'] != null &&
        formData.businessAddress['state'] != null &&
        formData.businessAddress['pincode'] != null;
  }

  static bool isStep5Complete(VendorFormEntity formData) {
    // Business gallery requires minimum 2 images
    return formData.businessGallery.length >= 2;
  }

  static bool isFormComplete(VendorFormEntity formData) {
    return isStep1Complete(formData) &&
        isStep2Complete(formData) &&
        isStep3Complete(formData) &&
        isStep4Complete(formData) &&
        isStep5Complete(formData);
  }
}