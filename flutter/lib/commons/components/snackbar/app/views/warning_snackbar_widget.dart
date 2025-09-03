// lib/commons/components/snackbar/presentation/widgets/warning_snackbar_widget.dart

import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';
import 'base_snackbar_widget.dart';

class WarningSnackbarWidget extends BaseSnackbarWidget {
  const WarningSnackbarWidget({
    required super.message,
    super.icon,
    super.isDismissible,
    super.duration,
    super.key,
    super.margin,
    super.padding,
  });

  @override
  Color getBackgroundColor() => AppColors.stateRed100;

  @override
  Color getTextColor() => AppColors.stateRed700;

  @override
  IconData? getDefaultIcon() => Icons.warning;

  @override
  Color getBorderColor() => AppColors.stateRed200;
}
