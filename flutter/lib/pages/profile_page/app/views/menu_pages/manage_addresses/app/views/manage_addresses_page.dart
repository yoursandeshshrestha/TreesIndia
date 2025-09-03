import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../../../../../../commons/constants/app_colors.dart';
import '../../../../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../../../../commons/widgets/address_selector/app/views/address_selector_widget.dart';
import '../../../../../../../../commons/widgets/address_selector/domain/entities/address_entity.dart';

class ManageAddressesPage extends ConsumerStatefulWidget {
  const ManageAddressesPage({super.key});

  @override
  ConsumerState<ManageAddressesPage> createState() =>
      _ManageAddressesPageState();
}

class _ManageAddressesPageState extends ConsumerState<ManageAddressesPage> {
  AddressEntity? _selectedAddress;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.brandNeutral50,
      appBar: AppBar(
        title: const Text('Manage Addresses'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.brandNeutral900,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Page Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.sm),
                        decoration: BoxDecoration(
                          color: AppColors.brandPrimary100,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.location_on,
                          color: AppColors.brandPrimary600,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            H3Bold(
                              text: 'Your Addresses',
                              color: AppColors.brandNeutral900,
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            B3Regular(
                              text:
                                  'Manage your saved addresses for quick booking',
                              color: AppColors.brandNeutral600,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Address Management Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: AddressSelectorWidget(
                title: 'Saved Addresses',
                selectedAddress: _selectedAddress,
                onAddressSelected: (address) {
                  // setState(() {
                  //   _selectedAddress = address;
                  // });

                  // Show selection feedback
                  // ScaffoldMessenger.of(context).showSnackBar(
                  //   SnackBar(
                  //     content: Text('Selected "${address.name}" address'),
                  //     backgroundColor: AppColors.brandPrimary600,
                  //     duration: const Duration(seconds: 2),
                  //   ),
                  // );
                },
                showCreateButton: true,
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Selected Address Info
            if (_selectedAddress != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: AppColors.brandPrimary50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.brandPrimary200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.check_circle,
                          color: AppColors.brandPrimary600,
                          size: 20,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        H4Bold(
                          text: 'Currently Selected',
                          color: AppColors.brandPrimary700,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // Address Details
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on,
                          color: AppColors.brandPrimary600,
                          size: 16,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              B2Bold(
                                text: _selectedAddress!.name,
                                color: AppColors.brandPrimary700,
                              ),
                              const SizedBox(height: AppSpacing.xs),
                              B3Regular(
                                text: _selectedAddress!.fullAddress,
                                color: AppColors.brandNeutral700,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    if (_selectedAddress!.isDefault) ...[
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.sm,
                              vertical: AppSpacing.xs,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.brandPrimary600,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: B4Bold(
                              text: 'DEFAULT',
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
            ],

            // Help Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.brandNeutral100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.brandNeutral200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.help_outline,
                        color: AppColors.brandNeutral600,
                        size: 20,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      H4Bold(
                        text: 'How to manage addresses',
                        color: AppColors.brandNeutral700,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _buildHelpItem(
                    Icons.add_location_alt,
                    'Add New Address',
                    'Click "Add New" to create a new address with map selection',
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _buildHelpItem(
                    Icons.edit_location_alt,
                    'Edit Address',
                    'Use the edit icon on any address to modify details',
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _buildHelpItem(
                    Icons.delete_outline,
                    'Delete Address',
                    'Remove unwanted addresses (except default address)',
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _buildHelpItem(
                    Icons.star,
                    'Set as Default',
                    'Mark your most used address as default for quick selection',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHelpItem(IconData icon, String title, String description) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          color: AppColors.brandNeutral500,
          size: 16,
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              B4Bold(
                text: title,
                color: AppColors.brandNeutral700,
              ),
              B5Regular(
                text: description,
                color: AppColors.brandNeutral600,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
