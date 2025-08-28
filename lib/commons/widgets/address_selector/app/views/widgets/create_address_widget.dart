import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../../../commons/components/textfield/app/views/alphabetic_textfield_widget.dart';
import '../../../../../../commons/components/textfield/app/views/numeric_textfield_widget.dart';
import '../../../../../../commons/constants/app_colors.dart';
import '../../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/address_entity.dart';
import '../../providers/address_providers.dart';
import '../../viewmodels/address_state.dart';
import 'map_location_picker.dart';

class CreateAddressWidget extends ConsumerStatefulWidget {
  final VoidCallback? onCancel;
  final void Function(AddressEntity address)? onAddressCreated;

  const CreateAddressWidget({
    super.key,
    this.onCancel,
    this.onAddressCreated,
  });

  @override
  ConsumerState<CreateAddressWidget> createState() => _CreateAddressWidgetState();
}

class _CreateAddressWidgetState extends ConsumerState<CreateAddressWidget> {
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _postalCodeController = TextEditingController();
  final _landmarkController = TextEditingController();
  final _houseNumberController = TextEditingController();
  
  double? _latitude;
  double? _longitude;
  bool _isDefault = false;
  bool _showMapPicker = false;

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _postalCodeController.dispose();
    _landmarkController.dispose();
    _houseNumberController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final addressState = ref.watch(addressNotifierProvider);

    // Listen for address creation success/failure
    ref.listen<AddressState>(addressNotifierProvider, (previous, next) {
      if (next.createdAddress != null && previous?.createdAddress != next.createdAddress) {
        widget.onAddressCreated?.call(next.createdAddress!);
        ref.read(addressNotifierProvider.notifier).clearCreatedAddress();
      }
      
      if (next.status == AddressStatus.failure && next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage!),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    if (_showMapPicker) {
      return MapLocationPicker(
        onLocationSelected: (lat, lng, address) {
          setState(() {
            _latitude = lat;
            _longitude = lng;
            _addressController.text = address ?? '';
            _showMapPicker = false;
          });
        },
        onCancel: () => setState(() => _showMapPicker = false),
      );
    }

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              H4Bold(
                text: 'Add New Address',
                color: AppColors.brandNeutral900,
              ),
              const Spacer(),
              IconButton(
                onPressed: widget.onCancel,
                icon: const Icon(Icons.close),
                constraints: const BoxConstraints(
                  minWidth: 32,
                  minHeight: 32,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: AppSpacing.lg),
          
          // Basic Information
          H4Bold(
            text: 'Basic Information',
            color: AppColors.brandNeutral800,
          ),
          const SizedBox(height: AppSpacing.md),
          
          AlphabeticTextfieldWidget(
            hintText: 'Address Name (e.g., Home, Office)',
            onTextChanged: (value) => _nameController.text = value,
          ),
          const SizedBox(height: AppSpacing.md),
          
          Row(
            children: [
              Expanded(
                child: AlphabeticTextfieldWidget(
                  hintText: 'House/Flat Number',
                  onTextChanged: (value) => _houseNumberController.text = value,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: AlphabeticTextfieldWidget(
                  hintText: 'Landmark (Optional)',
                  onTextChanged: (value) => _landmarkController.text = value,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: AppSpacing.xl),
          
          // Address Details
          Row(
            children: [
              H4Bold(
                text: 'Address Details',
                color: AppColors.brandNeutral800,
              ),
              const Spacer(),
              TextButton.icon(
                onPressed: () => setState(() => _showMapPicker = true),
                icon: const Icon(
                  Icons.map_outlined,
                  size: 16,
                  color: AppColors.brandPrimary600,
                ),
                label: B4Bold(
                  text: 'Pick on Map',
                  color: AppColors.brandPrimary600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          
          AlphabeticTextfieldWidget(
            hintText: 'Full Address',
              onTextChanged: (value) => _addressController.text = value,
          ),
          const SizedBox(height: AppSpacing.md),
          
          Row(
            children: [
              Expanded(
                child: AlphabeticTextfieldWidget(
                  hintText: 'City',
                  onTextChanged: (value) => _cityController.text = value,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: AlphabeticTextfieldWidget(
                  hintText: 'State',
                  onTextChanged: (value) => _stateController.text = value,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          
          NumericTextfieldWidget(
            hintText: 'Postal Code',
            onTextChanged: (value) => _postalCodeController.text = value,
          ),
          
          // Location info if selected from map
          if (_latitude != null && _longitude != null) ...[
            const SizedBox(height: AppSpacing.md),
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.brandPrimary50,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.brandPrimary200),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.location_on,
                    size: 16,
                    color: AppColors.brandPrimary600,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: B4Regular(
                      text: 'Location: ${_latitude!.toStringAsFixed(6)}, ${_longitude!.toStringAsFixed(6)}',
                      color: AppColors.brandPrimary700,
                    ),
                  ),
                ],
              ),
            ),
          ],
          
          const SizedBox(height: AppSpacing.lg),
          
          // Default address checkbox
          Row(
            children: [
              Checkbox(
                value: _isDefault,
                onChanged: (value) => setState(() => _isDefault = value ?? false),
                activeColor: AppColors.brandPrimary600,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: B3Regular(
                  text: 'Set as default address',
                  color: AppColors.brandNeutral700,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: AppSpacing.xl),
          
          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: widget.onCancel,
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: SolidButtonWidget(
                  label: 'Save Address',
                  onPressed: _isFormValid() ? _createAddress : null,
                  isLoading: addressState.isCreating,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  bool _isFormValid() {
    return _nameController.text.isNotEmpty &&
        _addressController.text.isNotEmpty &&
        _cityController.text.isNotEmpty &&
        _stateController.text.isNotEmpty &&
        _postalCodeController.text.isNotEmpty;
  }

  void _createAddress() {
    if (!_isFormValid()) return;

    final request = CreateAddressRequestEntity(
      name: _nameController.text.trim(),
      address: _addressController.text.trim(),
      city: _cityController.text.trim(),
      state: _stateController.text.trim(),
      country: 'India', // Hardcoded for now
      postalCode: _postalCodeController.text.trim(),
      latitude: _latitude ?? 0.0,
      longitude: _longitude ?? 0.0,
      landmark: _landmarkController.text.trim().isEmpty 
          ? null 
          : _landmarkController.text.trim(),
      houseNumber: _houseNumberController.text.trim().isEmpty 
          ? null 
          : _houseNumberController.text.trim(),
      isDefault: _isDefault,
    );

    ref.read(addressNotifierProvider.notifier).createAddress(request);
  }
}