// lib/commons/components/snackbar/presentation/widgets/success_snackbar_widget.dart

import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';
import 'base_snackbar_widget.dart';

class SuccessSnackbarWidget extends BaseSnackbarWidget {
  const SuccessSnackbarWidget({
    required super.message,
    super.icon,
    super.isDismissible,
    super.duration,
    super.key,
    super.margin,
    super.padding,
  });

  @override
  Color getBackgroundColor() => AppColors.stateGreen700;

  @override
  Color getTextColor() => AppColors.stateGreen50;

  @override
  Color getBorderColor() => AppColors.stateGreen700;

  @override
  IconData? getDefaultIcon() => Icons.check;
}
