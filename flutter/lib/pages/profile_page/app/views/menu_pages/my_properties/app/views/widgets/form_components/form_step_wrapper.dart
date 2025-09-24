import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class FormStepWrapper extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget child;
  final bool isRequired;

  const FormStepWrapper({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
    this.isRequired = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: const BoxDecoration(
              color: AppColors.brandNeutral50,
              border: Border(
                bottom: BorderSide(
                  color: AppColors.brandNeutral200,
                  width: 1,
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: AppColors.brandNeutral800,
                      ),
                    ),
                    if (isRequired)
                      const Text(
                        ' *',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: AppColors.error,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.brandNeutral600,
                  ),
                ),
              ],
            ),
          ),

          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: child,
            ),
          ),
        ],
      ),
    );
  }
}

class FormSection extends StatelessWidget {
  final String title;
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const FormSection({
    super.key,
    required this.title,
    required this.child,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.brandNeutral800,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: padding ?? const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.white,
              border: Border.all(color: AppColors.brandNeutral200),
              borderRadius: BorderRadius.circular(8),
            ),
            child: child,
          ),
        ],
      ),
    );
  }
}

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