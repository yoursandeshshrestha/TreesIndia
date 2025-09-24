import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/theming/text_styles.dart';

class WorkerFormField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String hint;
  final bool isRequired;
  final int maxLines;
  final TextInputType? keyboardType;
  final Function(String)? onChanged;
  final String? errorText;
  final bool readOnly;
  final Widget? suffixIcon;
  final VoidCallback? onTap;
  final bool enabled;

  const WorkerFormField({
    super.key,
    required this.controller,
    required this.label,
    required this.hint,
    this.isRequired = false,
    this.maxLines = 1,
    this.keyboardType,
    this.onChanged,
    this.errorText,
    this.readOnly = false,
    this.suffixIcon,
    this.onTap,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            B3Bold(
              text: label,
              color: enabled ? AppColors.brandNeutral800 : AppColors.brandNeutral400,
            ),
            if (isRequired)
              const Text(
                ' *',
                style: TextStyle(color: AppColors.stateRed600),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          onChanged: onChanged,
          readOnly: readOnly,
          onTap: onTap,
          enabled: enabled,
          style: TextStyles.b3Medium(
            color: enabled ? AppColors.brandNeutral900 : AppColors.brandNeutral400,
          ),
          onTapOutside: (_) => FocusScope.of(context).unfocus(),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyles.b3Medium(color: AppColors.brandNeutral400),
            suffixIcon: suffixIcon,
            errorText: errorText,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: errorText != null ? AppColors.stateRed600 : AppColors.brandNeutral200,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: errorText != null ? AppColors.stateRed600 : AppColors.brandNeutral200,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: errorText != null ? AppColors.stateRed600 : AppColors.stateGreen500,
              ),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.brandNeutral200),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.stateRed600),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.stateRed600),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            filled: !enabled,
            fillColor: !enabled ? AppColors.brandNeutral100 : Colors.transparent,
          ),
        ),
      ],
    );
  }
}