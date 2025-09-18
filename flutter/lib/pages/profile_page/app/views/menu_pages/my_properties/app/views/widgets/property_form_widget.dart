import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/success_snackbar_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/theming/text_styles.dart';
import '../../providers/property_providers.dart';
import '../../states/property_form_state.dart';
import 'form_components/form_step_indicator.dart';

class PropertyFormWidget extends ConsumerStatefulWidget {
  const PropertyFormWidget({super.key});

  @override
  ConsumerState<PropertyFormWidget> createState() => _PropertyFormWidgetState();
}

class _PropertyFormWidgetState extends ConsumerState<PropertyFormWidget> {
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
    final propertyFormState = ref.watch(propertyFormNotifierProvider);

    return Column(
      children: [
        // Progress indicator
        FormStepIndicator(
          currentStep: propertyFormState.currentStepIndex,
          totalSteps: propertyFormState.totalSteps,
          stepCompletion: propertyFormState.stepCompletion,
        ),

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
    final propertyFormState = ref.watch(propertyFormNotifierProvider);
    switch (propertyFormState.currentStep) {
      case PropertyFormStep.basicDetails:
        return _buildStep1BasicDetails();
      case PropertyFormStep.locationDetails:
        return _buildStep2LocationDetails();
      case PropertyFormStep.propertyProfile:
        return _buildStep3PropertyProfile();
      case PropertyFormStep.photos:
        return _buildStep4Photos();
      case PropertyFormStep.pricing:
        return _buildStep5Pricing();
    }
  }

  void _goToNextStep() {
    ref.read(propertyFormNotifierProvider.notifier).goToNextStep();
  }

  void _goToPreviousStep() {
    ref.read(propertyFormNotifierProvider.notifier).goToPreviousStep();
  }

  Widget _buildStep1BasicDetails() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
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
      padding: const EdgeInsets.all(AppSpacing.lg),
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
      padding: const EdgeInsets.all(AppSpacing.lg),
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
      padding: const EdgeInsets.all(AppSpacing.lg),
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
    final formState = ref.watch(propertyFormNotifierProvider);
    final listingType = formState.formData.listingType;
    final priceNegotiable = formState.formData.priceNegotiable;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          if (listingType == 'sale') ...[
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
          ] else if (listingType == 'rent') ...[
            _buildTextField(
              controller: _rentController,
              label: 'Rent per month (₹)*',
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

          CheckboxListTile(
            title: const Text('Price Negotiable'),
            value: priceNegotiable,
            onChanged: (value) {
              final negotiable = value ?? false;
              ref
                  .read(propertyFormNotifierProvider.notifier)
                  .updatePriceNegotiable(negotiable);
            },
            activeColor: Colors.transparent,
            contentPadding: EdgeInsets.zero,
          ),
          const SizedBox(height: AppSpacing.md),
          // Price Summary Card
          _buildPriceSummaryCard(),
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
          style: TextStyles.b3Medium(color: AppColors.brandNeutral900),
          onTapOutside: (_) => FocusScope.of(context).unfocus(),
          decoration: InputDecoration(
            hintText: hintText,
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
    final propertyFormState = ref.watch(propertyFormNotifierProvider);
    final isCurrentStepValid = propertyFormState.isCurrentStepValid;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: AppColors.brandNeutral200),
        ),
      ),
      child: Row(
        children: [
          if (propertyFormState.canGoToPreviousStep)
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
          if (propertyFormState.canGoToPreviousStep)
            const SizedBox(width: AppSpacing.md),
          if (!propertyFormState.isLastStep)
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
          if (propertyFormState.isLastStep)
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
                                  const SuccessSnackbarWidget(
                                          message:
                                              'Property submitted successfully!')
                                      .createSnackBar(),
                                );
                                // Refresh the properties list
                                ref
                                    .read(myPropertiesNotifierProvider.notifier)
                                    .loadProperties(refresh: true);
                                Navigator.of(context).pop();
                              } else if (state.status ==
                                      PropertyFormStatus.failure &&
                                  state.errorMessage != null) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  ErrorSnackbarWidget(
                                          message: state.errorMessage!)
                                      .createSnackBar(),
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
                        ? SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: const Color(0xFF055c3a)
                                  .withValues(alpha: 0.8),
                            ),
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

  Widget _buildPriceSummaryCard() {
    double? currentPrice;
    String? priceLabel;
    final formState = ref.watch(propertyFormNotifierProvider);
    final salePrice = formState.formData.salePrice;
    final monthlyRent = formState.formData.monthlyRent;
    final listingType = formState.formData.listingType;
    final priceNegotiable = formState.formData.priceNegotiable;

    // Determine current price and label based on listing type
    if (listingType == 'sale' && salePrice != null) {
      currentPrice = salePrice;
      priceLabel = 'Sale Price';
    } else if (listingType == 'rent' && monthlyRent != null) {
      currentPrice = monthlyRent;
      priceLabel = 'Monthly Rent';
    }

    // Don't show card if no price is entered
    if (currentPrice == null || priceLabel == null) {
      return const SizedBox.shrink();
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: const Color(0xFF055c3a),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF055c3a).withValues(alpha: 0.2),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          const Row(
            children: [
              Icon(
                Icons.monetization_on_outlined,
                color: Colors.white,
                size: 20,
              ),
              SizedBox(width: AppSpacing.sm),
              Text(
                'Price Summary',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Price Display
          Text(
            '$priceLabel: ₹${_formatPrice(currentPrice)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),

          // Negotiable Badge
          if (priceNegotiable) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.xs,
              ),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text(
                '💬 Price Negotiable',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0);
  }
}
