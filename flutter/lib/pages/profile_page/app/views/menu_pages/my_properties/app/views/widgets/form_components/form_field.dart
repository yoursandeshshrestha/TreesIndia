import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class FormField extends StatelessWidget {
  final String label;
  final Widget child;
  final bool isRequired;
  final String? helpText;

  const FormField({
    super.key,
    required this.label,
    required this.child,
    this.isRequired = false,
    this.helpText,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.brandNeutral800,
                ),
              ),
              if (isRequired)
                const Text(
                  ' *',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.error,
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          child,
          if (helpText != null) ...[
            const SizedBox(height: AppSpacing.xs),
            Text(
              helpText!,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.brandNeutral500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}