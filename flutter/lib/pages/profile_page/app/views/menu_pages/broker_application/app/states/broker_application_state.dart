import 'package:equatable/equatable.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/domain/entities/contact_info_entity.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/domain/entities/documents_entity.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/domain/entities/address_entity.dart';
import '../../domain/entities/broker_application_entity.dart';
import '../../domain/entities/broker_details_entity.dart';

enum BrokerApplicationStatus {
  initial,
  loading,
  success,
  failure,
}

enum BrokerApplicationStep {
  personalInfo,
  documents,
  address,
  brokerDetails,
  review,
}

class BrokerApplicationState extends Equatable {
  final BrokerApplicationStatus status;
  final BrokerApplicationEntity formData;
  final BrokerApplicationStep currentStep;
  final Map<BrokerApplicationStep, bool> stepCompletion;
  final String? errorMessage;
  final String? emailError;
  final bool isSubmitting;
  final BrokerApplicationEntity? existingApplication;

  const BrokerApplicationState({
    this.status = BrokerApplicationStatus.initial,
    required this.formData,
    this.currentStep = BrokerApplicationStep.personalInfo,
    this.stepCompletion = const {},
    this.errorMessage,
    this.emailError,
    this.isSubmitting = false,
    this.existingApplication,
  });

  BrokerApplicationState copyWith({
    BrokerApplicationStatus? status,
    BrokerApplicationEntity? formData,
    BrokerApplicationStep? currentStep,
    Map<BrokerApplicationStep, bool>? stepCompletion,
    String? errorMessage,
    String? emailError,
    bool? isSubmitting,
    BrokerApplicationEntity? existingApplication,
  }) {
    return BrokerApplicationState(
      status: status ?? this.status,
      formData: formData ?? this.formData,
      currentStep: currentStep ?? this.currentStep,
      stepCompletion: stepCompletion ?? this.stepCompletion,
      errorMessage: errorMessage,
      emailError: emailError,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      existingApplication: existingApplication ?? this.existingApplication,
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
    return currentStep == BrokerApplicationStep.personalInfo;
  }

  bool get isLastStep {
    return currentStep == BrokerApplicationStep.review;
  }

  bool get isCurrentStepValid {
    switch (currentStep) {
      case BrokerApplicationStep.personalInfo:
        return BrokerApplicationValidation.isPersonalInfoComplete(formData);
      case BrokerApplicationStep.documents:
        return BrokerApplicationValidation.areDocumentsComplete(formData);
      case BrokerApplicationStep.address:
        return BrokerApplicationValidation.isAddressComplete(formData);
      case BrokerApplicationStep.brokerDetails:
        return BrokerApplicationValidation.areBrokerDetailsComplete(formData);
      case BrokerApplicationStep.review:
        return BrokerApplicationValidation.isFormComplete(formData);
    }
  }

  bool get canSubmitForm {
    return BrokerApplicationValidation.isFormComplete(formData) &&
        !isSubmitting;
  }

  int get currentStepIndex {
    return BrokerApplicationStep.values.indexOf(currentStep);
  }

  int get totalSteps {
    return BrokerApplicationStep.values.length;
  }

  double get progressPercentage {
    return (currentStepIndex + 1) / totalSteps;
  }

  List<BrokerApplicationStep> get completedSteps {
    return stepCompletion.entries
        .where((entry) => entry.value)
        .map((entry) => entry.key)
        .toList();
  }

  bool isStepCompleted(BrokerApplicationStep step) {
    return stepCompletion[step] ?? false;
  }

  bool get hasExistingApplication => existingApplication != null;

  bool get shouldShowStatusWidget =>
      existingApplication?.hasExistingApplication == true;

  bool get shouldShowForm => !shouldShowStatusWidget;

  @override
  List<Object?> get props => [
        status,
        formData,
        currentStep,
        stepCompletion,
        errorMessage,
        emailError,
        isSubmitting,
        existingApplication,
      ];
}

extension BrokerApplicationStepExtension on BrokerApplicationStep {
  String get title {
    switch (this) {
      case BrokerApplicationStep.personalInfo:
        return 'Personal Information';
      case BrokerApplicationStep.documents:
        return 'Document Upload';
      case BrokerApplicationStep.address:
        return 'Address Information';
      case BrokerApplicationStep.brokerDetails:
        return 'Broker Details';
      case BrokerApplicationStep.review:
        return 'Review & Submit';
    }
  }

  String get subtitle {
    switch (this) {
      case BrokerApplicationStep.personalInfo:
        return 'Your contact information';
      case BrokerApplicationStep.documents:
        return 'Upload required documents';
      case BrokerApplicationStep.address:
        return 'Your residential address';
      case BrokerApplicationStep.brokerDetails:
        return 'Your broker license and agency details';
      case BrokerApplicationStep.review:
        return 'Review your application before submitting';
    }
  }

  bool get isRequired {
    return true; // All steps are required for broker application
  }
}

class BrokerApplicationValidation {
  static bool isPersonalInfoComplete(BrokerApplicationEntity formData) {
    return formData.contactInfo.fullName.trim().isNotEmpty &&
        formData.contactInfo.email.trim().isNotEmpty &&
        validateEmail(formData.contactInfo.email.trim()) == null &&
        formData.contactInfo.phone.trim().isNotEmpty &&
        formData.contactInfo.alternativePhone.trim().isNotEmpty &&
        validatePhone(formData.contactInfo.alternativePhone.trim()) == null;
  }

  static bool areDocumentsComplete(BrokerApplicationEntity formData) {
    // Broker only needs 3 documents (no police verification)
    return formData.documents.hasAadhaarCard &&
        formData.documents.hasPanCard &&
        formData.documents.hasProfilePhoto;
  }

  static bool isAddressComplete(BrokerApplicationEntity formData) {
    return formData.address.street.trim().isNotEmpty &&
        formData.address.city.trim().isNotEmpty &&
        formData.address.state.trim().isNotEmpty &&
        formData.address.pincode.trim().isNotEmpty &&
        _isValidPincode(formData.address.pincode);
  }

  static bool areBrokerDetailsComplete(BrokerApplicationEntity formData) {
    return formData.brokerDetails.licenseNumber.trim().isNotEmpty &&
        formData.brokerDetails.agencyName.trim().isNotEmpty;
  }

  static bool isFormComplete(BrokerApplicationEntity formData) {
    return isPersonalInfoComplete(formData) &&
        areDocumentsComplete(formData) &&
        isAddressComplete(formData) &&
        areBrokerDetailsComplete(formData);
  }

  static bool _isValidPincode(String pincode) {
    return pincode.length == 6 && int.tryParse(pincode) != null;
  }

  static String? validateEmail(String email) {
    if (email.isEmpty) {
      return 'Email is required';
    }
    final emailRegExp =
        RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    if (!emailRegExp.hasMatch(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  static String? validatePhone(String phone) {
    if (phone.isEmpty) {
      return 'Phone number is required';
    }
    final phoneRegExp = RegExp(r'^\+?[1-9]\d{9,19}$');
    if (!phoneRegExp.hasMatch(phone.replaceAll(RegExp(r'\s+'), ''))) {
      return 'Please enter a valid phone number (10-20 digits)';
    }
    return null;
  }

  static String? validatePincode(String pincode) {
    if (pincode.isEmpty) {
      return 'Pincode is required';
    }
    if (pincode.length != 6 || int.tryParse(pincode) == null) {
      return 'Pincode must be 6 digits';
    }
    return null;
  }
}

// Create initial empty state for the form
BrokerApplicationEntity createInitialBrokerApplication() {
  return const BrokerApplicationEntity(
    contactInfo: ContactInfoEntity(
      fullName: '',
      email: '',
      phone: '',
      alternativePhone: '',
    ),
    documents: DocumentsEntity(),
    address: AddressEntity(
      street: '',
      city: '',
      state: '',
      pincode: '',
    ),
    brokerDetails: BrokerDetailsEntity(
      licenseNumber: '',
      agencyName: '',
    ),
  );
}
