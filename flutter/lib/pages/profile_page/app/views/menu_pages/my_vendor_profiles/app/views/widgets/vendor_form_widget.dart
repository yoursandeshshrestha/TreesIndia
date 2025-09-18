import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';
import 'package:trees_india/commons/theming/text_styles.dart';

import '../../providers/vendor_providers.dart';
import '../../states/vendor_form_state.dart';
import 'form_components/vendor_form_step_indicator.dart';

class VendorFormWidget extends ConsumerStatefulWidget {
  const VendorFormWidget({super.key});

  @override
  ConsumerState<VendorFormWidget> createState() => _VendorFormWidgetState();
}

class _VendorFormWidgetState extends ConsumerState<VendorFormWidget> {
  // Step 1: Business Details
  final _vendorNameController = TextEditingController();
  final _businessDescriptionController = TextEditingController();

  // Step 2: Contact Details
  final _contactPersonController = TextEditingController();
  final _contactPhoneController = TextEditingController();
  final _contactEmailController = TextEditingController();

  // Step 3: Business Profile
  String? _businessType;
  final _yearsInBusinessController = TextEditingController();
  final List<String> _selectedServices = [];
  final _customServiceController = TextEditingController();

  // Step 4: Location Details
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _landmarkController = TextEditingController();


  final List<String> _businessTypes = [
    'Individual',
    'Partnership',
    'Company',
    'LLP',
    'Private Limited',
    'Public Limited',
    'Other',
  ];

  final List<String> _availableServices = [
    'Cement Supply',
    'Steel & Iron Rods',
    'Bricks & Blocks',
    'Paint & Chemicals',
    'Tiles & Marble',
    'Electrical Materials',
    'Hardware & Fittings',
    'Sand & Aggregates',
    'Plumbing Supplies',
    'Construction Tools',
  ];

  @override
  void dispose() {
    _vendorNameController.dispose();
    _businessDescriptionController.dispose();
    _contactPersonController.dispose();
    _contactPhoneController.dispose();
    _contactEmailController.dispose();
    _yearsInBusinessController.dispose();
    _customServiceController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _landmarkController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(vendorFormNotifierProvider);

    // Listen for error states and show snackbars
    ref.listen<VendorFormState>(vendorFormNotifierProvider, (previous, current) {
      if (current.status == VendorFormStatus.failure && current.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(current.errorMessage!),
            backgroundColor: AppColors.stateRed600,
          ),
        );
        // Clear the error after showing
        ref.read(vendorFormNotifierProvider.notifier).clearError();
      }
    });

    return Column(
      children: [
        // Progress indicator
        VendorFormStepIndicator(
          currentStep: formState.currentStepIndex,
          totalSteps: formState.totalSteps,
          stepCompletion: formState.stepCompletion,
        ),

        // Form content
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: _buildCurrentStepContent(formState),
          ),
        ),

        // Navigation buttons
        _buildNavigationButtons(formState),
      ],
    );
  }

  Widget _buildCurrentStepContent(VendorFormState formState) {
    switch (formState.currentStep) {
      case VendorFormStep.businessDetails:
        return _buildStep1BusinessDetails();
      case VendorFormStep.contactDetails:
        return _buildStep2ContactDetails();
      case VendorFormStep.businessProfile:
        return _buildStep3BusinessProfile();
      case VendorFormStep.locationDetails:
        return _buildStep4LocationDetails();
      case VendorFormStep.photos:
        return _buildStep5Photos();
    }
  }

  Widget _buildStep1BusinessDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Business Details',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Enter your business name and description',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Business Name
        _buildTextField(
          controller: _vendorNameController,
          label: 'Business Name',
          hint: 'Enter your business name',
          isRequired: true,
          onChanged: (value) => _updateBusinessDetails(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Business Description
        _buildTextField(
          controller: _businessDescriptionController,
          label: 'Business Description',
          hint: 'Describe your business (optional)',
          maxLines: 3,
          onChanged: (value) => _updateBusinessDetails(),
        ),
      ],
    );
  }

  Widget _buildStep2ContactDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Contact Information',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Provide contact details for your business',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Contact Person Name
        _buildTextField(
          controller: _contactPersonController,
          label: 'Contact Person Name',
          hint: 'Enter contact person name',
          isRequired: true,
          onChanged: (value) => _updateContactDetails(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Contact Phone
        _buildTextField(
          controller: _contactPhoneController,
          label: 'Contact Phone',
          hint: 'Enter contact phone number',
          isRequired: true,
          keyboardType: TextInputType.phone,
          onChanged: (value) => _updateContactDetails(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Contact Email
        _buildTextField(
          controller: _contactEmailController,
          label: 'Contact Email',
          hint: 'Enter contact email (optional)',
          keyboardType: TextInputType.emailAddress,
          onChanged: (value) => _updateContactDetails(),
        ),
      ],
    );
  }

  Widget _buildStep3BusinessProfile() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Business Profile',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Tell us about your business type and services',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Business Type
        B3Bold(
          text: 'Business Type *',
          color: AppColors.brandNeutral800,
        ),
        const SizedBox(height: AppSpacing.sm),
        _buildBusinessTypeSelector(),

        const SizedBox(height: AppSpacing.lg),

        // Years in Business
        _buildTextField(
          controller: _yearsInBusinessController,
          label: 'Years in Business',
          hint: 'Enter years of experience (optional)',
          keyboardType: TextInputType.number,
          onChanged: (value) => _updateBusinessProfile(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Services Offered
        B3Bold(
          text: 'What We Sell *',
          color: AppColors.brandNeutral800,
        ),
        const SizedBox(height: AppSpacing.sm),
        B4Regular(
          text: 'Select from common construction materials:',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.sm),
        _buildServicesSelector(),

        const SizedBox(height: AppSpacing.md),

        // Custom Service Input
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _customServiceController,
                label: 'Custom Product/Service',
                hint: 'e.g., Custom Furniture, Solar Panels',
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            IconButton(
              onPressed: _addCustomService,
              icon: const Icon(
                Icons.add_circle,
                color: AppColors.stateGreen600,
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.md),

        // Selected Services
        if (_selectedServices.isNotEmpty) ...[
          B4Bold(
            text: 'Selected Products/Services:',
            color: AppColors.brandNeutral800,
          ),
          const SizedBox(height: AppSpacing.sm),
          _buildSelectedServices(),
        ],

      ],
    );
  }

  Widget _buildStep4LocationDetails() {
    final vendorFormState = ref.watch(vendorFormNotifierProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Location Details',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Where is your business located?',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Get Current Location Button
        ElevatedButton.icon(
          onPressed: vendorFormState.status == VendorFormStatus.loading
              ? null
              : () async {
                  await ref
                      .read(vendorFormNotifierProvider.notifier)
                      .getCurrentLocation();
                  final formData =
                      ref.read(vendorFormNotifierProvider).formData;

                  final address = formData.businessAddress;
                  if (address['state']?.isNotEmpty == true) {
                    _stateController.text = address['state'];
                  }
                  if (address['city']?.isNotEmpty == true) {
                    _cityController.text = address['city'];
                  }
                  if (address['street']?.isNotEmpty == true) {
                    _streetController.text = address['street'];
                  }
                  if (address['pincode']?.isNotEmpty == true) {
                    _pincodeController.text = address['pincode'];
                  }

                  if (mounted &&
                      vendorFormState.status ==
                          VendorFormStatus.failure &&
                      vendorFormState.errorMessage != null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                          content: Text(vendorFormState.errorMessage!)),
                    );
                  }
                },
          icon: vendorFormState.status == VendorFormStatus.loading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.my_location),
          label: Text(vendorFormState.status == VendorFormStatus.loading
              ? 'Getting Location...'
              : 'Get Current Location'),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.stateGreen500,
            foregroundColor: AppColors.white,
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Street Address
        _buildTextField(
          controller: _streetController,
          label: 'Street Address',
          hint: 'Enter complete street address',
          isRequired: true,
          onChanged: (value) => _updateLocationDetails(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // City and State
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _cityController,
                label: 'City',
                hint: 'Enter city',
                isRequired: true,
                onChanged: (value) => _updateLocationDetails(),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _buildTextField(
                controller: _stateController,
                label: 'State',
                hint: 'Enter state',
                isRequired: true,
                onChanged: (value) => _updateLocationDetails(),
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Pincode and Landmark
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _pincodeController,
                label: 'Pincode',
                hint: 'Enter pincode',
                isRequired: true,
                keyboardType: TextInputType.number,
                onChanged: (value) => _updateLocationDetails(),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _buildTextField(
                controller: _landmarkController,
                label: 'Landmark',
                hint: 'Nearby landmark (optional)',
                onChanged: (value) => _updateLocationDetails(),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStep5Photos() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Photos & Gallery',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Upload your profile picture and business gallery',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Profile Picture
        B3Bold(
          text: 'Profile Picture',
          color: AppColors.brandNeutral800,
        ),
        const SizedBox(height: AppSpacing.sm),
        B4Regular(
          text: 'Upload a profile picture for your business (optional)',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.sm),
        _buildProfilePictureUpload(),

        const SizedBox(height: AppSpacing.xl),

        // Business Gallery
        B3Bold(
          text: 'Business Gallery',
          color: AppColors.brandNeutral800,
        ),
        const SizedBox(height: AppSpacing.sm),
        B4Regular(
          text:
              'Upload photos of your business (minimum 2, max 7 images, 10MB each)',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.sm),

        // Show upload widget only when no images are selected
        if (ref.watch(vendorFormNotifierProvider).formData.businessGallery.isEmpty)
          _buildBusinessGalleryUpload(),

        // Display selected gallery images with remove option
        if (ref.watch(vendorFormNotifierProvider).formData.businessGallery.isNotEmpty) ...[
          _buildSelectedGalleryImages(),
          const SizedBox(height: AppSpacing.md),

          // Select more button when images are already selected
          if (ref.watch(vendorFormNotifierProvider).formData.businessGallery.length < 7)
            SolidButtonWidget(
              label: 'Select More Images (${ref.watch(vendorFormNotifierProvider).formData.businessGallery.length}/7)',
              backgroundColor: AppColors.stateGreen600,
              onPressed: _selectBusinessGalleryImages,
            ),
        ],

        if (ref.watch(vendorFormNotifierProvider).formData.businessGallery.length < 2) ...[
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Please upload at least 2 business gallery photos',
            style: TextStyle(
              color: AppColors.stateRed600,
              fontSize: 12,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    bool isRequired = false,
    int maxLines = 1,
    TextInputType? keyboardType,
    Function(String)? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            B3Bold(
              text: label,
              color: AppColors.brandNeutral800,
            ),
            if (isRequired)
              const Text(
                ' *',
                style: TextStyle(color: AppColors.stateRed600),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          onChanged: onChanged,
          style: TextStyles.b3Medium(color: AppColors.brandNeutral900),
          onTapOutside: (_) => FocusScope.of(context).unfocus(),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyles.b3Medium(color: AppColors.brandNeutral400),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.brandNeutral200),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.brandNeutral200),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.stateGreen500),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBusinessTypeSelector() {
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: _businessTypes.map((type) {
        final isSelected = _businessType == type.toLowerCase();
        return GestureDetector(
          onTap: () {
            setState(() {
              _businessType = type.toLowerCase();
            });
            _updateBusinessProfile();
          },
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.stateGreen600 : Colors.white,
              border: Border.all(
                color: isSelected
                    ? AppColors.stateGreen600
                    : AppColors.brandNeutral300,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: B4Regular(
              text: type,
              color: isSelected ? Colors.white : AppColors.brandNeutral700,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildServicesSelector() {
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: _availableServices.map((service) {
        final isSelected = _selectedServices.contains(service);
        return GestureDetector(
          onTap: () => _toggleService(service),
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.stateGreen600 : Colors.white,
              border: Border.all(
                color: isSelected
                    ? AppColors.stateGreen600
                    : AppColors.brandNeutral300,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: B4Regular(
              text: service,
              color: isSelected ? Colors.white : AppColors.brandNeutral700,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSelectedServices() {
    return Wrap(
      spacing: AppSpacing.sm,
      runSpacing: AppSpacing.sm,
      children: _selectedServices.map((service) {
        return Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm,
            vertical: 4,
          ),
          decoration: BoxDecoration(
            color: AppColors.brandPrimary50,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              B4Regular(
                text: service,
                color: AppColors.brandPrimary700,
              ),
              const SizedBox(width: 4),
              GestureDetector(
                onTap: () => _removeService(service),
                child: const Icon(
                  Icons.close,
                  size: 16,
                  color: AppColors.brandPrimary700,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSelectedGalleryImages() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: AppSpacing.sm,
        mainAxisSpacing: AppSpacing.sm,
        childAspectRatio: 1,
      ),
      itemCount: ref.watch(vendorFormNotifierProvider).formData.businessGallery.length,
      itemBuilder: (context, index) {
        final imagePath = ref.watch(vendorFormNotifierProvider).formData.businessGallery[index];
        return Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: AppColors.brandNeutral300,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.file(
                  File(imagePath),
                  width: double.infinity,
                  height: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: AppColors.brandNeutral100,
                      child: const Center(
                        child: Icon(
                          Icons.error_outline,
                          color: AppColors.stateRed600,
                          size: 32,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            Positioned(
              top: 4,
              right: 4,
              child: GestureDetector(
                onTap: () => _removeGalleryImage(imagePath),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: AppColors.stateRed600,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.close,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildProfilePictureUpload() {
    final profilePicture = ref.watch(vendorFormNotifierProvider).formData.profilePicture;

    if (profilePicture.isNotEmpty) {
      return Column(
        children: [
          Container(
            width: double.infinity,
            height: 200,
            decoration: BoxDecoration(
              border: Border.all(
                color: AppColors.brandNeutral300,
                style: BorderStyle.solid,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.file(
                File(profilePicture),
                width: double.infinity,
                height: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: AppColors.brandNeutral100,
                    child: const Center(
                      child: Icon(
                        Icons.error_outline,
                        color: AppColors.stateRed600,
                        size: 32,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: OutlinedButtonWidget(
                  label: 'Remove Picture',
                  labelColor: AppColors.stateRed600,
                  borderColor: AppColors.stateRed600,
                  onPressed: _removeProfilePicture,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: SolidButtonWidget(
                  label: 'Choose Another',
                  backgroundColor: AppColors.stateGreen600,
                  onPressed: _selectProfilePicture,
                ),
              ),
            ],
          ),
        ],
      );
    }

    return GestureDetector(
      onTap: _selectProfilePicture,
      child: Container(
        width: double.infinity,
        height: 120,
        decoration: BoxDecoration(
          border: Border.all(
            color: AppColors.brandNeutral300,
            style: BorderStyle.solid,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.upload,
              size: 32,
              color: AppColors.brandNeutral500,
            ),
            const SizedBox(height: AppSpacing.sm),
            B3Regular(
              text: 'Upload Profile Picture',
              color: AppColors.brandNeutral600,
            ),
            B4Regular(
              text: 'PNG, JPG, JPEG up to 10MB',
              color: AppColors.brandNeutral500,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBusinessGalleryUpload() {
    return GestureDetector(
      onTap: _selectBusinessGalleryImages,
      child: Container(
        width: double.infinity,
        height: 150,
        decoration: BoxDecoration(
          border: Border.all(
            color: AppColors.brandNeutral300,
            style: BorderStyle.solid,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.cloud_upload_outlined,
              size: 40,
              color: AppColors.brandNeutral500,
            ),
            const SizedBox(height: AppSpacing.sm),
            B3Regular(
              text: 'Upload Business Photos',
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(height: 4),
            B4Regular(
              text: 'Click to browse or drag and drop images here',
              color: AppColors.brandNeutral500,
            ),
            const SizedBox(height: 4),
            B4Regular(
              text: 'PNG, JPG, JPEG up to 10MB each',
              color: AppColors.brandNeutral500,
            ),
            if (ref.watch(vendorFormNotifierProvider).formData.businessGallery.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.sm),
              B4Bold(
                text: '${ref.watch(vendorFormNotifierProvider).formData.businessGallery.length} of 7 photos uploaded',
                color: AppColors.stateGreen600,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildNavigationButtons(VendorFormState formState) {
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
          if (formState.canGoToPreviousStep)
            Expanded(
              child: OutlinedButtonWidget(
                label: 'Previous',
                labelColor: AppColors.brandNeutral700,
                borderColor: AppColors.brandNeutral700,
                onPressed: () {
                  ref
                      .read(vendorFormNotifierProvider.notifier)
                      .goToPreviousStep();
                },
              ),
            ),
          if (formState.canGoToPreviousStep)
            const SizedBox(width: AppSpacing.md),
          Expanded(
            child: SolidButtonWidget(
              label: formState.isLastStep ? 'Create Profile' : 'Continue',
              backgroundColor: AppColors.stateGreen600,
              isLoading: formState.isSubmitting,
              onPressed: formState.isLastStep
                  ? (formState.canSubmitForm
                      ? () => ref
                          .read(vendorFormNotifierProvider.notifier)
                          .submitForm()
                      : null)
                  : (formState.canGoToNextStep
                      ? () => ref
                          .read(vendorFormNotifierProvider.notifier)
                          .goToNextStep()
                      : null),
            ),
          ),
        ],
      ),
    );
  }

  void _updateBusinessDetails() {
    ref.read(vendorFormNotifierProvider.notifier).updateBusinessDetails(
          vendorName: _vendorNameController.text,
          businessDescription: _businessDescriptionController.text,
        );
  }

  void _updateContactDetails() {
    ref.read(vendorFormNotifierProvider.notifier).updateContactDetails(
          contactPersonName: _contactPersonController.text,
          contactPersonPhone: _contactPhoneController.text,
          contactPersonEmail: _contactEmailController.text,
        );
  }

  void _updateBusinessProfile() {
    ref.read(vendorFormNotifierProvider.notifier).updateBusinessProfile(
          businessType: _businessType,
          yearsInBusiness: int.tryParse(_yearsInBusinessController.text) ?? 0,
          servicesOffered: _selectedServices,
        );
  }

  void _updateLocationDetails() {
    final businessAddress = {
      'street': _streetController.text,
      'city': _cityController.text,
      'state': _stateController.text,
      'pincode': _pincodeController.text,
      'landmark': _landmarkController.text,
    };

    ref
        .read(vendorFormNotifierProvider.notifier)
        .updateLocationDetails(businessAddress);
  }


  void _toggleService(String service) {
    setState(() {
      if (_selectedServices.contains(service)) {
        _selectedServices.remove(service);
      } else {
        _selectedServices.add(service);
      }
    });
    _updateBusinessProfile();
  }

  void _removeService(String service) {
    setState(() {
      _selectedServices.remove(service);
    });
    _updateBusinessProfile();
  }

  void _addCustomService() {
    final service = _customServiceController.text.trim();
    if (service.isNotEmpty && !_selectedServices.contains(service)) {
      setState(() {
        _selectedServices.add(service);
        _customServiceController.clear();
      });
      _updateBusinessProfile();
    }
  }

  void _removeGalleryImage(String imagePath) {
    ref.read(vendorFormNotifierProvider.notifier).removeBusinessGalleryImage(imagePath);
  }

  void _selectProfilePicture() async {
    await ref.read(vendorFormNotifierProvider.notifier).pickProfilePicture();
  }

  void _selectBusinessGalleryImages() async {
    await ref.read(vendorFormNotifierProvider.notifier).pickBusinessGalleryImages();
  }

  void _removeProfilePicture() {
    ref.read(vendorFormNotifierProvider.notifier).updatePhotos(
      profilePicture: '',
      businessGallery: ref.read(vendorFormNotifierProvider).formData.businessGallery,
    );
  }
}
