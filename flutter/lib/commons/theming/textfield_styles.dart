import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/theming/text_styles.dart';
import 'package:flutter/material.dart';

class TextFieldStyles {
  static InputDecoration defaultDecoration(
      {String? hintText,
      TextStyle? hintStyle, // Style for hintText
      IconData? leadingIcon,
      IconData? trailingIcon,
      Color borderColor = AppColors.brandNeutral300, // Default border color
      Color focusedBorderColor =
          AppColors.brandPrimary600, // Focused border color
      EdgeInsetsGeometry contentPadding =
          const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
      double borderRadius = 8.0, // Default border radius
      TextStyle? textStyle, // Style for input text
      String? errorText}) {
    return InputDecoration(
      hintText: hintText,
      errorText: errorText,
      errorStyle: const TextStyle(color: AppColors.stateRed600),
      hintStyle:
          hintStyle ?? TextStyles.b3Medium(color: AppColors.brandNeutral500),
      labelStyle:
          textStyle ?? TextStyles.b3Medium(color: AppColors.brandNeutral900),
      prefixIcon: leadingIcon != null
          ? Container(
              width: 18.0, // Set the desired width of the icon
              height: 18.0, // Set the desired height of the icon
              padding: const EdgeInsets.all(12.0), // Optional padding
              child: Icon(
                leadingIcon,
                size: 18.0,
                color: AppColors.brandNeutral600,
              ),
            )
          : null,
      suffixIcon: trailingIcon != null
          ? Container(
              width: 18.0, // Set the desired width of the icon
              height: 18.0, // Set the desired height of the icon
              padding: const EdgeInsets.all(12.0), // Optional padding
              child: Icon(
                trailingIcon,
                size: 18.0,
                color: AppColors.brandNeutral600,
              ),
            )
          : null,
      contentPadding: contentPadding,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(borderRadius),
        borderSide: BorderSide(
          color: borderColor,
          width: 1.0,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(borderRadius),
        borderSide: BorderSide(
          color: focusedBorderColor,
          width: 2.0, // Slightly thicker for focused state
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(borderRadius),
        borderSide: BorderSide(
          color: borderColor,
          width: 1.0,
        ),
      ),
    );
  }

  static InputDecoration errorDecoration(
      {String? hintText,
      IconData? leadingIcon,
      IconData? trailingIcon,
      double borderRadius = 8.0,
      String? errorText}) {
    return defaultDecoration(
      hintText: hintText,
      leadingIcon: leadingIcon,
      trailingIcon: trailingIcon,
      borderColor: AppColors.stateRed400,
      focusedBorderColor: AppColors.stateRed400,
      borderRadius: borderRadius,
    ).copyWith(
      errorText: errorText,
      errorStyle: const TextStyle(color: AppColors.stateRed600),
    );
  }

  static InputDecoration successDecoration({
    String? hintText,
    IconData? leadingIcon,
    IconData? trailingIcon,
    double borderRadius = 8.0,
  }) {
    return defaultDecoration(
      hintText: hintText,
      leadingIcon: leadingIcon,
      trailingIcon: trailingIcon,
      borderColor: Colors.green,
      focusedBorderColor: Colors.green,
      borderRadius: borderRadius,
    );
  }

  // Add other states like disabled, active, etc., if needed.
}
