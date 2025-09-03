import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/textfield/app/views/alphabetic_textfield_widget.dart';
import 'package:trees_india/commons/components/textfield/app/views/numeric_textfield_widget.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class ContactInformationWidget extends StatelessWidget {
  final Function(String) onContactPersonChanged;
  final Function(String) onContactPhoneChanged;
  final String? initialContactPerson;
  final String? initialContactPhone;

  const ContactInformationWidget({
    super.key,
    required this.onContactPersonChanged,
    required this.onContactPhoneChanged,
    this.initialContactPerson,
    this.initialContactPhone,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H4Bold(
          text: 'Contact Information',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.md),
        AlphabeticTextfieldWidget(
          onTextChanged: onContactPersonChanged,
          hintText: 'Contact Person Name',
          initialText: initialContactPerson ?? '',
        ),
        const SizedBox(height: AppSpacing.md),
        NumericTextfieldWidget(
          onTextChanged: onContactPhoneChanged,
          hintText: 'Contact Phone',
          initialText: initialContactPhone ?? '',
        ),
      ],
    );
  }
}