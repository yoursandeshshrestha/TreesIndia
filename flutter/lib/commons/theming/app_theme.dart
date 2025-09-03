import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

class AppTheme {
  static final ThemeData lightTheme = ThemeData(
    // Define the default brightness and colors.
    brightness: Brightness.light,
    primaryColor: AppColors.brandPrimary500,

    // Define the default font family.
    fontFamily: 'Montserrat',

    // Define the default `TextTheme`. Use this to specify the default
    // text styling for headlines, titles, bodies of text, and more.
    textTheme: GoogleFonts.montserratTextTheme(),

    // Define button themes
    buttonTheme: const ButtonThemeData(
      buttonColor: AppColors.brandPrimary500,
      textTheme: ButtonTextTheme.primary,
    ),

    // Define checkbox themes
    checkboxTheme: CheckboxThemeData(
      fillColor:
          WidgetStateProperty.all(Colors.transparent), // Transparent fill
      checkColor: WidgetStateProperty.resolveWith<Color>(
        (states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.brandPrimary600;
          }
          return AppColors.brandNeutral700;
        },
      ),
      side: WidgetStateBorderSide.resolveWith(
        (states) => BorderSide(
          color: states.contains(WidgetState.selected)
              ? AppColors.brandPrimary600
              : AppColors.brandNeutral700,
          width: 2.0,
          strokeAlign: BorderSide.strokeAlignOutside, // Outline width
        ),
      ),
    ),

    // Define color scheme
    colorScheme: const ColorScheme.light(
      primary: AppColors.brandPrimary500,
      secondary: AppColors.brandSecondary500,
    )
        .copyWith(secondary: AppColors.brandSecondary500)
        .copyWith(secondary: AppColors.brandSecondary500)
        .copyWith(surface: AppColors.brandNeutral50),
  );
}
