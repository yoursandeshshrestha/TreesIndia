import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../domain/entities/address_entity.dart';
import '../providers/address_providers.dart';
import '../viewmodels/address_state.dart';
import 'widgets/address_list_tile.dart';
import 'widgets/create_address_widget.dart';

class AddressSelectorWidget extends ConsumerStatefulWidget {
  final void Function(AddressEntity address)? onAddressSelected;
  final AddressEntity? selectedAddress;
  final bool showCreateButton;
  final String title;

  const AddressSelectorWidget({
    super.key,
    this.onAddressSelected,
    this.selectedAddress,
    this.showCreateButton = true,
    this.title = 'Select Address',
  });

  @override
  ConsumerState<AddressSelectorWidget> createState() => _AddressSelectorWidgetState();
}

class _AddressSelectorWidgetState extends ConsumerState<AddressSelectorWidget> {
  bool _showCreateForm = false;

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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          children: [
            H4Bold(
              text: widget.title,
              color: AppColors.brandNeutral900,
            ),
            const Spacer(),
            if (widget.showCreateButton && !_showCreateForm)
              TextButton.icon(
                onPressed: () => setState(() => _showCreateForm = true),
                icon: const Icon(
                  Icons.add_location_alt,
                  color: AppColors.brandPrimary600,
                  size: 16,
                ),
                label: B4Bold(
                  text: 'Add New',
                  color: AppColors.brandPrimary600,
                ),
              ),
          ],
        ),

        const SizedBox(height: AppSpacing.md),

        // Content based on state
        if (_showCreateForm)
          _buildCreateAddressForm(addressState)
        else
          _buildAddressList(addressState),
      ],
    );
  }

  Widget _buildAddressList(AddressState addressState) {
    if (addressState.status == AddressStatus.loading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(AppSpacing.xl),
          child: CircularProgressIndicator(
            color: AppColors.brandPrimary600,
          ),
        ),
      );
    }

    if (addressState.status == AddressStatus.failure) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: Colors.red.shade50,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.red.shade200),
        ),
        child: Column(
          children: [
            Icon(Icons.error_outline, color: Colors.red.shade600),
            const SizedBox(height: AppSpacing.sm),
            B3Regular(
              text: addressState.errorMessage ?? 'Failed to load addresses',
              color: Colors.red.shade700,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.md),
            OutlinedButton(
              onPressed: () => ref.read(addressNotifierProvider.notifier).loadAddresses(),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (addressState.addresses.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: BoxDecoration(
          color: AppColors.brandNeutral50,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.brandNeutral200),
        ),
        child: Column(
          children: [
            const Icon(
              Icons.location_off,
              size: 48,
              color: AppColors.brandNeutral400,
            ),
            const SizedBox(height: AppSpacing.md),
            H4Bold(
              text: 'No addresses found',
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(height: AppSpacing.sm),
            B3Regular(
              text: 'Add your first address to continue',
              color: AppColors.brandNeutral500,
            ),
            if (widget.showCreateButton) ...[
              const SizedBox(height: AppSpacing.lg),
              SolidButtonWidget(
                label: 'Add Address',
                onPressed: () => setState(() => _showCreateForm = true),
                isLoading: false,
              ),
            ],
          ],
        ),
      );
    }

    return Column(
      children: [
        ...addressState.addresses.map((address) {
          final isSelected = widget.selectedAddress?.id == address.id;
          
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: AddressListTile(
              address: address,
              isSelected: isSelected,
              onTap: () => widget.onAddressSelected?.call(address),
              onEdit: (address) => _editAddress(address),
              onDelete: (addressId) => _deleteAddress(addressId),
            ),
          );
        }),
        
        // Loading state for operations
        if (addressState.isDeleting)
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                const SizedBox(width: AppSpacing.sm),
                B3Regular(
                  text: 'Deleting address...',
                  color: AppColors.brandNeutral600,
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildCreateAddressForm(AddressState addressState) {
    return CreateAddressWidget(
      onCancel: () => setState(() => _showCreateForm = false),
      onAddressCreated: (address) {
        setState(() => _showCreateForm = false);
        widget.onAddressSelected?.call(address);
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Address "${address.name}" created successfully'),
            backgroundColor: Colors.green,
          ),
        );
      },
    );
  }

  void _editAddress(AddressEntity address) {
    // TODO: Implement edit address functionality
    // For now, show a placeholder dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Address'),
        content: const Text('Edit functionality will be implemented in a future update.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _deleteAddress(int addressId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Address'),
        content: const Text('Are you sure you want to delete this address? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(addressNotifierProvider.notifier).deleteAddress(addressId);
              
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Address deleted successfully'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}