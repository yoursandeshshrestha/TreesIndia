import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/textfield/app/views/alphabetic_textfield_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class ServiceDetailsWidget extends StatelessWidget {
  final Function(String) onDescriptionChanged;
  final Function(String) onSpecialInstructionsChanged;

  const ServiceDetailsWidget({
    super.key,
    required this.onDescriptionChanged,
    required this.onSpecialInstructionsChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H4Bold(
          text: 'Service Details (Optional)',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.md),
        AlphabeticTextfieldWidget(
          onTextChanged: onDescriptionChanged,
          hintText: 'Service Description (Optional)',
        ),
        const SizedBox(height: AppSpacing.md),
        AlphabeticTextfieldWidget(
          onTextChanged: onSpecialInstructionsChanged,
          hintText: 'Special Instructions (Optional)',
        ),
      ],
    );
  }
}