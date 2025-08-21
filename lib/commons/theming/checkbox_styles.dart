// lib/commons/theming/checkbox_styles.dart

import 'package:flutter/material.dart'; // This provides everything you need

class CheckboxStyles {
  static BorderSide checkboxBorderSide(
      Color activeColor, Color inactiveColor, bool isChecked) {
    return BorderSide(
      color: isChecked ? activeColor : inactiveColor,
      width: 2,
    );
  }

  static Color checkboxCheckColor(Color activeColor) {
    return activeColor;
  }

  static RoundedRectangleBorder checkboxShape(double borderRadius) {
    return RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(borderRadius),
    );
  }

  static WidgetStateProperty<Color> checkboxFillColor() {
    return WidgetStateProperty.all(
        Colors.transparent); // Ensure the fill color is transparent
  }
}
