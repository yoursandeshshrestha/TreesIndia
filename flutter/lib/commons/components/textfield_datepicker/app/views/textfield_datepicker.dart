import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/theming/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class TextfieldDatepicker extends StatelessWidget {
  final String label;
  final String hintText;
  final DateTime? value;
  final bool isDisabled;
  final ValueChanged<DateTime> onChanged;
  final String dateFormat;

  const TextfieldDatepicker({
    super.key,
    required this.label,
    required this.hintText,
    required this.value,
    required this.onChanged,
    this.isDisabled = false,
    this.dateFormat = 'yyyy-MM-dd',
  });

  String _formatDate(DateTime? date) {
    if (date == null) return '';
    return DateFormat(dateFormat).format(date);
  }

  Future<void> _openPicker(BuildContext context) async {
    final DateTime? picked = await showDialog<DateTime>(
      context: context,
      builder: (BuildContext context) => DatePickerDialog(
        initialDate: value ?? DateTime.now(),
        firstDate: DateTime(1900),
        lastDate: DateTime.now(),
      ),
    );

    if (picked != null) {
      onChanged(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        B3Medium(text: label),
        const SizedBox(height: 8),
        TextFormField(
          controller: TextEditingController(text: _formatDate(value)),
          readOnly: true,
          enabled: !isDisabled,
          onTap: isDisabled ? null : () => _openPicker(context),
          style: TextStyles.b3Medium(
              color: !isDisabled
                  ? AppColors.brandNeutral900
                  : AppColors.brandNeutral500),
          decoration: InputDecoration(
            filled: true,
            fillColor:
                isDisabled ? AppColors.brandNeutral100 : Colors.transparent,
            isCollapsed: true,
            contentPadding: const EdgeInsetsDirectional.symmetric(
              vertical: 12.0,
              horizontal: 16.0,
            ),
            hintText: hintText,
            hintStyle: TextStyles.b3Medium(
              color: AppColors.brandNeutral400,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: const BorderSide(
                color: AppColors.brandNeutral200,
                width: 1.0,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: const BorderSide(
                color: AppColors.brandNeutral200,
                width: 1.0,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: const BorderSide(
                color: AppColors.brandPrimary600,
                width: 1.0,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
              borderSide: const BorderSide(
                color: AppColors.stateRed400,
                width: 1.0,
              ),
            ),
            suffixIcon: const Padding(
              padding: EdgeInsetsDirectional.only(end: 16.0),
              child: Icon(
                Icons.calendar_month,
                size: 18.0,
              ),
            ),
            suffixIconConstraints: const BoxConstraints(
              maxHeight: 18.0,
              maxWidth: 34.0,
            ),
          ),
        ),
      ],
    );
  }
}
