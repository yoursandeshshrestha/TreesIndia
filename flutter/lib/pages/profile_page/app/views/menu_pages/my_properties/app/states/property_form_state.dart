import 'package:equatable/equatable.dart';
import '../../data/models/property_form_data.dart';

enum PropertyFormStatus {
  initial,
  loading,
  success,
  failure,
}

enum PropertyFormStep {
  basicDetails,
  locationDetails,
  propertyProfile,
  photos,
  pricing,
}

class PropertyFormState extends Equatable {
  final PropertyFormStatus status;
  final PropertyFormData formData;
  final PropertyFormStep currentStep;
  final Map<PropertyFormStep, bool> stepCompletion;
  final String? errorMessage;
  final bool isSubmitting;

  const PropertyFormState({
    this.status = PropertyFormStatus.initial,
    required this.formData,
    this.currentStep = PropertyFormStep.basicDetails,
    this.stepCompletion = const {},
    this.errorMessage,
    this.isSubmitting = false,
  });

  PropertyFormState copyWith({
    PropertyFormStatus? status,
    PropertyFormData? formData,
    PropertyFormStep? currentStep,
    Map<PropertyFormStep, bool>? stepCompletion,
    String? errorMessage,
    bool? isSubmitting,
  }) {
    return PropertyFormState(
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
    return currentStep == PropertyFormStep.basicDetails;
  }

  bool get isLastStep {
    return currentStep == PropertyFormStep.pricing;
  }

  bool get isCurrentStepValid {
    switch (currentStep) {
      case PropertyFormStep.basicDetails:
        return PropertyFormValidation.isStep1Complete(formData);
      case PropertyFormStep.locationDetails:
        return PropertyFormValidation.isStep2Complete(formData);
      case PropertyFormStep.propertyProfile:
        return PropertyFormValidation.isStep3Complete(formData);
      case PropertyFormStep.photos:
        return PropertyFormValidation.isStep4Complete(formData);
      case PropertyFormStep.pricing:
        return PropertyFormValidation.isStep5Complete(formData);
    }
  }

  bool get canSubmitForm {
    return PropertyFormValidation.isFormComplete(formData) && !isSubmitting;
  }

  int get currentStepIndex {
    return PropertyFormStep.values.indexOf(currentStep);
  }

  int get totalSteps {
    return PropertyFormStep.values.length;
  }

  double get progressPercentage {
    return (currentStepIndex + 1) / totalSteps;
  }

  List<PropertyFormStep> get completedSteps {
    return stepCompletion.entries
        .where((entry) => entry.value)
        .map((entry) => entry.key)
        .toList();
  }

  bool isStepCompleted(PropertyFormStep step) {
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

extension PropertyFormStepExtension on PropertyFormStep {
  String get title {
    switch (this) {
      case PropertyFormStep.basicDetails:
        return 'Basic Details';
      case PropertyFormStep.locationDetails:
        return 'Location Details';
      case PropertyFormStep.propertyProfile:
        return 'Property Profile';
      case PropertyFormStep.photos:
        return 'Photos';
      case PropertyFormStep.pricing:
        return 'Pricing';
    }
  }

  String get subtitle {
    switch (this) {
      case PropertyFormStep.basicDetails:
        return 'Property type and listing details';
      case PropertyFormStep.locationDetails:
        return 'Where is your property located?';
      case PropertyFormStep.propertyProfile:
        return 'Property features and specifications';
      case PropertyFormStep.photos:
        return 'Upload property images';
      case PropertyFormStep.pricing:
        return 'Set your property price';
    }
  }

  bool get isRequired {
    switch (this) {
      case PropertyFormStep.basicDetails:
      case PropertyFormStep.locationDetails:
      case PropertyFormStep.photos:
      case PropertyFormStep.pricing:
        return true;
      case PropertyFormStep.propertyProfile:
        return false;
    }
  }
}