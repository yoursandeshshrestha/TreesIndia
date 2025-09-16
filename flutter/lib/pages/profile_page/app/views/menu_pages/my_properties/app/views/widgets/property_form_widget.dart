import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../providers/property_providers.dart';
import '../../states/property_form_state.dart';
import '../../../data/models/property_form_data.dart';

class PropertyFormWidget extends ConsumerStatefulWidget {
  const PropertyFormWidget({super.key});

  @override
  ConsumerState<PropertyFormWidget> createState() => _PropertyFormWidgetState();
}

class _PropertyFormWidgetState extends ConsumerState<PropertyFormWidget> {
  int currentStep = 0;

  // Form data
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  String? _propertyType;
  String? _listingType;

  final _stateController = TextEditingController();
  final _cityController = TextEditingController();
  final _addressController = TextEditingController();
  final _pincodeController = TextEditingController();

  int? _bedrooms;
  int? _bathrooms;
  final _areaController = TextEditingController();
  final _floorController = TextEditingController();
  String? _age;
  String? _furnishing;

  final _salePriceController = TextEditingController();
  final _rentController = TextEditingController();
  bool _priceNegotiable = false;

  final List<String> _stepTitles = [
    'Basic Details',
    'Location Details',
    'Property Profile',
    'Photos',
    'Pricing'
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _stateController.dispose();
    _cityController.dispose();
    _addressController.dispose();
    _pincodeController.dispose();
    _areaController.dispose();
    _floorController.dispose();
    _salePriceController.dispose();
    _rentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Progress indicator
        _buildProgressIndicator(),

        // Form content
        Expanded(
          child: _buildCurrentStep(),
        ),

        // Navigation buttons
        _buildNavigationButtons(),
      ],
    );
  }

  Widget _buildCurrentStep() {
    switch (currentStep) {
      case 0:
        return _buildStep1BasicDetails();
      case 1:
        return _buildStep2LocationDetails();
      case 2:
        return _buildStep3PropertyProfile();
      case 3:
        return _buildStep4Photos();
      case 4:
        return _buildStep5Pricing();
      default:
        return _buildStep1BasicDetails();
    }
  }

  bool _isCurrentStepValid() {
    final formData = ref.read(propertyFormNotifierProvider).formData;
    switch (currentStep) {
      case 0:
        return PropertyFormValidation.isStep1Complete(formData);
      case 1:
        return PropertyFormValidation.isStep2Complete(formData);
      case 2:
        return PropertyFormValidation.isStep3Complete(formData);
      case 3:
        return PropertyFormValidation.isStep4Complete(formData);
      case 4:
        return PropertyFormValidation.isStep5Complete(formData);
      default:
        return false;
    }
  }

  void _goToNextStep() {
    if (currentStep < 4) {
      setState(() {
        currentStep++;
      });
    }
  }

  void _goToPreviousStep() {
    if (currentStep > 0) {
      setState(() {
        currentStep--;
      });
    }
  }

  Widget _buildProgressIndicator() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          Row(
            children: List.generate(5, (index) {
              return Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding:
                            const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                        child: Column(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: index <= currentStep
                                    ? AppColors.stateGreen500
                                    : AppColors.brandNeutral200,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Center(
                                child: Text(
                                  '${index + 1}',
                                  style: TextStyle(
                                    color: index <= currentStep
                                        ? AppColors.white
                                        : AppColors.brandNeutral600,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            // Text(
                            //   _stepTitles[index],
                            //   style: TextStyle(
                            //     fontSize: 10,
                            //     fontWeight: FontWeight.w500,
                            //     color: index <= currentStep
                            //         ? AppColors.brandNeutral800
                            //         : AppColors.brandNeutral500,
                            //   ),
                            //   textAlign: TextAlign.center,
                            // ),
                          ],
                        ),
                      ),
                    ),
                    if (index < 4)
                      Container(
                        height: 2,
                        width: 20,
                        color: index < currentStep
                            ? AppColors.stateGreen500
                            : AppColors.brandNeutral200,
                      ),
                  ],
                ),
              );
            }),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            _stepTitles[currentStep],
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.brandNeutral800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep1BasicDetails() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTextField(
            controller: _titleController,
            label: 'Property Title *',
            hintText: 'Enter property title',
            maxLength: 30,
            onChanged: (value) => ref
                .read(propertyFormNotifierProvider.notifier)
                .updateTitle(value),
          ),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _descriptionController,
            label: 'Description *',
            hintText: 'Describe your property',
            maxLines: 4,
            maxLength: 500,
            onChanged: (value) => ref
                .read(propertyFormNotifierProvider.notifier)
                .updateDescription(value),
          ),
          const SizedBox(height: AppSpacing.md),
          _buildRadioGroup(
            label: 'Property Type *',
            options: {'residential': 'Residential', 'commercial': 'Commercial'},
            value: _propertyType,
            onChanged: (value) {
              setState(() => _propertyType = value);
              ref
                  .read(propertyFormNotifierProvider.notifier)
                  .updatePropertyType(value);
            },
          ),
          const SizedBox(height: AppSpacing.md),
          _buildRadioGroup(
            label: 'Listing Type *',
            options: {'sale': 'For Sale', 'rent': 'For Rent'},
            value: _listingType,
            onChanged: (value) {
              setState(() => _listingType = value);
              ref
                  .read(propertyFormNotifierProvider.notifier)
                  .updateListingType(value);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStep2LocationDetails() {
    final propertyFormState = ref.watch(propertyFormNotifierProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Column(
        children: [
          _buildTextField(
            controller: _stateController,
            label: 'State *',
            hintText: 'Enter state',
            onChanged: (value) => ref
                .read(propertyFormNotifierProvider.notifier)
                .updateState(value),
          ),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _cityController,
            label: 'City *',
            hintText: 'Enter city',
            onChanged: (value) => ref
                .read(propertyFormNotifierProvider.notifier)
                .updateCity(value),
          ),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _addressController,
            label: 'Address',
            hintText: 'Enter full address',
            maxLines: 2,
            onChanged: (value) => ref
                .read(propertyFormNotifierProvider.notifier)
                .updateAddress(value.isEmpty ? null : value),
          ),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _pincodeController,
            label: 'Pincode',
            hintText: 'Enter pincode',
            keyboardType: TextInputType.number,
            onChanged: (value) => ref
                .read(propertyFormNotifierProvider.notifier)
                .updatePincode(value.isEmpty ? null : value),
          ),
          const SizedBox(height: AppSpacing.md),
          ElevatedButton.icon(
            onPressed: propertyFormState.status == PropertyFormStatus.loading
                ? null
                : () async {
                    await ref
                        .read(propertyFormNotifierProvider.notifier)
                        .getCurrentLocation();
                    final formData =
                        ref.read(propertyFormNotifierProvider).formData;

                    if (formData.state.isNotEmpty == true) {
                      _stateController.text = formData.state;
                    }
                    if (formData.city.isNotEmpty == true) {
                      _cityController.text = formData.city;
                    }
                    if (formData.address?.isNotEmpty == true) {
                      _addressController.text = formData.address!;
                    }
                    if (formData.pincode?.isNotEmpty == true) {
                      _pincodeController.text = formData.pincode!;
                    }

                    if (mounted &&
                        propertyFormState.status ==
                            PropertyFormStatus.failure &&
                        propertyFormState.errorMessage != null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                            content: Text(propertyFormState.errorMessage!)),
                      );
                    }
                  },
            icon: propertyFormState.status == PropertyFormStatus.loading
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.my_location),
            label: Text(propertyFormState.status == PropertyFormStatus.loading
                ? 'Getting Location...'
                : 'Get Current Location'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.stateGreen500,
              foregroundColor: AppColors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep3PropertyProfile() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Column(
        children: [
          _buildNumberSelector('Bedrooms', _bedrooms, (value) {
            setState(() => _bedrooms = value);
            ref
                .read(propertyFormNotifierProvider.notifier)
                .updateBedrooms(value);
          }),
          const SizedBox(height: AppSpacing.md),
          _buildNumberSelector('Bathrooms', _bathrooms, (value) {
            setState(() => _bathrooms = value);
            ref
                .read(propertyFormNotifierProvider.notifier)
                .updateBathrooms(value);
          }),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _areaController,
            label: 'Carpet Area (sq.ft)',
            hintText: 'Enter area',
            keyboardType: TextInputType.number,
            onChanged: (value) {
              final area = value.isEmpty ? null : double.tryParse(value);
              ref.read(propertyFormNotifierProvider.notifier).updateArea(area);
            },
          ),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _floorController,
            label: 'Floor Number',
            hintText: 'Enter floor',
            keyboardType: TextInputType.number,
            onChanged: (value) {
              final floor = value.isEmpty ? null : int.tryParse(value);
              ref
                  .read(propertyFormNotifierProvider.notifier)
                  .updateFloorNumber(floor);
            },
          ),
          const SizedBox(height: AppSpacing.md),
          _buildRadioGroup(
            label: 'Age',
            options: {
              'under_1_year': 'Under 1 year',
              '1_2_years': '1-2 years',
              '2_5_years': '2-5 years',
              '10_plus_years': '10+ years',
            },
            value: _age,
            onChanged: (value) {
              setState(() => _age = value);
              ref.read(propertyFormNotifierProvider.notifier).updateAge(value);
            },
          ),
          const SizedBox(height: AppSpacing.md),
          _buildRadioGroup(
            label: 'Furnishing',
            options: {
              'furnished': 'Furnished',
              'semi_furnished': 'Semi-Furnished',
              'unfurnished': 'Unfurnished',
            },
            value: _furnishing,
            onChanged: (value) {
              setState(() => _furnishing = value);
              ref
                  .read(propertyFormNotifierProvider.notifier)
                  .updateFurnishingStatus(value);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStep4Photos() {
    final propertyFormState = ref.watch(propertyFormNotifierProvider);
    final selectedImages = propertyFormState.formData.images;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              border: Border.all(
                  color: AppColors.brandNeutral300, style: BorderStyle.solid),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Property Images',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.brandNeutral700,
                      ),
                    ),
                    Text(
                      '${selectedImages.length}/7 images',
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.brandNeutral600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                const Text(
                  'Min 2 images required, Max 7 images, 10MB each',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.brandNeutral500,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                ElevatedButton.icon(
                  onPressed: propertyFormState.status ==
                          PropertyFormStatus.loading
                      ? null
                      : () async {
                          await ref
                              .read(propertyFormNotifierProvider.notifier)
                              .pickImages();

                          // Show error message if any
                          if (mounted &&
                              propertyFormState.status ==
                                  PropertyFormStatus.failure &&
                              propertyFormState.errorMessage != null) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content:
                                      Text(propertyFormState.errorMessage!)),
                            );
                          }
                        },
                  icon: propertyFormState.status == PropertyFormStatus.loading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.cloud_upload),
                  label: Text(
                      propertyFormState.status == PropertyFormStatus.loading
                          ? 'Selecting Images...'
                          : 'Choose Images'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.stateGreen500,
                    foregroundColor: AppColors.white,
                  ),
                ),
              ],
            ),
          ),
          if (selectedImages.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: AppSpacing.sm,
                mainAxisSpacing: AppSpacing.sm,
                childAspectRatio: 1,
              ),
              itemCount: selectedImages.length,
              itemBuilder: (context, index) {
                final image = selectedImages[index];
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
                          image,
                          width: double.infinity,
                          height: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: AppColors.brandNeutral100,
                              child: const Center(
                                child: Icon(
                                  Icons.error_outline,
                                  color: AppColors.error,
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
                        onTap: () {
                          ref
                              .read(propertyFormNotifierProvider.notifier)
                              .removeImage(image);
                        },
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: AppColors.error,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.close,
                            color: AppColors.white,
                            size: 16,
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStep5Pricing() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Column(
        children: [
          if (_listingType == 'sale') ...[
            _buildTextField(
              controller: _salePriceController,
              label: 'Sale Price (₹) *',
              hintText: 'Enter sale price',
              keyboardType: TextInputType.number,
              onChanged: (value) {
                final price = value.isEmpty ? null : double.tryParse(value);
                ref
                    .read(propertyFormNotifierProvider.notifier)
                    .updateSalePrice(price);
              },
            ),
          ] else if (_listingType == 'rent') ...[
            _buildTextField(
              controller: _rentController,
              label: 'Monthly Rent (₹) *',
              hintText: 'Enter monthly rent',
              keyboardType: TextInputType.number,
              onChanged: (value) {
                final rent = value.isEmpty ? null : double.tryParse(value);
                ref
                    .read(propertyFormNotifierProvider.notifier)
                    .updateMonthlyRent(rent);
              },
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.brandNeutral100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Please select a listing type in step 1 to see pricing options',
                style: TextStyle(
                  color: AppColors.brandNeutral600,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.md),
          CheckboxListTile(
            title: const Text('Price Negotiable'),
            value: _priceNegotiable,
            onChanged: (value) {
              final negotiable = value ?? false;
              setState(() => _priceNegotiable = negotiable);
              ref
                  .read(propertyFormNotifierProvider.notifier)
                  .updatePriceNegotiable(negotiable);
            },
            activeColor: AppColors.stateGreen500,
            contentPadding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hintText,
    int maxLines = 1,
    int? maxLength,
    TextInputType? keyboardType,
    void Function(String)? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.brandNeutral800,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          maxLength: maxLength,
          keyboardType: keyboardType,
          onChanged: onChanged,
          decoration: InputDecoration(
            hintText: hintText,
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
            contentPadding: const EdgeInsets.all(AppSpacing.md),
            counterText: '',
          ),
        ),
      ],
    );
  }

  Widget _buildRadioGroup({
    required String label,
    required Map<String, String> options,
    required String? value,
    required Function(String?) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.brandNeutral800,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        ...options.entries.map((entry) {
          return RadioListTile<String>(
            title: Text(entry.value),
            value: entry.key,
            groupValue: value,
            onChanged: onChanged,
            activeColor: AppColors.stateGreen500,
            contentPadding: EdgeInsets.zero,
          );
        }),
      ],
    );
  }

  Widget _buildNumberSelector(
      String label, int? value, Function(int?) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.brandNeutral800,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            ...([1, 2, 3, 4].map((num) {
              return Padding(
                padding: const EdgeInsets.only(right: AppSpacing.sm),
                child: GestureDetector(
                  onTap: () => onChanged(num),
                  child: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: value == num
                          ? AppColors.stateGreen500
                          : AppColors.white,
                      border: Border.all(
                        color: value == num
                            ? AppColors.stateGreen500
                            : AppColors.brandNeutral300,
                      ),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Center(
                      child: Text(
                        num.toString(),
                        style: TextStyle(
                          color: value == num
                              ? AppColors.white
                              : AppColors.brandNeutral700,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            })),
          ],
        ),
      ],
    );
  }

  Widget _buildNavigationButtons() {
    final isCurrentStepValid = _isCurrentStepValid();

    return Container(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: AppColors.brandNeutral200),
        ),
      ),
      child: Row(
        children: [
          if (currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: _goToPreviousStep,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF055c3a)),
                  foregroundColor: const Color(0xFF055c3a),
                  minimumSize: const Size(double.infinity, 48),
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('Previous'),
              ),
            ),
          if (currentStep > 0) const SizedBox(width: AppSpacing.md),
          if (currentStep < 4)
            Expanded(
              child: ElevatedButton(
                onPressed: isCurrentStepValid ? _goToNextStep : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF055c3a),
                  foregroundColor: AppColors.white,
                  disabledBackgroundColor: AppColors.brandNeutral300,
                  disabledForegroundColor: AppColors.brandNeutral500,
                  minimumSize: const Size(double.infinity, 48),
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                    isCurrentStepValid ? 'Continue' : 'Complete this step'),
              ),
            ),
          if (currentStep == 4)
            Expanded(
              child: Consumer(
                builder: (context, ref, child) {
                  final propertyFormState =
                      ref.watch(propertyFormNotifierProvider);

                  return ElevatedButton(
                    onPressed: propertyFormState.isSubmitting
                        ? null
                        : () async {
                            await ref
                                .read(propertyFormNotifierProvider.notifier)
                                .submitForm();
                            final state =
                                ref.read(propertyFormNotifierProvider);

                            if (mounted) {
                              if (state.status == PropertyFormStatus.success) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                      content: Text(
                                          'Property submitted successfully!')),
                                );
                                Navigator.of(context).pop();
                              } else if (state.status ==
                                      PropertyFormStatus.failure &&
                                  state.errorMessage != null) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(state.errorMessage!)),
                                );
                              }
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF055c3a),
                      foregroundColor: AppColors.white,
                      minimumSize: const Size(double.infinity, 48),
                      padding:
                          const EdgeInsets.symmetric(vertical: AppSpacing.md),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: propertyFormState.isSubmitting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Submit Property'),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
