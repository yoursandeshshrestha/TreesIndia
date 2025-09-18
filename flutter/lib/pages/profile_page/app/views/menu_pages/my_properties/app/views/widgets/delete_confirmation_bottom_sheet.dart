import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class DeleteConfirmationBottomSheet extends StatelessWidget {
  final String propertyTitle;
  final VoidCallback onConfirm;
  final bool isDeleting;

  const DeleteConfirmationBottomSheet({
    super.key,
    required this.propertyTitle,
    required this.onConfirm,
    this.isDeleting = false,
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
            // Drag Handle
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.brandNeutral300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),

            // Warning Icon
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.stateRed50,
                borderRadius: BorderRadius.circular(32),
              ),
              child: const Icon(
                Icons.delete_outline,
                size: 32,
                color: AppColors.stateRed600,
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Title
            H3Bold(
              text: 'Delete Property',
       color: AppColors.brandNeutral900,
              textAlign: TextAlign.center,

            ),

            const SizedBox(height: AppSpacing.sm),

             B2Regular(
              text: 'Are you sure you want to delete "$propertyTitle"? This action cannot be undone.',
              color: AppColors.brandNeutral700,
              textAlign: TextAlign.center,
            ),

            // Description
            // RichText(
            //   textAlign: TextAlign.center,
            //   text: TextSpan(
            //     style: const TextStyle(
            //       fontSize: 16,
            //       color: AppColors.brandNeutral600,
            //       height: 1.5,
            //     ),
            //     children: [
            //       const TextSpan(text: 'Are you sure you want to delete "'),
            //       TextSpan(
            //         text: propertyTitle,
            //         style: const TextStyle(
            //           fontWeight: FontWeight.w600,
            //           color: AppColors.brandNeutral800,
            //         ),
            //       ),
            //       const TextSpan(
            //         text: '"? This action cannot be undone.',
            //       ),
            //     ],
            //   ),
            // ),

            const SizedBox(height: AppSpacing.xl),

            // Action Buttons
            Row(
              children: [
                // Cancel Button
                Expanded(
                  child: OutlinedButton(
                    onPressed: isDeleting ? null : () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.brandNeutral300),
                      foregroundColor: AppColors.brandNeutral700,
                      padding:
                          const EdgeInsets.symmetric(vertical: AppSpacing.md),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      'Cancel',
                      style: TextStyle(
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
                    onPressed: isDeleting ? null : onConfirm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.stateRed600,
                      foregroundColor: AppColors.white,
                      padding:
                          const EdgeInsets.symmetric(vertical: AppSpacing.md),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      disabledBackgroundColor: AppColors.brandNeutral300,
                    ),
                    child: isDeleting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                AppColors.white,
                              ),
                            ),
                          )
                        : const Text(
                            'Delete',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                  ),
                ),
              ],
            ),

            // Bottom padding for safe area
            SizedBox(height: MediaQuery.of(context).padding.bottom),
          ],
        ),
      ),
    );
  }
}
