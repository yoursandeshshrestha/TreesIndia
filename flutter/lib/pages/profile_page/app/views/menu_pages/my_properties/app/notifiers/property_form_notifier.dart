import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:trees_india/commons/utils/services/location_onboarding_service.dart';
import '../../data/models/property_form_data.dart';
import '../states/property_form_state.dart';
import '../../domain/usecases/create_property_usecase.dart';

class PropertyFormNotifier extends StateNotifier<PropertyFormState> {
  final CreatePropertyUseCase createPropertyUseCase;
  final LocationOnboardingService locationOnboardingService;

  PropertyFormNotifier(
      {required this.createPropertyUseCase,
      required this.locationOnboardingService})
      : super(PropertyFormState(formData: PropertyFormData()));

  // Form data updates
  void updateTitle(String title) {
    final updatedData = state.formData.copyWith(title: title);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateDescription(String description) {
    final updatedData = state.formData.copyWith(description: description);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updatePropertyType(String? propertyType) {
    final updatedData = state.formData.copyWith(propertyType: propertyType);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateListingType(String? listingType) {
    final updatedData = state.formData.copyWith(listingType: listingType);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateState(String stateValue) {
    final updatedData = state.formData.copyWith(state: stateValue);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateCity(String city) {
    final updatedData = state.formData.copyWith(city: city);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateAddress(String? address) {
    final updatedData = state.formData.copyWith(address: address);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updatePincode(String? pincode) {
    final updatedData = state.formData.copyWith(pincode: pincode);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateBedrooms(int? bedrooms) {
    final updatedData = state.formData.copyWith(bedrooms: bedrooms);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateBathrooms(int? bathrooms) {
    final updatedData = state.formData.copyWith(bathrooms: bathrooms);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateArea(double? area) {
    final updatedData = state.formData.copyWith(area: area);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateFloorNumber(int? floorNumber) {
    final updatedData = state.formData.copyWith(floorNumber: floorNumber);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateAge(String? age) {
    final updatedData = state.formData.copyWith(age: age);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateFurnishingStatus(String? furnishingStatus) {
    final updatedData =
        state.formData.copyWith(furnishingStatus: furnishingStatus);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateImages(List<File> images) {
    final updatedData = state.formData.copyWith(images: images);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void addImage(File image) {
    final newImages = List<File>.from(state.formData.images)..add(image);
    updateImages(newImages);
  }

  void removeImage(File image) {
    final newImages = List<File>.from(state.formData.images)..remove(image);
    updateImages(newImages);
  }

  Future<void> pickImages() async {
    try {
      // Check if we already have max images
      if (state.formData.images.length >= 7) {
        state = state.copyWith(
          status: PropertyFormStatus.failure,
          errorMessage: 'Maximum 7 images allowed',
        );
        return;
      }

      final ImagePicker picker = ImagePicker();
      final List<XFile> pickedFiles = await picker.pickMultiImage(
        imageQuality: 80,
      );

      if (pickedFiles.isEmpty) return;

      // Check if adding these images would exceed the limit
      final totalImages = state.formData.images.length + pickedFiles.length;
      if (totalImages > 7) {
        final allowedCount = 7 - state.formData.images.length;
        state = state.copyWith(
          status: PropertyFormStatus.failure,
          errorMessage: 'Can only add $allowedCount more images (max 7 total)',
        );
        return;
      }

      state = state.copyWith(status: PropertyFormStatus.loading);

      // Convert XFile to File and validate
      for (final XFile pickedFile in pickedFiles) {
        final File file = File(pickedFile.path);

        // Validate file size (10MB limit)
        final sizeInBytes = await file.length();
        final sizeInMB = sizeInBytes / (1024 * 1024);

        if (sizeInMB > 10) {
          state = state.copyWith(
            status: PropertyFormStatus.failure,
            errorMessage: 'Image "${pickedFile.name}" exceeds 10MB limit',
          );
          return;
        }

        // Add the image using existing method
        addImage(file);
      }

      state = state.copyWith(
        status: PropertyFormStatus.success,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        status: PropertyFormStatus.failure,
        errorMessage: 'Failed to pick images: ${e.toString()}',
      );
    }
  }

  void updateSalePrice(double? salePrice) {
    final updatedData = state.formData.copyWith(
      salePrice: salePrice,
      setSalePriceToNull: salePrice == null,
    );
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updateMonthlyRent(double? monthlyRent) {
    final updatedData = state.formData.copyWith(
      monthlyRent: monthlyRent,
      setMonthlyRentToNull: monthlyRent == null,
    );
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  void updatePriceNegotiable(bool priceNegotiable) {
    final updatedData =
        state.formData.copyWith(priceNegotiable: priceNegotiable);
    state = state.copyWith(formData: updatedData);
    _updateStepCompletion();
  }

  // Step navigation
  void goToStep(PropertyFormStep step) {
    if (_canNavigateToStep(step)) {
      state = state.copyWith(currentStep: step);
    }
  }

  void goToNextStep() {
    if (state.canGoToNextStep) {
      final nextStepIndex = state.currentStepIndex + 1;
      final nextStep = PropertyFormStep.values[nextStepIndex];
      _markCurrentStepComplete();
      state = state.copyWith(currentStep: nextStep);
    }
  }

  void goToPreviousStep() {
    if (state.canGoToPreviousStep) {
      final previousStepIndex = state.currentStepIndex - 1;
      final previousStep = PropertyFormStep.values[previousStepIndex];
      state = state.copyWith(currentStep: previousStep);
    }
  }

  // Location services
  Future<void> getCurrentLocation() async {
    try {
      state = state.copyWith(status: PropertyFormStatus.loading);

      final location = await locationOnboardingService.getSavedLocation();

      if (location != null) {
        final updatedData = state.formData.copyWith(
          address: location.address.isNotEmpty ? location.address : null,
          city: location.city ?? '',
          state: location.state ?? '',
          pincode: location.postalCode,
        );

        state = state.copyWith(
          status: PropertyFormStatus.success,
          formData: updatedData,
          errorMessage: null,
        );
        _updateStepCompletion();
      } else {
        state = state.copyWith(
          status: PropertyFormStatus.failure,
          errorMessage: 'Could not determine address from current location.',
        );
      }
    } catch (e) {
      state = state.copyWith(
        status: PropertyFormStatus.failure,
        errorMessage: 'Failed to get current location: ${e.toString()}',
      );
    }
  }

  // Form submission
  Future<void> submitForm() async {
    if (!state.canSubmitForm) return;

    try {
      state = state.copyWith(
        status: PropertyFormStatus.loading,
        isSubmitting: true,
      );

      await createPropertyUseCase.execute(state.formData);

      state = state.copyWith(
        status: PropertyFormStatus.success,
        isSubmitting: false,
      );
    } catch (e) {
      state = state.copyWith(
        status: PropertyFormStatus.failure,
        errorMessage: e.toString(),
        isSubmitting: false,
      );
    }
  }

  // Reset form
  void resetForm() {
    state = PropertyFormState(formData: PropertyFormData());
  }

  // Clear error
  void clearError() {
    state = state.copyWith(
      status: PropertyFormStatus.initial,
      errorMessage: null,
    );
  }

  // Private helper methods
  void _updateStepCompletion() {
    final completion = Map<PropertyFormStep, bool>.from(state.stepCompletion);

    completion[PropertyFormStep.basicDetails] =
        PropertyFormValidation.isStep1Complete(state.formData);
    completion[PropertyFormStep.locationDetails] =
        PropertyFormValidation.isStep2Complete(state.formData);
    completion[PropertyFormStep.propertyProfile] =
        PropertyFormValidation.isStep3Complete(state.formData);
    completion[PropertyFormStep.photos] =
        PropertyFormValidation.isStep4Complete(state.formData);
    completion[PropertyFormStep.pricing] =
        PropertyFormValidation.isStep5Complete(state.formData);

    state = state.copyWith(stepCompletion: completion);
  }

  void _markCurrentStepComplete() {
    final completion = Map<PropertyFormStep, bool>.from(state.stepCompletion);
    completion[state.currentStep] = true;
    state = state.copyWith(stepCompletion: completion);
  }

  bool _canNavigateToStep(PropertyFormStep step) {
    final stepIndex = PropertyFormStep.values.indexOf(step);
    final currentIndex = state.currentStepIndex;

    // Can always go back to previous steps
    if (stepIndex <= currentIndex) {
      return true;
    }

    // Can only go forward if all previous steps are complete
    for (int i = 0; i < stepIndex; i++) {
      final checkStep = PropertyFormStep.values[i];
      if (!state.isStepCompleted(checkStep) && !_isStepValid(checkStep)) {
        return false;
      }
    }

    return true;
  }

  bool _isStepValid(PropertyFormStep step) {
    switch (step) {
      case PropertyFormStep.basicDetails:
        return PropertyFormValidation.isStep1Complete(state.formData);
      case PropertyFormStep.locationDetails:
        return PropertyFormValidation.isStep2Complete(state.formData);
      case PropertyFormStep.propertyProfile:
        return PropertyFormValidation.isStep3Complete(state.formData);
      case PropertyFormStep.photos:
        return PropertyFormValidation.isStep4Complete(state.formData);
      case PropertyFormStep.pricing:
        return PropertyFormValidation.isStep5Complete(state.formData);
    }
  }
}
