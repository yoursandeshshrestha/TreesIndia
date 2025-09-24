import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';

import '../../providers/vendor_providers.dart';
import '../../states/vendor_form_state.dart';
import 'vendor_form_widget.dart';

class AddVendorBottomSheet extends ConsumerStatefulWidget {
  const AddVendorBottomSheet({super.key});

  @override
  ConsumerState<AddVendorBottomSheet> createState() => _AddVendorBottomSheetState();
}

class _AddVendorBottomSheetState extends ConsumerState<AddVendorBottomSheet> {
  @override
  void initState() {
    super.initState();
    // Reset form when opening
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(vendorFormNotifierProvider.notifier).resetForm();
    });
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(vendorFormNotifierProvider);

    ref.listen<VendorFormState>(vendorFormNotifierProvider, (previous, current) {
      if (current.status == VendorFormStatus.success) {
        // Add the new vendor to the list
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vendor profile created successfully!'),
            backgroundColor: AppColors.stateGreen600,
          ),
        );
        // Refresh the vendor list
        ref.read(myVendorProfilesNotifierProvider.notifier).loadVendors(refresh: true);
      } else if (current.status == VendorFormStatus.failure) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(current.errorMessage ?? 'Failed to create vendor profile'),
            backgroundColor: AppColors.stateRed600,
          ),
        );
      }
    });

    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      margin: const EdgeInsets.only(top: 50),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            width: 36,
            height: 4,
            margin: const EdgeInsets.only(top: 12),
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: AppColors.brandNeutral200,
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: const Icon(
                    Icons.close,
                    size: 24,
                    color: AppColors.brandNeutral700,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      H3Bold(
                        text: 'Add Vendor Profile',
                        color: AppColors.brandNeutral900,
                      ),
                      const SizedBox(height: 4),
                      B3Regular(
                        text: formState.currentStep.subtitle,
                        color: AppColors.brandNeutral600,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Form content
          const Expanded(
            child: VendorFormWidget(),
          ),
        ],
      ),
    );
  }
}