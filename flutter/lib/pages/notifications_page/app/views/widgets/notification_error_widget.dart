import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class NotificationErrorWidget extends StatelessWidget {
  final String error;
  final VoidCallback? onRetry;

  const NotificationErrorWidget({
    super.key,
    required this.error,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 80,
              color: AppColors.stateRed400,
            ),
            const SizedBox(height: AppSpacing.lg),
            H4Bold(
              text: 'Something went wrong',
              color: AppColors.brandNeutral700,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            B2Regular(
              text: error,
              color: AppColors.brandNeutral500,
              textAlign: TextAlign.center,
              maxLines: 3,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: AppSpacing.lg),
              ElevatedButton(
                onPressed: onRetry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brandPrimary600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xl,
                    vertical: AppSpacing.md,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: B2Bold(
                  text: 'Try again',
                  color: Colors.white,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}