import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class PropertyFormWidget extends ConsumerStatefulWidget {
  const PropertyFormWidget({super.key});

  @override
  ConsumerState<PropertyFormWidget> createState() => _PropertyFormWidgetState();
}

class _PropertyFormWidgetState extends ConsumerState<PropertyFormWidget> {
  int currentStep = 0;
  final PageController _pageController = PageController();

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

  List<String> _imageNames = [];

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
    _pageController.dispose();
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
          child: PageView(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                currentStep = index;
              });
            },
            children: [
              _buildStep1BasicDetails(),
              _buildStep2LocationDetails(),
              _buildStep3PropertyProfile(),
              _buildStep4Photos(),
              _buildStep5Pricing(),
            ],
          ),
        ),

        // Navigation buttons
        _buildNavigationButtons(),
      ],
    );
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
                            Text(
                              _stepTitles[index],
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: index <= currentStep
                                    ? AppColors.brandNeutral800
                                    : AppColors.brandNeutral500,
                              ),
                              textAlign: TextAlign.center,
                            ),
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
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTextField(
            controller: _titleController,
            label: 'Property Title *',
            hintText: 'Enter property title',
            maxLength: 30,
          ),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _descriptionController,
            label: 'Description *',
            hintText: 'Describe your property',
            maxLines: 4,
            maxLength: 500,
          ),
          const SizedBox(height: AppSpacing.md),
          _buildRadioGroup(
            label: 'Property Type *',
            options: {'residential': 'Residential', 'commercial': 'Commercial'},
            value: _propertyType,
            onChanged: (value) => setState(() => _propertyType = value),
          ),
          const SizedBox(height: AppSpacing.md),
          _buildRadioGroup(
            label: 'Listing Type *',
            options: {'sale': 'For Sale', 'rent': 'For Rent'},
            value: _listingType,
            onChanged: (value) => setState(() => _listingType = value),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2LocationDetails() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          _buildTextField(
            controller: _stateController,
            label: 'State *',
            hintText: 'Enter state',
          ),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _cityController,
            label: 'City *',
            hintText: 'Enter city',
          ),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _addressController,
            label: 'Address',
            hintText: 'Enter full address',
            maxLines: 2,
          ),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _pincodeController,
            label: 'Pincode',
            hintText: 'Enter pincode',
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: AppSpacing.md),
          ElevatedButton.icon(
            onPressed: () {
              // TODO: Implement get current location
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Location feature coming soon')),
              );
            },
            icon: const Icon(Icons.my_location),
            label: const Text('Get Current Location'),
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
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          _buildNumberSelector('Bedrooms', _bedrooms,
              (value) => setState(() => _bedrooms = value)),
          const SizedBox(height: AppSpacing.md),
          _buildNumberSelector('Bathrooms', _bathrooms,
              (value) => setState(() => _bathrooms = value)),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _areaController,
            label: 'Carpet Area (sq.ft)',
            hintText: 'Enter area',
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: AppSpacing.md),
          _buildTextField(
            controller: _floorController,
            label: 'Floor Number',
            hintText: 'Enter floor',
            keyboardType: TextInputType.number,
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
            onChanged: (value) => setState(() => _age = value),
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
            onChanged: (value) => setState(() => _furnishing = value),
          ),
        ],
      ),
    );
  }

  Widget _buildStep4Photos() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              border: Border.all(
                  color: AppColors.brandNeutral300, style: BorderStyle.solid),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.cloud_upload,
                  size: 48,
                  color: AppColors.brandNeutral500,
                ),
                const SizedBox(height: AppSpacing.sm),
                const Text(
                  'Upload Property Images',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.brandNeutral700,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                const Text(
                  'Max 7 images, 10MB each',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.brandNeutral500,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                ElevatedButton(
                  onPressed: () {
                    // TODO: Implement image picker
                    setState(() {
                      _imageNames.add('Sample Image ${_imageNames.length + 1}');
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.stateGreen500,
                    foregroundColor: AppColors.white,
                  ),
                  child: const Text('Choose Images'),
                ),
              ],
            ),
          ),
          if (_imageNames.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            ...(_imageNames.asMap().entries.map((entry) {
              return ListTile(
                leading:
                    const Icon(Icons.image, color: AppColors.stateGreen500),
                title: Text(entry.value),
                trailing: IconButton(
                  icon: const Icon(Icons.delete, color: AppColors.error),
                  onPressed: () {
                    setState(() {
                      _imageNames.removeAt(entry.key);
                    });
                  },
                ),
              );
            })),
          ],
        ],
      ),
    );
  }

  Widget _buildStep5Pricing() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: [
          if (_listingType == 'sale') ...[
            _buildTextField(
              controller: _salePriceController,
              label: 'Sale Price (₹) *',
              hintText: 'Enter sale price',
              keyboardType: TextInputType.number,
            ),
          ] else if (_listingType == 'rent') ...[
            _buildTextField(
              controller: _rentController,
              label: 'Monthly Rent (₹) *',
              hintText: 'Enter monthly rent',
              keyboardType: TextInputType.number,
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
            onChanged: (value) =>
                setState(() => _priceNegotiable = value ?? false),
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
                onPressed: () {
                  _pageController.previousPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.ease,
                  );
                },
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
                onPressed: () {
                  _pageController.nextPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.ease,
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF055c3a),
                  foregroundColor: AppColors.white,
                  minimumSize: const Size(double.infinity, 48),
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('Continue'),
              ),
            ),
          if (currentStep == 4)
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Implement form submission
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Property submission coming soon')),
                  );
                  Navigator.of(context).pop();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF055c3a),
                  foregroundColor: AppColors.white,
                  minimumSize: const Size(double.infinity, 48),
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('Submit Property'),
              ),
            ),
        ],
      ),
    );
  }
}
