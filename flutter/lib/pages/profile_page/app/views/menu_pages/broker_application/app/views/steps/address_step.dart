import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/snackbar/app/views/success_snackbar_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/app/views/widgets/worker_form_field.dart';
import '../../providers/broker_application_providers.dart';
import '../../states/broker_application_state.dart';

class AddressStep extends ConsumerStatefulWidget {
  const AddressStep({super.key});

  @override
  ConsumerState<AddressStep> createState() => _AddressStepState();
}

class _AddressStepState extends ConsumerState<AddressStep> {
  late final TextEditingController _streetController;
  late final TextEditingController _cityController;
  late final TextEditingController _stateController;
  late final TextEditingController _pincodeController;
  late final TextEditingController _landmarkController;

  final Map<String, String?> _errors = {};
  bool _isGettingLocation = false;

  @override
  void initState() {
    super.initState();
    _streetController = TextEditingController();
    _cityController = TextEditingController();
    _stateController = TextEditingController();
    _pincodeController = TextEditingController();
    _landmarkController = TextEditingController();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeFormData();
    });
  }

  void _initializeFormData() {
    final brokerState = ref.read(brokerApplicationNotifierProvider);
    final address = brokerState.formData.address;

    if (address.street.isNotEmpty) {
      _streetController.text = address.street;
      _cityController.text = address.city;
      _stateController.text = address.state;
      _pincodeController.text = address.pincode;
      _landmarkController.text = address.landmark ?? '';
    }
  }

  @override
  void dispose() {
    _streetController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _landmarkController.dispose();
    super.dispose();
  }

  void _updateFormData() {
    setState(() {
      _errors.clear();
    });

    _validateFields();

    ref.read(brokerApplicationNotifierProvider.notifier).updateAddress(
          street: _streetController.text,
          city: _cityController.text,
          state: _stateController.text,
          pincode: _pincodeController.text.trim(),
          landmark: _landmarkController.text,
        );
  }

  void _validateFields() {
    final street = _streetController.text.trim();
    final city = _cityController.text.trim();
    final state = _stateController.text.trim();
    final pincode = _pincodeController.text.trim();

    if (street.isEmpty) {
      _errors['street'] = 'Street address is required';
    }

    if (city.isEmpty) {
      _errors['city'] = 'City is required';
    }

    if (state.isEmpty) {
      _errors['state'] = 'State is required';
    }

    if (pincode.isEmpty) {
      _errors['pincode'] = 'Pincode is required';
    } else {
      final pincodeValidation =
          BrokerApplicationValidation.validatePincode(pincode);
      if (pincodeValidation != null) {
        _errors['pincode'] = pincodeValidation;
      }
    }
  }

  void _getCurrentLocation() async {
    setState(() {
      _isGettingLocation = true;
    });

    await ref
        .read(brokerApplicationNotifierProvider.notifier)
        .getCurrentLocation();

    final formData = ref.read(brokerApplicationNotifierProvider).formData;

    if (formData.address.street.isNotEmpty == true) {
      _streetController.text = formData.address.street;
    }
    if (formData.address.city.isNotEmpty == true) {
      _cityController.text = formData.address.city;
    }
    if (formData.address.state.isNotEmpty == true) {
      _stateController.text = formData.address.state;
    }
    if (formData.address.pincode.isNotEmpty == true) {
      _pincodeController.text = formData.address.pincode;
    }

    _updateFormData();

    setState(() {
      _isGettingLocation = false;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SuccessSnackbarWidget(
                message: 'Location detected and filled automatically')
            .createSnackBar(),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final brokerState = ref.watch(brokerApplicationNotifierProvider);
    final address = brokerState.formData.address;

    if (_streetController.text != address.street) {
      _streetController.text = address.street;
    }
    if (_cityController.text != address.city) {
      _cityController.text = address.city;
    }
    if (_stateController.text != address.state) {
      _stateController.text = address.state;
    }
    if (_pincodeController.text != address.pincode) {
      _pincodeController.text = address.pincode;
    }
    if (_landmarkController.text != (address.landmark ?? '')) {
      _landmarkController.text = address.landmark ?? '';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Address Information',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Enter your residential address',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Get Current Location Button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _isGettingLocation ? null : _getCurrentLocation,
            icon: _isGettingLocation
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.my_location),
            label: Text(_isGettingLocation
                ? 'Getting Location...'
                : 'Get Current Location'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.stateGreen500,
              foregroundColor: AppColors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Street Address
        WorkerFormField(
          controller: _streetController,
          label: 'Street Address',
          hint: 'Enter complete street address',
          isRequired: true,
          maxLines: 2,
          errorText: _errors['street'],
          onChanged: (_) => _updateFormData(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // City and State
        Row(
          children: [
            Expanded(
              child: WorkerFormField(
                controller: _cityController,
                label: 'City',
                hint: 'Enter city',
                isRequired: true,
                errorText: _errors['city'],
                onChanged: (_) => _updateFormData(),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: WorkerFormField(
                controller: _stateController,
                label: 'State',
                hint: 'Enter state',
                isRequired: true,
                errorText: _errors['state'],
                onChanged: (_) => _updateFormData(),
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Pincode and Landmark
        Row(
          children: [
            Expanded(
              child: WorkerFormField(
                controller: _pincodeController,
                label: 'Pincode',
                hint: 'Enter pincode',
                isRequired: true,
                keyboardType: TextInputType.number,
                errorText: _errors['pincode'],
                onChanged: (_) => _updateFormData(),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: WorkerFormField(
                controller: _landmarkController,
                label: 'Landmark',
                hint: 'Nearby landmark (optional)',
                onChanged: (_) => _updateFormData(),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
