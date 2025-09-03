import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/widgets/address_selector/domain/entities/address_entity.dart';
import 'package:trees_india/commons/widgets/address_selector/app/providers/address_providers.dart';
import 'package:trees_india/commons/widgets/address_selector/app/viewmodels/address_state.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import 'package:trees_india/commons/utils/open_custom_bottom_sheet.dart';
import 'package:trees_india/commons/components/textfield/app/views/alphabetic_textfield_widget.dart';
import 'package:trees_india/commons/components/textfield/app/views/alpha_numeric_textfield_widget.dart';
import 'package:trees_india/commons/components/textfield/app/views/numeric_textfield_widget.dart';

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
              child: Row(
                children: [
                  const Icon(
                    Icons.add,
                    color: Color(0xFF055c3a),
                    size: 20,
                  ),
                  const SizedBox(width: AppSpacing.md),
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
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.location_off,
              size: 64,
              color: AppColors.brandNeutral400,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'No addresses found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.brandNeutral600,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
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
      separatorBuilder: (context, index) => Divider(
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
                // Label (Home, Test, etc.)
                Text(
                  address.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.brandNeutral900,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),

                // Full address
                Text(
                  address.fullAddress,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.brandNeutral600,
                  ),
                ),
              ],
            ),
          ),

          // Delete button
          IconButton(
            onPressed: () {
              _deleteAddress(address.id);
            },
            icon: const Icon(
              Icons.delete_outline,
              color: Color.fromARGB(255, 206, 205, 205),
            ),
            constraints: const BoxConstraints(
              minWidth: 24,
              minHeight: 24,
            ),
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
                decoration: BoxDecoration(
                  color: AppColors.stateRed50,
                  shape: BoxShape.circle,
                ),
                child: Icon(
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
              Text(
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
                        side: BorderSide(color: AppColors.brandNeutral300),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
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
                      child: Text(
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

              // City
              TextField(
                controller: cityController,
                decoration: InputDecoration(
                  hintText: 'City',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        BorderSide(color: AppColors.brandNeutral200, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Color(0xFF055c3a), width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        BorderSide(color: AppColors.brandNeutral200, width: 1),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // State
              TextField(
                controller: stateController,
                decoration: InputDecoration(
                  hintText: 'State',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        BorderSide(color: AppColors.brandNeutral200, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Color(0xFF055c3a), width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        BorderSide(color: AppColors.brandNeutral200, width: 1),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // Pincode
              TextField(
                controller: pincodeController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'Pincode',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        BorderSide(color: AppColors.brandNeutral200, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Color(0xFF055c3a), width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        BorderSide(color: AppColors.brandNeutral200, width: 1),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // Full Address
              TextField(
                controller: addressController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Enter your complete address',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        BorderSide(color: AppColors.brandNeutral200, width: 1),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Color(0xFF055c3a), width: 1),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        BorderSide(color: AppColors.brandNeutral200, width: 1),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // Address Label
              Text(
                'Address Label',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.brandNeutral700,
                ),
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
                              ? Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Home'
                                ? Color(0xFF055c3a)
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
                              ? Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Work'
                                ? Color(0xFF055c3a)
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
                              ? Color(0xFF055c3a)
                              : Colors.white,
                          border: Border.all(
                            color: nameController.text == 'Other'
                                ? Color(0xFF055c3a)
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
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                          color: AppColors.brandNeutral200, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          BorderSide(color: Color(0xFF055c3a), width: 1),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                          color: AppColors.brandNeutral200, width: 1),
                    ),
                  ),
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
                              if (nameController.text.isNotEmpty &&
                                  addressController.text.isNotEmpty &&
                                  cityController.text.isNotEmpty &&
                                  stateController.text.isNotEmpty &&
                                  pincodeController.text.isNotEmpty) {
                                try {
                                  // Create address request
                                  final createAddressRequest =
                                      CreateAddressRequestEntity(
                                    name: nameController.text,
                                    address: addressController.text,
                                    city: cityController.text,
                                    state: stateController.text,
                                    country: 'India', // Default country
                                    postalCode: pincodeController.text,
                                    latitude:
                                        0.0, // Default latitude - you can get from location service
                                    longitude:
                                        0.0, // Default longitude - you can get from location service
                                    isDefault: false, // Default to false
                                  );

                                  // Call the API to create address
                                  await ref
                                      .read(addressNotifierProvider.notifier)
                                      .createAddress(createAddressRequest);

                                  // Close the bottom sheet
                                  Navigator.pop(context);

                                  // Show success message
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content:
                                          Text('Address added successfully!'),
                                      backgroundColor: Colors.green,
                                    ),
                                  );

                                  // Refresh the address list
                                  ref
                                      .read(addressNotifierProvider.notifier)
                                      .loadAddresses();
                                } catch (e) {
                                  // Show error message
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                          'Failed to add address: ${e.toString()}'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              } else {
                                // Show validation error
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content:
                                        Text('Please fill all required fields'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: addressState.isCreating
                            ? AppColors.brandNeutral400
                            : Color(0xFF055c3a),
                        foregroundColor: Colors.white,
                        padding:
                            const EdgeInsets.symmetric(vertical: AppSpacing.md),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: addressState.isCreating
                          ? Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white),
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                const Text(
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
}
