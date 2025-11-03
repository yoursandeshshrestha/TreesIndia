import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/success_snackbar_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import 'package:trees_india/commons/theming/text_styles.dart';
import 'package:trees_india/commons/utils/open_custom_bottom_sheet.dart';
import 'package:trees_india/commons/widgets/address_selector/app/providers/address_providers.dart';
import 'package:trees_india/commons/widgets/address_selector/app/viewmodels/address_state.dart';
import 'package:trees_india/commons/widgets/address_selector/domain/entities/address_entity.dart';

class ManageAddressesPage extends ConsumerStatefulWidget {
  const ManageAddressesPage({super.key});

  @override
  ConsumerState<ManageAddressesPage> createState() =>
      _ManageAddressesPageState();
}

class _ManageAddressesPageState extends ConsumerState<ManageAddressesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(addressNotifierProvider.notifier).loadAddresses();
    });
  }

  @override
  Widget build(BuildContext context) {
    final addressState = ref.watch(addressNotifierProvider);


    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: const CustomAppBar(
        title: 'Manage Addresses',
        backgroundColor: AppColors.white,
        iconColor: AppColors.brandNeutral800,
        titleColor: AppColors.brandNeutral800,
      ),
      body: Column(
        children: [
          // Add Another Address Button
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: AppColors.brandNeutral100,
                  width: 1,
                ),
              ),
            ),
            child: GestureDetector(
              onTap: () {
                _showAddAddressBottomSheet(context);
              },
              child: const Row(
                children: [
                  Icon(
                    Icons.add,
                    color: Color(0xFF055c3a),
                    size: 20,
                  ),
                  SizedBox(width: AppSpacing.md),
                  Text(
                    'Add another address',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF055c3a),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Address List
          Expanded(
            child: _buildAddressList(addressState),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressList(AddressState addressState) {
    if (addressState.status == AddressStatus.loading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (addressState.status == AddressStatus.failure) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline,
                size: 48, color: AppColors.stateRed500),
            const SizedBox(height: AppSpacing.md),
            Text(
              addressState.errorMessage ?? 'Failed to load addresses',
              style: const TextStyle(color: Colors.red),
            ),
            const SizedBox(height: AppSpacing.md),
            ElevatedButton(
              onPressed: () =>
                  ref.read(addressNotifierProvider.notifier).loadAddresses(),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (addressState.addresses.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.location_off,
              size: 64,
              color: AppColors.brandNeutral400,
            ),
            SizedBox(height: AppSpacing.md),
            Text(
              'No addresses found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.brandNeutral600,
              ),
            ),
            SizedBox(height: AppSpacing.sm),
            Text(
              'Add your first address to get started',
              style: TextStyle(
                color: AppColors.brandNeutral500,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      itemCount: addressState.addresses.length,
      separatorBuilder: (context, index) => const Divider(
        color: AppColors.brandNeutral100,
        height: 1,
      ),
      itemBuilder: (context, index) {
        final address = addressState.addresses[index];
        return _buildAddressItem(address);
      },
    );
  }

  Widget _buildAddressItem(AddressEntity address) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Address content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Label (Home, Test, etc.) with Default badge
                Row(
                  children: [
                    Text(
                      address.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.brandNeutral900,
                      ),
                    ),
                    if (address.isDefault) ...[
                      const SizedBox(width: AppSpacing.sm),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.stateGreen100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'DEFAULT',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppColors.stateGreen700,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),

                // Full address
                Text(
                  address.fullAddress,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.brandNeutral600,
                  ),
                ),
              ],
            ),
          ),

          // Edit and Delete buttons
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Edit button
              IconButton(
                onPressed: () {
                  _showEditAddressBottomSheet(context, address);
                },
                icon: const Icon(
                  Icons.edit_outlined,
                  color: AppColors.stateGreen900,
                ),
                constraints: const BoxConstraints(
                  minWidth: 24,
                  minHeight: 24,
                ),
              ),
              // Delete button
              IconButton(
                onPressed: address.isDefault
                    ? null
                    : () {
                        _deleteAddress(address.id);
                      },
                icon: Icon(
                  Icons.delete_outline,
                  color: address.isDefault
                      ? AppColors.brandNeutral300
                      : AppColors.stateRed700,
                ),
                constraints: const BoxConstraints(
                  minWidth: 24,
                  minHeight: 24,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _deleteAddress(int addressId) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Warning Icon
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: const BoxDecoration(
                  color: AppColors.stateRed50,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.warning_amber_rounded,
                  color: AppColors.stateRed500,
                  size: 32,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // Title
              H3Medium(
                text: 'Delete Address',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.md),

              // Description
              const Text(
                'Are you sure you want to delete this address? This action cannot be undone.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.brandNeutral600,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Action Buttons
              Row(
                children: [
                  // Cancel Button
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding:
                            const EdgeInsets.symmetric(vertical: AppSpacing.md),
                        side:
                            const BorderSide(color: AppColors.brandNeutral300),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Cancel',
                        style: TextStyle(
                          color: AppColors.brandNeutral700,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),

                  // Delete Button
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        ref
                            .read(addressNotifierProvider.notifier)
                            .deleteAddress(addressId);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.stateRed500,
                        foregroundColor: Colors.white,
                        padding:
                            const EdgeInsets.symmetric(vertical: AppSpacing.md),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Delete',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAddAddressBottomSheet(BuildContext context) {
    final TextEditingController nameController = TextEditingController();
    final TextEditingController addressController = TextEditingController();
    final TextEditingController cityController = TextEditingController();
    final TextEditingController stateController = TextEditingController();
    final TextEditingController pincodeController = TextEditingController();
    final TextEditingController houseNumberController = TextEditingController();
    final TextEditingController landmarkController = TextEditingController();
    bool isLoadingLocation = false;
    double? fetchedLatitude;
    double? fetchedLongitude;

    openCustomBottomSheet(
      context: context,
      child: StatefulBuilder(
        builder: (context, setState) => Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  H3Medium(
                    text: 'Add New Address',
                    color: AppColors.brandNeutral900,
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                    color: AppColors.brandNeutral600,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Use Current Location Button
              Consumer(
                builder: (context, ref, child) {
                  return SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: isLoadingLocation
                          ? null
                          : () async {
                              setState(() {
                                isLoadingLocation = true;
                              });

                              try {
                                final locationService =
                                    ref.read(locationOnboardingServiceProvider);
                                final location =
                                    await locationService.getCurrentLocation();

                                if (context.mounted) {
                                  setState(() {
                                    cityController.text = location.city ?? '';
                                    stateController.text = location.state ?? '';
                                    pincodeController.text =
                                        location.postalCode ?? '';
                                    addressController.text = location.address;
                                    fetchedLatitude = location.latitude;
                                    fetchedLongitude = location.longitude;
                                    isLoadingLocation = false;
                                  });

                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SuccessSnackbarWidget(
                                      message: 'Location fetched successfully!',
                                    ).createSnackBar(),
                                  );
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  setState(() {
                                    isLoadingLocation = false;
                                  });

                                  ScaffoldMessenger.of(context).showSnackBar(
                                    ErrorSnackbarWidget(
                                      message:
                                          'Failed to get location: ${e.toString()}',
                                    ).createSnackBar(),
                                  );
                                }
                              }
                            },
                      icon: isLoadingLocation
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                    Color(0xFF055c3a)),
                              ),
                            )
                          : const Icon(
                              Icons.my_location,
                              size: 18,
                            ),
                      label: Text(
                        isLoadingLocation
                            ? 'Fetching location...'
                            : 'Use Current Location',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF055c3a),
                        side: const BorderSide(
                          color: Color(0xFF055c3a),
                          width: 1,
                        ),
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.md,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.lg),

              // Street Address
              _buildTextField(
                controller: addressController,
                label: 'Street Address',
                hint: 'Enter complete address',
                isRequired: true,
                // onChanged: (value) => _updateLocationDetails(),
              ),
              const SizedBox(height: AppSpacing.md),

              // City and Pincode
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: pincodeController,
                      label: 'Pincode',
                      hint: 'Enter pincode',
                      isRequired: true,
                      keyboardType: TextInputType.number,
                      // onChanged: (value) => _updateLocationDetails(),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: _buildTextField(
                      controller: cityController,
                      label: 'City',
                      hint: 'Enter city',
                      isRequired: true,
                      // onChanged: (value) => _updateLocationDetails(),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              // State
              _buildTextField(
                controller: stateController,
                label: 'State',
                hint: 'Enter state',
                isRequired: true,
                // onChanged: (value) => _updateLocationDetails(),
              ),
              const SizedBox(height: AppSpacing.md),

              _buildTextField(
                controller: houseNumberController,
                label: 'House/Flat Number',
                hint: 'Enter House/Flat Number',
                isRequired: false,
                // onChanged: (value) => _updateLocationDetails(),
              ),

              // House/Flat Number and Landmark Row

              const SizedBox(height: AppSpacing.md),
              _buildTextField(
                controller: landmarkController,
                label: 'Landmark',
                hint: 'Enter Landmark',
                isRequired: false,
                // onChanged: (value) => _updateLocationDetails(),
              ),

              const SizedBox(height: AppSpacing.md),

              // Address Label
              B3Bold(
                text: 'Address Label',
                color: AppColors.brandNeutral700,
              ),
              const SizedBox(height: AppSpacing.md),

              // Predefined options
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          nameController.text == 'Home'
                              ? nameController.text = ''
                              : nameController.text = 'Home';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.sm,
                          horizontal: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: nameController.text == 'Home'
                              ? const Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Home'
                                ? const Color(0xFF055c3a)
                                : AppColors.brandNeutral300,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Home',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: nameController.text == 'Home'
                                ? Colors.white
                                : AppColors.brandNeutral600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          nameController.text == 'Work'
                              ? nameController.text = ''
                              : nameController.text = 'Work';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.sm,
                          horizontal: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: nameController.text == 'Work'
                              ? const Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Work'
                                ? const Color(0xFF055c3a)
                                : AppColors.brandNeutral300,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Work',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: nameController.text == 'Work'
                                ? Colors.white
                                : AppColors.brandNeutral600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          nameController.text == 'Other'
                              ? nameController.text = ''
                              : nameController.text = 'Other';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.sm,
                          horizontal: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: nameController.text == 'Other'
                              ? const Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Other'
                                ? const Color(0xFF055c3a)
                                : AppColors.brandNeutral300,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Other',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: nameController.text == 'Other'
                                ? Colors.white
                                : AppColors.brandNeutral600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // Custom input field when "Other" is selected
              if (nameController.text == 'Other') ...[
                const SizedBox(height: AppSpacing.md),
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    hintText: 'Enter custom label',
                    hintStyle:
                        TextStyles.b3Medium(color: AppColors.brandNeutral400),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: AppColors.brandNeutral200),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: AppColors.brandNeutral200),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: AppColors.stateGreen500),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm,
                    ),
                  ),
                  style: TextStyles.b3Medium(color: AppColors.brandNeutral900),
                  onTapOutside: (_) => FocusScope.of(context).unfocus(),
                ),
              ],
              const SizedBox(height: AppSpacing.lg),

              // Add Address Button
              Consumer(
                builder: (context, ref, child) {
                  final addressState = ref.watch(addressNotifierProvider);

                  return SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: addressState.isCreating
                          ? null
                          : () async {
                              // Validate all required fields
                              if (addressController.text.isNotEmpty &&
                                  cityController.text.isNotEmpty &&
                                  stateController.text.isNotEmpty &&
                                  pincodeController.text.isNotEmpty) {
                                try {
                                  // Create address request
                                  final createAddressRequest =
                                      CreateAddressRequestEntity(
                                    name: nameController.text.isNotEmpty
                                        ? nameController.text
                                        : null,
                                    address: addressController.text,
                                    city: cityController.text,
                                    state: stateController.text,
                                    country: 'India', // Default country
                                    postalCode: pincodeController.text,
                                    latitude: fetchedLatitude ?? 0.0,
                                    longitude: fetchedLongitude ?? 0.0,
                                    houseNumber:
                                        houseNumberController.text.isNotEmpty
                                            ? houseNumberController.text
                                            : null,
                                    landmark: landmarkController.text.isNotEmpty
                                        ? landmarkController.text
                                        : null,
                                    isDefault: false, // Default to false
                                  );

                                  // Call the API to create address
                                  await ref
                                      .read(addressNotifierProvider.notifier)
                                      .createAddress(createAddressRequest);

                                  // Close the bottom sheet
                                  if (!context.mounted) return;
                                  Navigator.pop(context);

                                  // Show success message
                                  if (!context.mounted) return;
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SuccessSnackbarWidget(
                                      message: 'Address added successfully!',
                                    ).createSnackBar(),
                                  );

                                  // Refresh the address list
                                  ref
                                      .read(addressNotifierProvider.notifier)
                                      .loadAddresses();
                                } catch (e) {
                                  // Show error message
                                  if (!context.mounted) return;
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    ErrorSnackbarWidget(
                                      message:
                                          'Failed to add address: ${e.toString()}',
                                    ).createSnackBar(),
                                  );
                                }
                              } else {
                                // Show validation error
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const ErrorSnackbarWidget(
                                    message: 'Please fill all required fields',
                                  ).createSnackBar(),
                                );
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: addressState.isCreating
                            ? AppColors.brandNeutral400
                            : const Color(0xFF055c3a),
                        foregroundColor: Colors.white,
                        padding:
                            const EdgeInsets.symmetric(vertical: AppSpacing.md),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: addressState.isCreating
                          ? const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white),
                                  ),
                                ),
                                SizedBox(width: AppSpacing.sm),
                                Text(
                                  'Adding Address...',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            )
                          : const Text(
                              'Add Address',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }

  void _showEditAddressBottomSheet(
      BuildContext context, AddressEntity address) {
    final TextEditingController nameController =
        TextEditingController(text: address.name);
    final TextEditingController addressController =
        TextEditingController(text: address.address);
    final TextEditingController cityController =
        TextEditingController(text: address.city);
    final TextEditingController stateController =
        TextEditingController(text: address.state);
    final TextEditingController pincodeController =
        TextEditingController(text: address.postalCode);
    final TextEditingController houseNumberController =
        TextEditingController(text: address.houseNumber ?? '');
    final TextEditingController landmarkController =
        TextEditingController(text: address.landmark ?? '');
    bool isLoadingLocation = false;
    double? fetchedLatitude;
    double? fetchedLongitude;

    openCustomBottomSheet(
      context: context,
      child: StatefulBuilder(
        builder: (context, setState) => Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  H3Medium(
                    text: 'Edit Address',
                    color: AppColors.brandNeutral900,
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                    color: AppColors.brandNeutral600,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              // Use Current Location Button
              Consumer(
                builder: (context, ref, child) {
                  return SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: isLoadingLocation
                          ? null
                          : () async {
                              setState(() {
                                isLoadingLocation = true;
                              });

                              try {
                                final locationService =
                                    ref.read(locationOnboardingServiceProvider);
                                final location =
                                    await locationService.getCurrentLocation();

                                if (context.mounted) {
                                  setState(() {
                                    cityController.text = location.city ?? '';
                                    stateController.text = location.state ?? '';
                                    pincodeController.text =
                                        location.postalCode ?? '';
                                    addressController.text = location.address;
                                    fetchedLatitude = location.latitude;
                                    fetchedLongitude = location.longitude;
                                    isLoadingLocation = false;
                                  });

                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SuccessSnackbarWidget(
                                      message: 'Location fetched successfully!',
                                    ).createSnackBar(),
                                  );
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  setState(() {
                                    isLoadingLocation = false;
                                  });

                                  ScaffoldMessenger.of(context).showSnackBar(
                                    ErrorSnackbarWidget(
                                      message:
                                          'Failed to get location: ${e.toString()}',
                                    ).createSnackBar(),
                                  );
                                }
                              }
                            },
                      icon: isLoadingLocation
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                    Color(0xFF055c3a)),
                              ),
                            )
                          : const Icon(
                              Icons.my_location,
                              size: 18,
                            ),
                      label: Text(
                        isLoadingLocation
                            ? 'Fetching location...'
                            : 'Use Current Location',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF055c3a),
                        side: const BorderSide(
                          color: Color(0xFF055c3a),
                          width: 1,
                        ),
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.md,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.lg),

              // Street Address
              _buildTextField(
                controller: addressController,
                label: 'Street Address',
                hint: 'Enter complete address',
                isRequired: true,
                maxLines: 3,
              ),
              const SizedBox(height: AppSpacing.md),

              // City and Pincode
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: pincodeController,
                      label: 'Pincode',
                      hint: 'Enter pincode',
                      isRequired: true,
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: _buildTextField(
                      controller: cityController,
                      label: 'City',
                      hint: 'Enter city',
                      isRequired: true,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              // State
              _buildTextField(
                controller: stateController,
                label: 'State',
                hint: 'Enter state',
                isRequired: true,
              ),
              const SizedBox(height: AppSpacing.md),

              // House/Flat Number
              _buildTextField(
                controller: houseNumberController,
                label: 'House/Flat Number',
                hint: 'Enter House/Flat Number',
                isRequired: false,
              ),

              const SizedBox(height: AppSpacing.md),

              // Landmark
              _buildTextField(
                controller: landmarkController,
                label: 'Landmark',
                hint: 'Enter Landmark',
                isRequired: false,
              ),
              const SizedBox(height: AppSpacing.md),

              // Address Label
              B3Bold(
                text: 'Address Label',
                color: AppColors.brandNeutral700,
              ),
              const SizedBox(height: AppSpacing.md),

              // Predefined options
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          nameController.text = 'Home';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.sm,
                          horizontal: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: nameController.text == 'Home'
                              ? const Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Home'
                                ? const Color(0xFF055c3a)
                                : AppColors.brandNeutral300,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Home',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: nameController.text == 'Home'
                                ? Colors.white
                                : AppColors.brandNeutral600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          nameController.text = 'Work';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.sm,
                          horizontal: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: nameController.text == 'Work'
                              ? const Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Work'
                                ? const Color(0xFF055c3a)
                                : AppColors.brandNeutral300,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Work',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: nameController.text == 'Work'
                                ? Colors.white
                                : AppColors.brandNeutral600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          nameController.text = 'Other';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.sm,
                          horizontal: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: nameController.text == 'Other'
                              ? const Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Other'
                                ? const Color(0xFF055c3a)
                                : AppColors.brandNeutral300,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Other',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: nameController.text == 'Other'
                                ? Colors.white
                                : AppColors.brandNeutral600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // Custom input field when "Other" is selected
              if (nameController.text == 'Other') ...[
                const SizedBox(height: AppSpacing.md),
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    hintText: 'Enter custom label',
                    hintStyle:
                        TextStyles.b3Medium(color: AppColors.brandNeutral400),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: AppColors.brandNeutral200),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: AppColors.brandNeutral200),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: AppColors.stateGreen500),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm,
                    ),
                  ),
                  style: TextStyles.b3Medium(color: AppColors.brandNeutral900),
                  onTapOutside: (_) => FocusScope.of(context).unfocus(),
                ),
              ],
              const SizedBox(height: AppSpacing.lg),

              // Update Address Button
              Consumer(
                builder: (context, ref, child) {
                  final addressState = ref.watch(addressNotifierProvider);

                  return SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: addressState.isUpdating
                          ? null
                          : () async {
                              // Validate all required fields
                              if (addressController.text.isNotEmpty &&
                                  cityController.text.isNotEmpty &&
                                  stateController.text.isNotEmpty &&
                                  pincodeController.text.isNotEmpty) {
                                try {
                                  // Create update address request
                                  final updateAddressRequest =
                                      UpdateAddressRequestEntity(
                                    id: address.id,
                                    name: nameController.text.isNotEmpty
                                        ? nameController.text
                                        : null,
                                    address: addressController.text,
                                    city: cityController.text,
                                    state: stateController.text,
                                    country: address.country,
                                    postalCode: pincodeController.text,
                                    latitude:
                                        fetchedLatitude ?? address.latitude,
                                    longitude:
                                        fetchedLongitude ?? address.longitude,
                                    houseNumber:
                                        houseNumberController.text.isNotEmpty
                                            ? houseNumberController.text
                                            : null,
                                    landmark: landmarkController.text.isNotEmpty
                                        ? landmarkController.text
                                        : null,
                                    isDefault: address.isDefault,
                                  );

                                  // Call the API to update address
                                  await ref
                                      .read(addressNotifierProvider.notifier)
                                      .updateAddress(updateAddressRequest);

                                  // Close the bottom sheet
                                  if (context.mounted) Navigator.pop(context);

                                  // Show success message
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SuccessSnackbarWidget(
                                        message:
                                            'Address updated successfully!',
                                      ).createSnackBar(),
                                    );
                                  }

                                  // Refresh the address list
                                  ref
                                      .read(addressNotifierProvider.notifier)
                                      .loadAddresses();
                                } catch (e) {
                                  // Show error message
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      ErrorSnackbarWidget(
                                        message:
                                            'Failed to update address: ${e.toString()}',
                                      ).createSnackBar(),
                                    );
                                  }
                                }
                              } else {
                                // Show validation error
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const ErrorSnackbarWidget(
                                    message: 'Please fill all required fields',
                                  ).createSnackBar(),
                                );
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: addressState.isUpdating
                            ? AppColors.brandNeutral400
                            : const Color(0xFF055c3a),
                        foregroundColor: Colors.white,
                        padding:
                            const EdgeInsets.symmetric(vertical: AppSpacing.md),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: addressState.isUpdating
                          ? const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white),
                                  ),
                                ),
                                SizedBox(width: AppSpacing.sm),
                                Text(
                                  'Updating Address...',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            )
                          : const Text(
                              'Update Address',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
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
}
