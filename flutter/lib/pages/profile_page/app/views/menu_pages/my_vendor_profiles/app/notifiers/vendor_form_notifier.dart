import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:trees_india/commons/utils/services/location_onboarding_service.dart';
import '../../domain/entities/vendor_form_entity.dart';
import '../../domain/usecases/create_vendor_usecase.dart';
import '../states/vendor_form_state.dart';

class VendorFormNotifier extends StateNotifier<VendorFormState> {
  final CreateVendorUseCase createVendorUseCase;
  final LocationOnboardingService locationOnboardingService;

  VendorFormNotifier({
    required this.createVendorUseCase,
    required this.locationOnboardingService,
  }) : super(VendorFormState(
          formData: VendorFormEntity.empty(),
        ));

  void updateFormData(VendorFormEntity formData) {
    state = state.copyWith(formData: formData);
  }

  void updateBusinessDetails({
    String? vendorName,
    String? businessDescription,
  }) {
    final updatedFormData = state.formData.copyWith(
      vendorName: vendorName,
      businessDescription: businessDescription,
    );
    state = state.copyWith(formData: updatedFormData);
  }

  void updateContactDetails({
    String? contactPersonName,
    String? contactPersonPhone,
    String? contactPersonEmail,
  }) {
    final updatedFormData = state.formData.copyWith(
      contactPersonName: contactPersonName,
      contactPersonPhone: contactPersonPhone,
      contactPersonEmail: contactPersonEmail,
    );
    state = state.copyWith(formData: updatedFormData);
  }

  void updateBusinessProfile({
    String? businessType,
    int? yearsInBusiness,
    List<String>? servicesOffered,
  }) {
    final updatedFormData = state.formData.copyWith(
      businessType: businessType,
      yearsInBusiness: yearsInBusiness,
      servicesOffered: servicesOffered,
    );
    state = state.copyWith(formData: updatedFormData);
  }

  void updateLocationDetails(Map<String, dynamic> businessAddress) {
    final updatedFormData = state.formData.copyWith(
      businessAddress: businessAddress,
    );
    state = state.copyWith(formData: updatedFormData);
  }

  void updatePhotos({
    String? profilePicture,
    List<String>? businessGallery,
  }) {
    final updatedFormData = state.formData.copyWith(
      profilePicture: profilePicture,
      businessGallery: businessGallery,
    );
    state = state.copyWith(formData: updatedFormData);
  }

  void goToNextStep() {
    if (state.canGoToNextStep) {
      final nextStepIndex = state.currentStepIndex + 1;
      final nextStep = VendorFormStep.values[nextStepIndex];

      // Update step completion
      final updatedStepCompletion = Map<VendorFormStep, bool>.from(state.stepCompletion);
      updatedStepCompletion[state.currentStep] = state.isCurrentStepValid;

      state = state.copyWith(
        currentStep: nextStep,
        stepCompletion: updatedStepCompletion,
      );
    }
  }

  void goToPreviousStep() {
    if (state.canGoToPreviousStep) {
      final previousStepIndex = state.currentStepIndex - 1;
      final previousStep = VendorFormStep.values[previousStepIndex];
      state = state.copyWith(currentStep: previousStep);
    }
  }

  void goToStep(VendorFormStep step) {
    state = state.copyWith(currentStep: step);
  }

  Future<void> submitForm() async {
    if (!state.canSubmitForm) return;

    state = state.copyWith(
      status: VendorFormStatus.loading,
      isSubmitting: true,
    );

    try {
      await createVendorUseCase.call(state.formData);

      state = state.copyWith(
        status: VendorFormStatus.success,
        isSubmitting: false,
      );
    } catch (e) {
      state = state.copyWith(
        status: VendorFormStatus.failure,
        errorMessage: e.toString(),
        isSubmitting: false,
      );
    }
  }

  void resetForm() {
    state = VendorFormState(
      formData: VendorFormEntity.empty(),
    );
  }

  void clearError() {
    state = state.copyWith(
      errorMessage: null,
      status: VendorFormStatus.initial,
    );
  }

  // Image picker methods
  Future<void> pickProfilePicture() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );

      if (pickedFile == null) return;

      final File file = File(pickedFile.path);

      // Validate file size (10MB limit)
      final sizeInBytes = await file.length();
      final sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 10) {
        state = state.copyWith(
          status: VendorFormStatus.failure,
          errorMessage: 'Profile picture exceeds 10MB limit',
        );
        return;
      }

      // Update profile picture path
      final updatedFormData = state.formData.copyWith(
        profilePicture: file.path,
      );

      state = state.copyWith(
        formData: updatedFormData,
        status: VendorFormStatus.initial,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        status: VendorFormStatus.failure,
        errorMessage: 'Failed to pick profile picture: ${e.toString()}',
      );
    }
  }

  Future<void> pickBusinessGalleryImages() async {
    try {
      // Check if we already have max images
      if (state.formData.businessGallery.length >= 7) {
        state = state.copyWith(
          status: VendorFormStatus.failure,
          errorMessage: 'Maximum 7 gallery images allowed',
        );
        return;
      }

      final ImagePicker picker = ImagePicker();
      final List<XFile> pickedFiles = await picker.pickMultiImage(
        imageQuality: 80,
      );

      if (pickedFiles.isEmpty) return;

      // Check if adding these images would exceed the limit
      final totalImages = state.formData.businessGallery.length + pickedFiles.length;
      if (totalImages > 7) {
        final allowedCount = 7 - state.formData.businessGallery.length;
        state = state.copyWith(
          status: VendorFormStatus.failure,
          errorMessage: 'Can only add $allowedCount more images (max 7 total)',
        );
        return;
      }

      state = state.copyWith(status: VendorFormStatus.loading);

      // Validate and add each image
      final List<String> newGalleryPaths = List<String>.from(state.formData.businessGallery);

      for (final XFile pickedFile in pickedFiles) {
        final File file = File(pickedFile.path);

        // Validate file size (10MB limit)
        final sizeInBytes = await file.length();
        final sizeInMB = sizeInBytes / (1024 * 1024);

        if (sizeInMB > 10) {
          state = state.copyWith(
            status: VendorFormStatus.failure,
            errorMessage: 'Image "${pickedFile.name}" exceeds 10MB limit',
          );
          return;
        }

        newGalleryPaths.add(file.path);
      }

      // Update business gallery
      final updatedFormData = state.formData.copyWith(
        businessGallery: newGalleryPaths,
      );

      state = state.copyWith(
        formData: updatedFormData,
        status: VendorFormStatus.initial,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        status: VendorFormStatus.failure,
        errorMessage: 'Failed to pick gallery images: ${e.toString()}',
      );
    }
  }

  void removeBusinessGalleryImage(String imagePath) {
    final updatedGallery = List<String>.from(state.formData.businessGallery)
      ..remove(imagePath);

    final updatedFormData = state.formData.copyWith(
      businessGallery: updatedGallery,
    );

    state = state.copyWith(
      formData: updatedFormData,
    );
  }

  // Location services
  Future<void> getCurrentLocation() async {
    try {
      state = state.copyWith(status: VendorFormStatus.loading);

      final location = await locationOnboardingService.getSavedLocation();

      if (location != null) {
        final businessAddress = {
          'street': location.address.isNotEmpty ? location.address : '',
          'city': location.city ?? '',
          'state': location.state ?? '',
          'pincode': location.postalCode ?? '',
          'landmark': '',
        };

        final updatedFormData = state.formData.copyWith(
          businessAddress: businessAddress,
        );

        state = state.copyWith(
          status: VendorFormStatus.initial,
          formData: updatedFormData,
          errorMessage: null,
        );
      } else {
        state = state.copyWith(
          status: VendorFormStatus.failure,
          errorMessage: 'Could not determine address from current location.',
        );
      }
    } catch (e) {
      state = state.copyWith(
        status: VendorFormStatus.failure,
        errorMessage: 'Failed to get current location: ${e.toString()}',
      );
    }
  }
}