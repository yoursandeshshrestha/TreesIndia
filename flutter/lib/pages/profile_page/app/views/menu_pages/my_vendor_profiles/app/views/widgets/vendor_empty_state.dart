import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';

class VendorEmptyState extends StatelessWidget {
  const VendorEmptyState({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Empty state icon
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.brandNeutral50,
                borderRadius: BorderRadius.circular(60),
              ),
              child: const Icon(
                Icons.business_outlined,
                size: 60,
                color: AppColors.brandNeutral400,
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Title
            H3Bold(
              text: 'No Vendor Profiles Yet',
              color: AppColors.brandNeutral900,
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: AppSpacing.sm),

            // Subtitle
            B2Regular(
              text: 'Create your first vendor profile to start showcasing your business and connecting with potential customers.',
              color: AppColors.brandNeutral600,
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: AppSpacing.xl),

            // Illustration or additional info
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.brandPrimary50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.brandPrimary200,
                  width: 1,
                ),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.lightbulb_outline,
                        size: 16,
                        color: AppColors.brandPrimary600,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      B3Bold(
                        text: 'Get started by:',
                        color: AppColors.brandPrimary700,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _buildTip('• Adding your business information'),
                  _buildTip('• Uploading your business gallery'),
                  _buildTip('• Listing your services and expertise'),
                  _buildTip('• Setting up your contact details'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTip(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: AppSpacing.lg, bottom: 4),
      child: Align(
        alignment: Alignment.centerLeft,
        child: B4Regular(
          text: text,
          color: AppColors.brandPrimary600,
        ),
      ),
    );
  }
}