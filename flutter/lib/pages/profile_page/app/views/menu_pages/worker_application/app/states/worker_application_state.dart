import 'package:equatable/equatable.dart';
import '../../domain/entities/worker_application_entity.dart';
import '../../domain/entities/contact_info_entity.dart';
import '../../domain/entities/documents_entity.dart';
import '../../domain/entities/address_entity.dart';
import '../../domain/entities/skills_entity.dart';
import '../../domain/entities/banking_info_entity.dart';

enum WorkerApplicationStatus {
  initial,
  loading,
  success,
  failure,
}

enum WorkerApplicationStep {
  personalInfo,
  documents,
  address,
  skills,
  banking,
  review,
}

class WorkerApplicationState extends Equatable {
  final WorkerApplicationStatus status;
  final WorkerApplicationEntity formData;
  final WorkerApplicationStep currentStep;
  final Map<WorkerApplicationStep, bool> stepCompletion;
  final String? errorMessage;
  final bool isSubmitting;
  final WorkerApplicationEntity? existingApplication;

  const WorkerApplicationState({
    this.status = WorkerApplicationStatus.initial,
    required this.formData,
    this.currentStep = WorkerApplicationStep.personalInfo,
    this.stepCompletion = const {},
    this.errorMessage,
    this.isSubmitting = false,
    this.existingApplication,
  });

  WorkerApplicationState copyWith({
    WorkerApplicationStatus? status,
    WorkerApplicationEntity? formData,
    WorkerApplicationStep? currentStep,
    Map<WorkerApplicationStep, bool>? stepCompletion,
    String? errorMessage,
    bool? isSubmitting,
    WorkerApplicationEntity? existingApplication,
  }) {
    return WorkerApplicationState(
      status: status ?? this.status,
      formData: formData ?? this.formData,
      currentStep: currentStep ?? this.currentStep,
      stepCompletion: stepCompletion ?? this.stepCompletion,
      errorMessage: errorMessage,
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
    return currentStep == WorkerApplicationStep.personalInfo;
  }

  bool get isLastStep {
    return currentStep == WorkerApplicationStep.review;
  }

  bool get isCurrentStepValid {
    switch (currentStep) {
      case WorkerApplicationStep.personalInfo:
        return WorkerApplicationValidation.isPersonalInfoComplete(formData);
      case WorkerApplicationStep.documents:
        return WorkerApplicationValidation.areDocumentsComplete(formData);
      case WorkerApplicationStep.address:
        return WorkerApplicationValidation.isAddressComplete(formData);
      case WorkerApplicationStep.skills:
        return WorkerApplicationValidation.areSkillsComplete(formData);
      case WorkerApplicationStep.banking:
        return WorkerApplicationValidation.isBankingInfoComplete(formData);
      case WorkerApplicationStep.review:
        return WorkerApplicationValidation.isFormComplete(formData);
    }
  }

  bool get canSubmitForm {
    return WorkerApplicationValidation.isFormComplete(formData) &&
        !isSubmitting;
  }

  int get currentStepIndex {
    return WorkerApplicationStep.values.indexOf(currentStep);
  }

  int get totalSteps {
    return WorkerApplicationStep.values.length;
  }

  double get progressPercentage {
    return (currentStepIndex + 1) / totalSteps;
  }

  List<WorkerApplicationStep> get completedSteps {
    return stepCompletion.entries
        .where((entry) => entry.value)
        .map((entry) => entry.key)
        .toList();
  }

  bool isStepCompleted(WorkerApplicationStep step) {
    return stepCompletion[step] ?? false;
  }

  bool get hasExistingApplication => existingApplication != null;

  @override
  List<Object?> get props => [
        status,
        formData,
        currentStep,
        stepCompletion,
        errorMessage,
        isSubmitting,
        existingApplication,
      ];
}

extension WorkerApplicationStepExtension on WorkerApplicationStep {
  String get title {
    switch (this) {
      case WorkerApplicationStep.personalInfo:
        return 'Personal Information';
      case WorkerApplicationStep.documents:
        return 'Document Upload';
      case WorkerApplicationStep.address:
        return 'Address Information';
      case WorkerApplicationStep.skills:
        return 'Skills & Experience';
      case WorkerApplicationStep.banking:
        return 'Banking Information';
      case WorkerApplicationStep.review:
        return 'Review & Submit';
    }
  }

  String get subtitle {
    switch (this) {
      case WorkerApplicationStep.personalInfo:
        return 'Your contact information';
      case WorkerApplicationStep.documents:
        return 'Upload required documents';
      case WorkerApplicationStep.address:
        return 'Your residential address';
      case WorkerApplicationStep.skills:
        return 'Your skills and experience';
      case WorkerApplicationStep.banking:
        return 'Banking details for payments';
      case WorkerApplicationStep.review:
        return 'Review your application before submitting';
    }
  }

  bool get isRequired {
    return true; // All steps are required for worker application
  }
}

class WorkerApplicationValidation {
  static bool isPersonalInfoComplete(WorkerApplicationEntity formData) {
    return formData.contactInfo.fullName.trim().isNotEmpty &&
        formData.contactInfo.email.trim().isNotEmpty &&
        validateEmail(formData.contactInfo.email.trim()) == null &&
        formData.contactInfo.phone.trim().isNotEmpty &&
        formData.contactInfo.alternativePhone.trim().isNotEmpty &&
        validatePhone(formData.contactInfo.alternativePhone.trim()) == null;
  }

  static bool areDocumentsComplete(WorkerApplicationEntity formData) {
    return formData.documents.hasAadhaarCard &&
        formData.documents.hasPanCard &&
        formData.documents.hasProfilePhoto &&
        formData.documents.hasPoliceVerification;
  }

  static bool isAddressComplete(WorkerApplicationEntity formData) {
    return formData.address.street.trim().isNotEmpty &&
        formData.address.city.trim().isNotEmpty &&
        formData.address.state.trim().isNotEmpty &&
        formData.address.pincode.trim().isNotEmpty &&
        _isValidPincode(formData.address.pincode);
  }

  static bool areSkillsComplete(WorkerApplicationEntity formData) {
    return formData.skills.hasSkills && formData.skills.hasValidExperience;
  }

  static bool isBankingInfoComplete(WorkerApplicationEntity formData) {
    return formData.bankingInfo.accountHolderName.trim().isNotEmpty &&
        formData.bankingInfo.accountNumber.trim().isNotEmpty &&
        formData.bankingInfo.ifscCode.trim().isNotEmpty &&
        formData.bankingInfo.bankName.trim().isNotEmpty;
  }

  static bool isFormComplete(WorkerApplicationEntity formData) {
    return isPersonalInfoComplete(formData) &&
        areDocumentsComplete(formData) &&
        isAddressComplete(formData) &&
        areSkillsComplete(formData) &&
        isBankingInfoComplete(formData);
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

  static String? validateIFSC(String ifsc) {
    if (ifsc.isEmpty) {
      return 'IFSC code is required';
    }
    final ifscRegExp = RegExp(r'^[A-Z]{4}0[A-Z0-9]{6}$');
    if (!ifscRegExp.hasMatch(ifsc.toUpperCase())) {
      return 'Please enter a valid IFSC code (e.g., SBIN0123456)';
    }
    return null;
  }
}

// Create initial empty state for the form
WorkerApplicationEntity createInitialWorkerApplication() {
  return const WorkerApplicationEntity(
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
    skills: SkillsEntity(
      experienceYears: 0,
      skills: [],
    ),
    bankingInfo: BankingInfoEntity(
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    ),
  );
}
