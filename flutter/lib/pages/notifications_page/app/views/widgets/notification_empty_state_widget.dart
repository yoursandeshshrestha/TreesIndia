import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class NotificationEmptyStateWidget extends StatelessWidget {
  const NotificationEmptyStateWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.notifications_none_outlined,
              size: 80,
              color: AppColors.brandNeutral300,
            ),
            const SizedBox(height: AppSpacing.lg),
            H4Bold(
              text: 'No notifications yet',
              color: AppColors.brandNeutral700,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            B2Regular(
              text: 'You\'ll see updates about your bookings, payments, and more here',
              color: AppColors.brandNeutral500,
              textAlign: TextAlign.center,
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }
}