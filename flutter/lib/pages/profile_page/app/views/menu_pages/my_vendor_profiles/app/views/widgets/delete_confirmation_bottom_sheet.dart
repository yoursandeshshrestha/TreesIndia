import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class DeleteConfirmationBottomSheet extends StatelessWidget {
  final String vendorName;
  final VoidCallback onConfirm;
  final bool isDeleting;

  const DeleteConfirmationBottomSheet({
    super.key,
    required this.vendorName,
    required this.onConfirm,
    required this.isDeleting,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [

             Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.brandNeutral300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Icon
            Container(
              width: 60,
              height: 60,
              decoration: const BoxDecoration(
                color: AppColors.stateRed100,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.delete_outline,
                size: 30,
                color: AppColors.stateRed600,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Title
            H3Bold(
              text: 'Delete Vendor Profile',
              color: AppColors.brandNeutral900,
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: AppSpacing.sm),

            // Message
            B2Regular(
              text: 'Are you sure you want to delete "$vendorName"? This action cannot be undone.',
              color: AppColors.brandNeutral700,
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: AppSpacing.xl),

            // Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButtonWidget(
                    label: 'Cancel',
                    labelColor: AppColors.brandNeutral700,
                    borderColor: AppColors.brandNeutral700,
                    onPressed: isDeleting ? null : () => Navigator.pop(context),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: SolidButtonWidget(
                    label: 'Delete',
                    backgroundColor: AppColors.stateRed600,
                    isLoading: isDeleting,
                    onPressed: isDeleting ? null : onConfirm,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}