import 'package:flutter/material.dart';
import 'package:trees_india/commons/theming/dashed_border.dart';
import 'package:trees_india/commons/constants/app_colors.dart';

class AppBorders {
  // Simple border with a single color
  static const Border simpleBorder = Border(
    top: BorderSide(color: AppColors.brandNeutral300, width: 1.0),
    bottom: BorderSide(color: AppColors.brandNeutral300, width: 1.0),
  );

  // Method to return a dashed border
  static ShapeBorder dashedBorder({
    double dashWidth = 5.0,
    double dashSpace = 3.0,
    double strokeWidth = 1.0,
    Color color = AppColors.brandSecondary500,
    BorderRadius borderRadius = const BorderRadius.all(Radius.circular(8)),
  }) {
    return DashedBorder(
      dashWidth: dashWidth,
      dashSpace: dashSpace,
      strokeWidth: strokeWidth,
      color: color,
      borderRadius: borderRadius,
    );
  }
}
